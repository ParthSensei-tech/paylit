import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Removing all seeded demo data for production deployment...");

  const deletedJobs = await prisma.jobAuditResult.deleteMany({});
  const deletedSnapshots = await prisma.auditSnapshot.deleteMany({});
  const deletedAlerts = await prisma.alertEvent.deleteMany({});
  const deletedScans = await prisma.scanRun.deleteMany({});
  const deletedMonitors = await prisma.companyMonitor.deleteMany({});
  const deletedEvents = await prisma.eventLog.deleteMany({});

  console.log("Deleted seeded records:");
  console.log(`- JobAuditResult: ${deletedJobs.count}`);
  console.log(`- AuditSnapshot: ${deletedSnapshots.count}`);
  console.log(`- AlertEvent: ${deletedAlerts.count}`);
  console.log(`- ScanRun: ${deletedScans.count}`);
  console.log(`- CompanyMonitor: ${deletedMonitors.count}`);
  console.log(`- EventLog: ${deletedEvents.count}`);
  console.log("\nDatabase is now 100% clean, initialized, and ready for real production client ingestion.");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error cleaning seed data:", err);
  process.exit(1);
});
