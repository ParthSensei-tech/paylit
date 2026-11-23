import { NextRequest, NextResponse } from "next/server";
import { ScanRequestSchema, checkScanRateLimit } from "@/lib/validation";
import { validateUrlForSsrf } from "@/lib/ssrf";
import { fetchJobsFromSource, detectAtsType } from "@/lib/ats/detector";
import { evaluateJobCompliance, aggregateScanAudit } from "@/lib/rules/engine";
import { prisma } from "@/lib/prisma";
import { createChainedAuditSnapshot } from "@/lib/vault/hash-chain";
import { upsertCompanyFromScan } from "@/lib/companies/index-data";

export async function POST(req: NextRequest) {
  try {
    // 1. IP Rate Limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const rateCheck = checkScanRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many scan requests from this IP. Please wait a minute." },
        { status: 429 }
      );
    }

    // 2. Body Validation
    const body = await req.json();
    const parsed = ScanRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Invalid input." },
        { status: 400 }
      );
    }

    const { url, monitorId } = parsed.data;

    // 3. SSRF Safe URL Check
    const ssrfCheck = await validateUrlForSsrf(url);
    if (!ssrfCheck.valid || !ssrfCheck.normalizedUrl) {
      return NextResponse.json(
        { error: ssrfCheck.error || "The provided URL is not accessible or points to a restricted target." },
        { status: 400 }
      );
    }

    const targetUrl = ssrfCheck.normalizedUrl;
    const detected = detectAtsType(targetUrl);

    // 4. Create pending ScanRun
    const scanRun = await prisma.scanRun.create({
      data: {
        monitorId: monitorId || null,
        sourceUrl: targetUrl,
        atsType: detected.atsType,
        status: "running",
        startedAt: new Date(),
      },
    });

    // 5. Ingest job postings
    let ingestedJobs: any[] = [];
    try {
      const fetchResult = await fetchJobsFromSource(targetUrl);
      ingestedJobs = fetchResult.jobs;
    } catch (ingestErr: any) {
      await prisma.scanRun.update({
        where: { id: scanRun.id },
        data: {
          status: "failed",
          finishedAt: new Date(),
        },
      });
      return NextResponse.json(
        { error: `Failed to fetch careers postings: ${ingestErr.message || "Unknown network error"}` },
        { status: 502 }
      );
    }

    // If no jobs could be discovered
    if (ingestedJobs.length === 0) {
      const finishedAt = new Date();
      await prisma.scanRun.update({
        where: { id: scanRun.id },
        data: {
          status: "completed",
          finishedAt,
          jobsFound: 0,
          complianceScore: 100,
        },
      });

      return NextResponse.json({
        scanId: scanRun.id,
        publicToken: scanRun.publicToken,
        jobsFound: 0,
        message: "No open job postings discovered at this URL.",
      });
    }

    // 6. Evaluate all jobs deterministically with rule engine
    const auditResults = ingestedJobs.map((job) => evaluateJobCompliance(job));
    const totals = aggregateScanAudit(auditResults);
    const finishedAt = new Date();

    // 7. Persist JobAuditResults in transaction or bulk create
    await prisma.$transaction(async (tx) => {
      for (const res of auditResults) {
        await tx.jobAuditResult.create({
          data: {
            scanRunId: scanRun.id,
            externalId: res.externalId,
            title: res.title,
            location: res.location,
            jurisdictions: JSON.stringify(res.jurisdictions),
            rawText: res.rawText,
            salaryMin: res.salaryMin,
            salaryMax: res.salaryMax,
            currency: res.currency,
            period: res.period,
            spreadRatio: res.spreadRatio,
            checks: JSON.stringify(res.checks),
            violationCodes: JSON.stringify(res.violationCodes),
            severity: res.severity,
            fineLow: res.fineLow,
            fineHigh: res.fineHigh,
            suggestedClause: res.suggestedClause,
          },
        });
      }

      await tx.scanRun.update({
        where: { id: scanRun.id },
        data: {
          status: "completed",
          finishedAt,
          jobsFound: totals.jobsFound,
          regulatedJobs: totals.regulatedJobs,
          violations: totals.violations,
          complianceScore: totals.complianceScore,
          fineLow: totals.fineLow,
          fineHigh: totals.fineHigh,
        },
      });
    });

    // 8. Create Tamper-Proof Chained AuditSnapshot
    const snapshotPayload = {
      scanRunId: scanRun.id,
      sourceUrl: targetUrl,
      atsType: detected.atsType,
      jobsFound: totals.jobsFound,
      regulatedJobs: totals.regulatedJobs,
      violations: totals.violations,
      complianceScore: totals.complianceScore,
      fineExposure: `$${totals.fineLow.toLocaleString("en-US")} – $${totals.fineHigh.toLocaleString("en-US")}`,
      timestamp: finishedAt.toISOString(),
    };

    const snapshot = await createChainedAuditSnapshot({
      scanRunId: scanRun.id,
      monitorId: monitorId || null,
      payload: snapshotPayload,
    });

    // Loop 1: Automatic State Pay Transparency Index Profile Publishing
    await upsertCompanyFromScan({
      scanRunId: scanRun.id,
      sourceUrl: targetUrl,
      atsType: detected.atsType,
      totals,
      auditResults,
    });

    // Track analytics event
    await prisma.eventLog.create({
      data: {
        eventType: "scan_started",
        metadata: JSON.stringify({ scanRunId: scanRun.id, atsType: detected.atsType, jobsFound: totals.jobsFound }),
      },
    });

    return NextResponse.json({
      success: true,
      scanId: scanRun.id,
      publicToken: scanRun.publicToken,
      totals,
      snapshotSha256: snapshot.sha256,
    });
  } catch (error: any) {
    console.error("[Scan API Error]", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during compliance scan." },
      { status: 500 }
    );
  }
}
