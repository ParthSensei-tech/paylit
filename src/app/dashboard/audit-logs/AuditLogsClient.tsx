"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  FileCheck,
  GitCommit,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers,
} from "lucide-react";

interface SnapshotItem {
  id: string;
  scanRunId: string;
  monitorId: string | null;
  createdAt: string;
  payload: string;
  sha256: string;
  previousSha256: string | null;
  scanRun: {
    id: string;
    publicToken: string;
    jobsFound: number;
    violations: number;
    complianceScore: number;
    fineLow: number;
    fineHigh: number;
  };
  monitor?: {
    name: string;
  };
}

export default function AuditLogsClient({
  snapshots,
  chainVerification,
}: {
  snapshots: SnapshotItem[];
  chainVerification: { valid: boolean; total: number };
}) {
  const [diffScanA, setDiffScanA] = useState<string>(snapshots[0]?.scanRunId || "");
  const [diffScanB, setDiffScanB] = useState<string>(snapshots[1]?.scanRunId || snapshots[0]?.scanRunId || "");

  const itemA = snapshots.find((s) => s.scanRunId === diffScanA);
  const itemB = snapshots.find((s) => s.scanRunId === diffScanB);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-brand-hairline pb-4 gap-2">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            Immutable Compliance Audit Vault
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Tamper-proof, append-only cryptographic ledger of all corporate hiring disclosures.
          </p>
        </div>

        {/* Cryptographic Chain Integrity Badge */}
        <div className="flex items-center gap-2">
          {chainVerification.valid ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-status-passBg border border-status-passBorder text-status-pass text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>SHA-256 Chain Verified ({chainVerification.total} Snapshots)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-status-violationBg border border-status-violationBorder text-status-violation text-xs font-semibold">
              <Lock className="w-4 h-4" />
              <span>Chain Integrity Warning</span>
            </div>
          )}
        </div>
      </div>

      {/* Audit Vault Lock-in Banner */}
      <div className="p-4 bg-brand-subtle border border-brand-hairline rounded flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lock className="w-4 h-4 text-brand" />
          <span className="text-xs text-ink font-medium">
            Active Vault Coverage since <strong>November 1, 2026</strong>. Continuity ensures tamper-evident audit defense for regulatory inquiries.
          </span>
        </div>
        <span className="text-[11px] font-mono text-ink-muted">SHA-256 Merkle-Style Sequence</span>
      </div>

      {/* Snapshot Diffing Inspector */}
      {snapshots.length >= 2 && (
        <div className="p-6 bg-white border border-brand-hairline rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand" />
              Scan Snapshot Diff Inspector
            </h3>
            <span className="text-xs text-ink-muted">Compare remediation progress across scan runs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-ink-muted mb-1">Baseline Scan (Earlier)</label>
              <select
                value={diffScanB}
                onChange={(e) => setDiffScanB(e.target.value)}
                className="w-full text-xs border border-brand-hairline rounded p-2 outline-none focus:border-brand"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.scanRunId}>
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} — Score {s.scanRun.complianceScore}% ({s.scanRun.violations} violations)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-ink-muted mb-1">Target Scan (Recent)</label>
              <select
                value={diffScanA}
                onChange={(e) => setDiffScanA(e.target.value)}
                className="w-full text-xs border border-brand-hairline rounded p-2 outline-none focus:border-brand"
              >
                {snapshots.map((s) => (
                  <option key={s.id} value={s.scanRunId}>
                    {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} — Score {s.scanRun.complianceScore}% ({s.scanRun.violations} violations)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {itemA && itemB && (
            <div className="pt-4 border-t border-brand-hairline grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-brand-subtle rounded border border-brand-hairline">
                <span className="text-[11px] text-ink-muted uppercase">Score Delta</span>
                <p className="font-serif text-2xl font-bold mt-1 text-ink tabular-nums">
                  {itemA.scanRun.complianceScore - itemB.scanRun.complianceScore >= 0 ? "+" : ""}
                  {itemA.scanRun.complianceScore - itemB.scanRun.complianceScore}%
                </p>
                <span className="text-[10px] text-ink-light">
                  {itemB.scanRun.complianceScore}% → {itemA.scanRun.complianceScore}%
                </span>
              </div>

              <div className="p-3 bg-brand-subtle rounded border border-brand-hairline">
                <span className="text-[11px] text-ink-muted uppercase">Violations Resolved</span>
                <p className="font-serif text-2xl font-bold mt-1 text-status-pass tabular-nums">
                  {Math.max(0, itemB.scanRun.violations - itemA.scanRun.violations)}
                </p>
                <span className="text-[10px] text-ink-light">
                  {itemB.scanRun.violations} down to {itemA.scanRun.violations}
                </span>
              </div>

              <div className="p-3 bg-brand-subtle rounded border border-brand-hairline">
                <span className="text-[11px] text-ink-muted uppercase">Exposure Reduced</span>
                <p className="font-serif text-2xl font-bold mt-1 text-status-pass tabular-nums">
                  ${Math.max(0, itemB.scanRun.fineHigh - itemA.scanRun.fineHigh).toLocaleString("en-US")}
                </p>
                <span className="text-[10px] text-ink-light">Statutory risk mitigated</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Immutable Hash-Chained Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
          Chain History & Certificate Exports ({snapshots.length} Sealed Records)
        </h3>

        {snapshots.length === 0 ? (
          <div className="p-8 text-center bg-white border border-dashed border-brand-hairline rounded-lg space-y-3">
            <p className="font-serif text-lg font-bold text-ink">No Sealed Audit Snapshots Yet</p>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Your organization&apos;s SHA-256 cryptographic genesis block will be sealed on your first compliance scan. Once sealed, snapshot records are permanent and append-only.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-hover shadow-sm"
            >
              Run First Compliance Scan
            </Link>
          </div>
        ) : (
          <div className="border border-brand-hairline rounded overflow-hidden">
            <table className="ruled-table text-left">
              <thead>
                <tr className="bg-brand-subtle">
                  <th>Timestamp</th>
                  <th>Snapshot SHA-256 Digest</th>
                  <th>Previous Hash (Parent)</th>
                  <th>Score</th>
                  <th>Postings Scanned</th>
                  <th className="text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-hairline text-xs font-mono">
                {snapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-brand-subtle/50 transition-colors font-sans">
                    <td className="text-ink-muted text-[11px]">
                      {new Date(snap.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <span className="font-mono text-[11px] text-brand bg-brand-subtle px-2 py-0.5 rounded border border-brand-hairline" title={snap.sha256}>
                        {snap.sha256.slice(0, 16)}...
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-[11px] text-ink-light" title={snap.previousSha256 || "GENESIS"}>
                        {snap.previousSha256 ? `${snap.previousSha256.slice(0, 12)}...` : "GENESIS"}
                      </span>
                    </td>
                    <td className="tabular-nums font-semibold text-ink">
                      {snap.scanRun.complianceScore}%
                    </td>
                    <td className="text-ink-muted">
                      {snap.scanRun.jobsFound} jobs ({snap.scanRun.violations} flagged)
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/report/${snap.scanRun.publicToken}/cert`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-brand border border-brand-hairline rounded bg-white hover:bg-brand-subtle transition-colors font-sans"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Download Certificate</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
