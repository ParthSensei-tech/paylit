import React from "react";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch latest scan run and its results
  const latestScan = await prisma.scanRun.findFirst({
    orderBy: { startedAt: "desc" },
    include: {
      results: {
        orderBy: [{ severity: "desc" }, { fineHigh: "desc" }],
      },
      monitor: true,
    },
  });

  // Calculate historical remediations (Fix-to-green loop)
  const allScans = await prisma.scanRun.findMany({
    orderBy: { startedAt: "asc" },
    select: { violations: true, fineHigh: true, complianceScore: true },
  });

  let violationsPrevented = 0;
  let exposureAvoided = 0;
  if (allScans.length >= 2) {
    const first = allScans[0];
    const latest = allScans[allScans.length - 1];
    violationsPrevented = Math.max(0, first.violations - latest.violations);
    exposureAvoided = Math.max(0, first.fineHigh - latest.fineHigh);
  }

  return (
    <DashboardClient
      initialScan={latestScan as any}
      violationsPrevented={violationsPrevented}
      exposureAvoided={exposureAvoided}
    />
  );
}
