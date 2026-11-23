import React from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReportClient from "./ReportClient";

export const dynamic = "force-dynamic";

interface Props {
  params: { scanId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const scanRun = await prisma.scanRun.findFirst({
    where: {
      OR: [{ id: params.scanId }, { publicToken: params.scanId }],
    },
    include: { monitor: true },
  });

  if (!scanRun) {
    return { title: "Compliance Report — Paylit" };
  }

  const company = scanRun.monitor?.name || "Target Careers Board";
  return {
    title: `${company}: Pay-Transparency Compliance Audit Report — Paylit`,
    description: `${company} Compliance Score: ${scanRun.complianceScore}%. ${scanRun.violations} of ${scanRun.jobsFound} postings flagged for pay disclosure violations. Estimated fine exposure: $${scanRun.fineLow.toLocaleString("en-US")} – $${scanRun.fineHigh.toLocaleString("en-US")}.`,
    openGraph: {
      title: `${company}: ${scanRun.violations} of ${scanRun.jobsFound} postings need pay transparency attention`,
      description: `Regulatory compliance audit: ${scanRun.complianceScore}% score. Exposure: $${scanRun.fineLow.toLocaleString("en-US")} – $${scanRun.fineHigh.toLocaleString("en-US")}.`,
    },
  };
}

export default async function ReportPage({ params }: Props) {
  const scanRun = await prisma.scanRun.findFirst({
    where: {
      OR: [{ id: params.scanId }, { publicToken: params.scanId }],
    },
    include: {
      results: {
        orderBy: [{ severity: "desc" }, { fineHigh: "desc" }],
      },
      monitor: true,
      auditSnapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!scanRun) {
    notFound();
  }

  return <ReportClient scan={scanRun as any} />;
}
