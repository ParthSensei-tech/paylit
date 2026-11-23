import React from "react";
import { prisma } from "@/lib/prisma";
import { verifyAuditChain } from "@/lib/vault/hash-chain";
import AuditLogsClient from "./AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const snapshots = await prisma.auditSnapshot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      scanRun: true,
      monitor: true,
    },
  });

  const chainVerification = await verifyAuditChain();

  return (
    <AuditLogsClient
      snapshots={snapshots as any}
      chainVerification={chainVerification}
    />
  );
}
