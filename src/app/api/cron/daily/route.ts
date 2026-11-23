import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchJobsFromSource } from "@/lib/ats/detector";
import { evaluateJobCompliance, aggregateScanAudit } from "@/lib/rules/engine";
import { createChainedAuditSnapshot } from "@/lib/vault/hash-chain";
import { dispatchComplianceAlert } from "@/lib/email/dispatcher";

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "paylit-dev-cron-secret-2026";

    // Allow in development or when secret matches Bearer token
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    const activeMonitors = await prisma.companyMonitor.findMany({
      where: { active: true },
    });

    const resultsSummary: any[] = [];

    for (const monitor of activeMonitors) {
      try {
        const { jobs, atsType } = await fetchJobsFromSource(monitor.careersUrl);
        const audits = jobs.map((j) => evaluateJobCompliance(j));
        const totals = aggregateScanAudit(audits);

        const scanRun = await prisma.scanRun.create({
          data: {
            monitorId: monitor.id,
            sourceUrl: monitor.careersUrl,
            atsType,
            status: "completed",
            finishedAt: new Date(),
            jobsFound: totals.jobsFound,
            regulatedJobs: totals.regulatedJobs,
            violations: totals.violations,
            complianceScore: totals.complianceScore,
            fineLow: totals.fineLow,
            fineHigh: totals.fineHigh,
          },
        });

        // Store results
        for (const res of audits) {
          await prisma.jobAuditResult.create({
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

        // Chained snapshot
        const snapshot = await createChainedAuditSnapshot({
          scanRunId: scanRun.id,
          monitorId: monitor.id,
          payload: {
            scanRunId: scanRun.id,
            monitorName: monitor.name,
            complianceScore: totals.complianceScore,
            violations: totals.violations,
            exposure: `$${totals.fineLow.toLocaleString("en-US")} – $${totals.fineHigh.toLocaleString("en-US")}`,
          },
        });

        // Dispatch alert if violations are present
        const nonCompliantJobs = audits.filter((a) => a.severity !== "pass");
        if (nonCompliantJobs.length > 0) {
          let recipients: string[] = [];
          try {
            recipients = JSON.parse(monitor.alertEmails);
          } catch {
            recipients = [monitor.ownerEmail];
          }

          const criticalList = nonCompliantJobs.slice(0, 5).map((j) => ({
            title: j.title,
            location: j.location,
            violation: j.reasons[0] || "Statutory pay disclosure missing",
          }));

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

          await dispatchComplianceAlert({
            monitorId: monitor.id,
            scanRunId: scanRun.id,
            companyName: monitor.name,
            violationsFound: totals.violations,
            fineExposure: `$${totals.fineLow.toLocaleString("en-US")} – $${totals.fineHigh.toLocaleString("en-US")}`,
            criticalJobs: criticalList,
            reportUrl: `${baseUrl}/report/${scanRun.publicToken}`,
            recipients,
          });
        }

        resultsSummary.push({
          monitorId: monitor.id,
          name: monitor.name,
          jobsFound: totals.jobsFound,
          violations: totals.violations,
          score: totals.complianceScore,
          snapshotSha256: snapshot.sha256,
        });
      } catch (err: any) {
        resultsSummary.push({
          monitorId: monitor.id,
          name: monitor.name,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      monitorsProcessed: activeMonitors.length,
      results: resultsSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Daily cron error" }, { status: 500 });
  }
}
