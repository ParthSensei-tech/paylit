import crypto from "crypto";
import { prisma } from "../prisma";

export interface CreateSnapshotInput {
  scanRunId: string;
  monitorId?: string | null;
  payload: Record<string, any>;
}

export function computeSha256(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

/**
 * Creates an append-only AuditSnapshot linked to the previous snapshot's SHA-256 hash.
 */
export async function createChainedAuditSnapshot(input: CreateSnapshotInput) {
  // Find the latest snapshot in the system to chain with
  const lastSnapshot = await prisma.auditSnapshot.findFirst({
    orderBy: { createdAt: "desc" },
    select: { sha256: true },
  });

  const previousSha256 = lastSnapshot ? lastSnapshot.sha256 : "0000000000000000000000000000000000000000000000000000000000000000";
  const payloadString = JSON.stringify(input.payload);
  const timestamp = new Date().toISOString();

  // Seal: hash of (previousSha256 + scanRunId + payloadString + timestamp)
  const sealContent = `${previousSha256}|${input.scanRunId}|${payloadString}|${timestamp}`;
  const sha256 = computeSha256(sealContent);

  const snapshot = await prisma.auditSnapshot.create({
    data: {
      scanRunId: input.scanRunId,
      monitorId: input.monitorId || null,
      payload: payloadString,
      sha256,
      previousSha256,
    },
  });

  return snapshot;
}

/**
 * Verifies the integrity of the whole snapshot chain
 */
export async function verifyAuditChain(): Promise<{ valid: boolean; total: number; compromisedId?: string }> {
  const snapshots = await prisma.auditSnapshot.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (snapshots.length === 0) return { valid: true, total: 0 };

  for (let i = 0; i < snapshots.length; i++) {
    const current = snapshots[i];
    if (i === 0) {
      if (current.previousSha256 !== "0000000000000000000000000000000000000000000000000000000000000000") {
        return { valid: false, total: snapshots.length, compromisedId: current.id };
      }
    } else {
      const prev = snapshots[i - 1];
      if (current.previousSha256 !== prev.sha256) {
        return { valid: false, total: snapshots.length, compromisedId: current.id };
      }
    }
  }

  return { valid: true, total: snapshots.length };
}
