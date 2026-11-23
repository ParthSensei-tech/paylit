import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function sha256(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

async function main() {
  console.log("Seeding Paylit database with demo monitor and historical scans...");

  // Clean existing seed data
  await prisma.jobAuditResult.deleteMany({});
  await prisma.auditSnapshot.deleteMany({});
  await prisma.alertEvent.deleteMany({});
  await prisma.scanRun.deleteMany({});
  await prisma.companyMonitor.deleteMany({});
  await prisma.eventLog.deleteMany({});

  // 1. Create Demo Monitor
  const monitor = await prisma.companyMonitor.create({
    data: {
      name: "Acme Cloud Technologies",
      ownerEmail: "counsel@acmecloud.example",
      careersUrl: "https://boards.greenhouse.io/acmecloud",
      atsType: "greenhouse",
      schedule: "daily",
      alertEmails: JSON.stringify(["counsel@acmecloud.example", "vp-hr@acmecloud.example"]),
      webhookUrl: "https://api.acmecloud.example/webhooks/compliance",
      active: true,
    },
  });

  console.log(`Created Monitor: ${monitor.name} (${monitor.id})`);

  let previousHash = "0000000000000000000000000000000000000000000000000000000000000000";

  // Scan 1: 14 days ago (Severe non-compliance)
  const scan1Date = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const scan1 = await prisma.scanRun.create({
    data: {
      monitorId: monitor.id,
      sourceUrl: monitor.careersUrl,
      atsType: "greenhouse",
      status: "completed",
      startedAt: scan1Date,
      finishedAt: new Date(scan1Date.getTime() + 18000),
      jobsFound: 24,
      regulatedJobs: 18,
      violations: 11,
      complianceScore: 42,
      fineLow: 14000,
      fineHigh: 72000,
      publicToken: "acme-scan-historical-01",
    },
  });

  const snap1Payload = JSON.stringify({ scanRunId: scan1.id, score: 42, violations: 11, exposure: "$14,000 – $72,000" });
  const hash1 = sha256(`${previousHash}|${scan1.id}|${snap1Payload}|${scan1Date.toISOString()}`);
  await prisma.auditSnapshot.create({
    data: {
      scanRunId: scan1.id,
      monitorId: monitor.id,
      createdAt: scan1Date,
      payload: snap1Payload,
      sha256: hash1,
      previousSha256: previousHash,
    },
  });
  previousHash = hash1;

  // Scan 2: 7 days ago (Partial remediation)
  const scan2Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const scan2 = await prisma.scanRun.create({
    data: {
      monitorId: monitor.id,
      sourceUrl: monitor.careersUrl,
      atsType: "greenhouse",
      status: "completed",
      startedAt: scan2Date,
      finishedAt: new Date(scan2Date.getTime() + 15000),
      jobsFound: 26,
      regulatedJobs: 20,
      violations: 6,
      complianceScore: 68,
      fineLow: 8000,
      fineHigh: 35000,
      publicToken: "acme-scan-historical-02",
    },
  });

  const snap2Payload = JSON.stringify({ scanRunId: scan2.id, score: 68, violations: 6, exposure: "$8,000 – $35,000" });
  const hash2 = sha256(`${previousHash}|${scan2.id}|${snap2Payload}|${scan2Date.toISOString()}`);
  await prisma.auditSnapshot.create({
    data: {
      scanRunId: scan2.id,
      monitorId: monitor.id,
      createdAt: scan2Date,
      payload: snap2Payload,
      sha256: hash2,
      previousSha256: previousHash,
    },
  });
  previousHash = hash2;

  // Scan 3: Today (Latest scan)
  const scan3Date = new Date();
  const scan3 = await prisma.scanRun.create({
    data: {
      monitorId: monitor.id,
      sourceUrl: monitor.careersUrl,
      atsType: "greenhouse",
      status: "completed",
      startedAt: scan3Date,
      finishedAt: new Date(scan3Date.getTime() + 16000),
      jobsFound: 28,
      regulatedJobs: 22,
      violations: 3,
      complianceScore: 86,
      fineLow: 3000,
      fineHigh: 18000,
      publicToken: "acme-scan-latest-03",
    },
  });

  const snap3Payload = JSON.stringify({ scanRunId: scan3.id, score: 86, violations: 3, exposure: "$3,000 – $18,000" });
  const hash3 = sha256(`${previousHash}|${scan3.id}|${snap3Payload}|${scan3Date.toISOString()}`);
  await prisma.auditSnapshot.create({
    data: {
      scanRunId: scan3.id,
      monitorId: monitor.id,
      createdAt: scan3Date,
      payload: snap3Payload,
      sha256: hash3,
      previousSha256: previousHash,
    },
  });

  // Seed sample jobs for the latest scan (3)
  const sampleJobs = [
    {
      scanRunId: scan3.id,
      externalId: "acme-job-101",
      title: "Senior Infrastructure Engineer (Kubernetes)",
      location: "San Francisco, CA",
      jurisdictions: JSON.stringify(["CA"]),
      rawText: "We are seeking a Senior Infrastructure Engineer to scale our multi-region Kubernetes clusters. Competitive equity and salary.",
      salaryMin: null,
      salaryMax: null,
      currency: "USD",
      period: "annual",
      spreadRatio: null,
      checks: JSON.stringify([
        {
          code: "MISSING_SALARY_RANGE",
          name: "Mandatory Base Pay Scale Disclosure",
          passed: false,
          citation: "Cal. Lab. Code § 432.3",
          details: "No numerical base salary or wage scale was found in this posting.",
          fineLow: 1000,
          fineHigh: 10000,
        },
      ]),
      violationCodes: JSON.stringify(["MISSING_SALARY_RANGE"]),
      severity: "violation",
      fineLow: 1000,
      fineHigh: 10000,
      suggestedClause:
        "Compensation & Statutory Disclosure for Senior Infrastructure Engineer (Kubernetes):\n• Base Pay Range: $165,000 – $225,000 /year. Starting pay is determined by job-related knowledge, skills, experience, and geographic location.\n• Benefits: Comprehensive healthcare coverage (medical, dental, vision), 401(k) matching, and paid time off.\n• Notice to Applicants: Paylit verified compliance disclosure. Equal Opportunity Employer.",
    },
    {
      scanRunId: scan3.id,
      externalId: "acme-job-102",
      title: "Enterprise Account Executive",
      location: "New York, NY",
      jurisdictions: JSON.stringify(["NY"]),
      rawText: "Expected base compensation: $70,000 – $210,000 per year plus uncapped commission and full medical benefits.",
      salaryMin: 70000,
      salaryMax: 210000,
      currency: "USD",
      period: "annual",
      spreadRatio: 2.0,
      checks: JSON.stringify([
        {
          code: "EXCESSIVE_SPREAD",
          name: "Good-Faith Pay Scale Spread Limit",
          passed: false,
          citation: "N.Y. Lab. Law § 194-b",
          details: "The high-end of the band ($210,000) exceeds the low-end ($70,000) by 200%. Regulatory guidance caps acceptable spread at 60%.",
          fineLow: 1000,
          fineHigh: 5000,
        },
      ]),
      violationCodes: JSON.stringify(["EXCESSIVE_SPREAD"]),
      severity: "violation",
      fineLow: 1000,
      fineHigh: 5000,
      suggestedClause:
        "Compensation & Statutory Disclosure for Enterprise Account Executive:\n• Base Pay Range: $100,000 – $145,000 /year + performance commission. Starting base pay reflects regional market conditions and demonstrated quota history.\n• Benefits: Comprehensive health, dental, and vision insurance, 401(k) plan, and unlimited PTO.\n• Notice to Applicants: Paylit verified compliance disclosure. Equal Opportunity Employer.",
    },
    {
      scanRunId: scan3.id,
      externalId: "acme-job-103",
      title: "Solutions Architect - Federal",
      location: "Denver, CO",
      jurisdictions: JSON.stringify(["CO"]),
      rawText: "Target salary: $145,000 - $185,000 per year.",
      salaryMin: 145000,
      salaryMax: 185000,
      currency: "USD",
      period: "annual",
      spreadRatio: 0.276,
      checks: JSON.stringify([
        {
          code: "MISSING_BENEFITS_DISCLOSURE",
          name: "Mandatory Benefits & Bonus Overview",
          passed: false,
          citation: "C.R.S. § 8-5-201 (Colorado Equal Pay)",
          details: "Colorado statute mandates a general description of all employment benefits, retirement plans, and bonus opportunities.",
          fineLow: 500,
          fineHigh: 2500,
        },
      ]),
      violationCodes: JSON.stringify(["MISSING_BENEFITS_DISCLOSURE"]),
      severity: "warning",
      fineLow: 500,
      fineHigh: 2500,
      suggestedClause:
        "Compensation & Statutory Disclosure for Solutions Architect - Federal:\n• Base Pay Range: $145,000 – $185,000 /year. Starting pay is determined by relevant clearance level and experience.\n• Benefits & Incentive Compensation: In accordance with statutory requirements (CO Equal Pay for Equal Work Act), full-time employees are eligible for comprehensive medical, dental, and vision insurance, 401(k) retirement plan with employer matching, generous paid time off (PTO), paid parental leave, and eligibility for an annual performance-based discretionary bonus.\n• Notice to Applicants: Paylit verified compliance disclosure. Equal Opportunity Employer.",
    },
    {
      scanRunId: scan3.id,
      externalId: "acme-job-104",
      title: "Lead Frontend Engineer (Design Systems)",
      location: "Remote - US",
      jurisdictions: JSON.stringify(["REMOTE_US", "CA", "NY", "CO", "WA", "IL"]),
      rawText:
        "Annual salary range: $155,000 - $195,000 per year. Comprehensive medical, dental, and vision health coverage, 401k employer match, and flexible PTO.",
      salaryMin: 155000,
      salaryMax: 195000,
      currency: "USD",
      period: "annual",
      spreadRatio: 0.258,
      checks: JSON.stringify([
        {
          code: "SALARY_RANGE_PRESENT",
          name: "Mandatory Base Pay Scale Disclosure",
          passed: true,
          citation: "Statutory Range Compliance",
          details: "Disclosed range: $155,000 to $195,000 (annual).",
          fineLow: 0,
          fineHigh: 0,
        },
        {
          code: "GOOD_FAITH_SPREAD",
          name: "Good-Faith Pay Scale Spread Limit",
          passed: true,
          citation: "Regulatory Guidance",
          details: "Spread ratio is 26%, within acceptable 60% threshold.",
          fineLow: 0,
          fineHigh: 0,
        },
        {
          code: "BENEFITS_DISCLOSED",
          name: "Mandatory Benefits & Bonus Overview",
          passed: true,
          citation: "C.R.S. § 8-5-201; 820 ILCS 112/11",
          details: "Sufficient health, 401(k), and paid leave disclosures detected.",
          fineLow: 0,
          fineHigh: 0,
        },
      ]),
      violationCodes: JSON.stringify([]),
      severity: "pass",
      fineLow: 0,
      fineHigh: 0,
      suggestedClause: "",
    },
    {
      scanRunId: scan3.id,
      externalId: "acme-job-105",
      title: "Staff Security Researcher",
      location: "Seattle, WA",
      jurisdictions: JSON.stringify(["WA"]),
      rawText:
        "Base pay range: $180,000 – $230,000 per year. Benefits include full medical, dental, life insurance, 401(k) matching, and annual incentive equity.",
      salaryMin: 180000,
      salaryMax: 230000,
      currency: "USD",
      period: "annual",
      spreadRatio: 0.278,
      checks: JSON.stringify([
        {
          code: "SALARY_RANGE_PRESENT",
          name: "Mandatory Base Pay Scale Disclosure",
          passed: true,
          citation: "RCW 49.58.110",
          details: "Disclosed range: $180,000 to $230,000 (annual).",
          fineLow: 0,
          fineHigh: 0,
        },
      ]),
      violationCodes: JSON.stringify([]),
      severity: "pass",
      fineLow: 0,
      fineHigh: 0,
      suggestedClause: "",
    },
  ];

  for (const job of sampleJobs) {
    await prisma.jobAuditResult.create({ data: job });
  }

  // Create initial EventLogs for traction tracking
  await prisma.eventLog.createMany({
    data: [
      { eventType: "scan_started", metadata: JSON.stringify({ source: "cron", monitorId: monitor.id }) },
      { eventType: "report_viewed", metadata: JSON.stringify({ scanRunId: scan3.id }) },
      { eventType: "clause_copied", metadata: JSON.stringify({ jobId: "acme-job-101", state: "CA" }) },
    ],
  });

  console.log("Seeding complete! 1 monitor, 3 scans, 3 chained audit snapshots, and 5 job audit results created.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
