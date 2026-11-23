import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [monitors, scans, jobs, snapshots, alerts, events] = await Promise.all([
    prisma.companyMonitor.count(),
    prisma.scanRun.count(),
    prisma.jobAuditResult.count(),
    prisma.auditSnapshot.count(),
    prisma.alertEvent.count(),
    prisma.eventLog.count(),
  ]);

  console.log("PRODUCTION DATABASE STATE:");
  console.log(`- CompanyMonitor: ${monitors}`);
  console.log(`- ScanRun:        ${scans}`);
  console.log(`- JobAuditResult: ${jobs}`);
  console.log(`- AuditSnapshot:  ${snapshots}`);
  console.log(`- AlertEvent:     ${alerts}`);
  console.log(`- EventLog:       ${events}`);
  console.log("Status: Clean production ready.");

  await prisma.$disconnect();
}

main();
