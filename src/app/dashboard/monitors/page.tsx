import React from "react";
import { prisma } from "@/lib/prisma";
import MonitorsClient from "./MonitorsClient";

export const dynamic = "force-dynamic";

export default async function MonitorsPage() {
  const monitors = await prisma.companyMonitor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      scanRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
      },
    },
  });

  return <MonitorsClient initialMonitors={monitors as any} />;
}
