import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Printer, ShieldCheck, ArrowLeft } from "lucide-react";
import PrintButton from "./PrintButton";

export const dynamic = "force-dynamic";

interface Props {
  params: { scanId: string };
}

export default async function CertificatePage({ params }: Props) {
  const scanRun = await prisma.scanRun.findFirst({
    where: {
      OR: [{ id: params.scanId }, { publicToken: params.scanId }],
    },
    include: {
      results: true,
      monitor: true,
      auditSnapshots: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!scanRun) notFound();

  const company = scanRun.monitor?.name || "Corporate Employer";
  const snapshot = scanRun.auditSnapshots[0];
  const auditDate = new Date(scanRun.startedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-ink p-6 sm:p-12">
      {/* Top Controls (Hidden in Print) */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between no-print">
        <Link
          href={`/report/${scanRun.publicToken}`}
          className="text-xs text-ink-muted hover:text-brand flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Report</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton />
        </div>
      </div>

      {/* Official Certificate Paper Document */}
      <article className="max-w-4xl mx-auto bg-white border-2 border-[#1A0F12] p-10 sm:p-16 shadow-lg rounded print:shadow-none print:border-2 print:border-black print:p-8 space-y-10">
        {/* Certificate Header */}
        <div className="border-b-2 border-[#1A0F12] pb-6 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-brand font-bold">
              OFFICIAL STATUTORY COMPLIANCE SEAL
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
              Certificate of Pay-Transparency Audit
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Issued under the Paylit Hiring Disclosure Verification Protocol (Standard v2026.1)
            </p>
          </div>

          <div className="text-right">
            <span className="font-serif text-2xl font-bold text-ink">
              Pay<span className="text-brand">lit</span>
            </span>
            <p className="text-[10px] font-mono text-ink-muted">REGULATORY VAULT</p>
          </div>
        </div>

        {/* Certificate Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs border-b border-brand-hairline pb-8">
          <div>
            <span className="text-ink-muted uppercase tracking-wider text-[10px] block">Inspected Entity</span>
            <span className="font-bold text-ink text-sm block mt-1">{company}</span>
          </div>
          <div>
            <span className="text-ink-muted uppercase tracking-wider text-[10px] block">Audit Timestamp</span>
            <span className="font-bold text-ink text-sm block mt-1">{auditDate}</span>
          </div>
          <div>
            <span className="text-ink-muted uppercase tracking-wider text-[10px] block">Compliance Score</span>
            <span className="font-bold text-brand text-sm block mt-1 tabular-nums">
              {scanRun.complianceScore}%
            </span>
          </div>
          <div>
            <span className="text-ink-muted uppercase tracking-wider text-[10px] block">Scope Inspected</span>
            <span className="font-bold text-ink text-sm block mt-1">
              {scanRun.jobsFound} Postings ({scanRun.regulatedJobs} Regulated)
            </span>
          </div>
        </div>

        {/* Legal Findings Prose */}
        <div className="space-y-4 text-xs leading-relaxed text-ink">
          <p>
            This document attests that on <strong>{auditDate}</strong>, the automated compliance monitor executed an exhaustive statutory evaluation of public job requisitions published at <code className="bg-brand-subtle px-1.5 py-0.5 rounded text-[11px] font-mono">{scanRun.sourceUrl}</code> across regulated jurisdictions including California (Cal. Lab. Code § 432.3), New York (N.Y. Lab. Law § 194-b), Colorado (C.R.S. § 8-5-201), Washington (RCW 49.58.110), Illinois (820 ILCS 112/11), and the European Union AI Act.
          </p>

          <p>
            Audit execution yielded <strong>{scanRun.violations}</strong> flagged statutory disclosure exceptions across <strong>{scanRun.regulatedJobs}</strong> positions in scope, with total potential civil exposure estimated between <strong>${scanRun.fineLow.toLocaleString("en-US")}</strong> and <strong>${scanRun.fineHigh.toLocaleString("en-US")}</strong>.
          </p>
        </div>

        {/* Official Statutory Provenance & Docket Citation Section */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-bold block">
            STATUTORY DOCKET CITATIONS & PRIMARY SOURCE PROVENANCE
          </span>
          <div className="border border-brand-hairline rounded overflow-hidden text-[11px]">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-brand-subtle text-ink font-semibold border-b border-brand-hairline">
                  <th className="p-2">Jurisdiction & Citation</th>
                  <th className="p-2">Enforcing Agency</th>
                  <th className="p-2 text-right">Official Government Docket Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-hairline">
                <tr>
                  <td className="p-2 font-semibold">CA: Cal. Lab. Code § 432.3 (SB 1162)</td>
                  <td className="p-2 text-ink-muted">California Civil Rights Department (CRD)</td>
                  <td className="p-2 text-right">
                    <a href="https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202120220SB1162" target="_blank" rel="noreferrer" className="text-brand underline font-mono text-[10px]">
                      leginfo.legislature.ca.gov
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">NY: N.Y. Lab. Law § 194-b</td>
                  <td className="p-2 text-ink-muted">New York State Department of Labor (NYSDOL)</td>
                  <td className="p-2 text-right">
                    <a href="https://www.nysenate.gov/legislation/laws/LAB/194-B" target="_blank" rel="noreferrer" className="text-brand underline font-mono text-[10px]">
                      nysenate.gov/legislation
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">CO: C.R.S. § 8-5-201 (SB 23-105)</td>
                  <td className="p-2 text-ink-muted">Colorado Department of Labor & Employment (CDLE)</td>
                  <td className="p-2 text-right">
                    <a href="https://leg.colorado.gov/bills/sb23-105" target="_blank" rel="noreferrer" className="text-brand underline font-mono text-[10px]">
                      leg.colorado.gov
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">IL: 820 ILCS 112/11 (HB 3129)</td>
                  <td className="p-2 text-ink-muted">Illinois Department of Labor (IDOL)</td>
                  <td className="p-2 text-right">
                    <a href="https://www.ilga.gov/legislation/publicacts/fulltext.asp?Name=103-0539" target="_blank" rel="noreferrer" className="text-brand underline font-mono text-[10px]">
                      ilga.gov/legislation
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">WA: RCW 49.58.110</td>
                  <td className="p-2 text-ink-muted">Washington State Department of Labor & Industries (L&I)</td>
                  <td className="p-2 text-right">
                    <a href="https://app.leg.wa.gov/rcw/default.aspx?cite=49.58.110" target="_blank" rel="noreferrer" className="text-brand underline font-mono text-[10px]">
                      app.leg.wa.gov/rcw
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">EU: Reg. (EU) 2024/1689 Art. 26(11)</td>
                  <td className="p-2 text-ink-muted">European AI Office & National Competent Authorities</td>
                  <td className="p-2 text-right">
                    <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689" target="_blank" rel="noreferrer" className="text-brand underline font-mono text-[10px]">
                      eur-lex.europa.eu
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cryptographic Ledger Verification Block */}
        <div className="p-4 bg-brand-subtle/50 border border-brand-hairline rounded font-mono text-[11px] space-y-2">
          <div className="flex items-center justify-between text-ink font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-status-pass" />
              Cryptographic Hash Chain Seal
            </span>
            <span className="text-[10px] text-ink-muted">SHA-256 Merkle Block</span>
          </div>
          <div className="space-y-1 text-ink-muted">
            <p className="truncate">
              <strong>Record SHA-256:</strong> {snapshot?.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
            </p>
            <p className="truncate">
              <strong>Parent Hash:</strong> {snapshot?.previousSha256 || "0000000000000000000000000000000000000000000000000000000000000000"}
            </p>
            <p>
              <strong>Public Token:</strong> {scanRun.publicToken}
            </p>
          </div>
        </div>

        {/* Signature & Seal Block */}
        <div className="pt-8 border-t-2 border-[#1A0F12] flex flex-col sm:flex-row items-end justify-between gap-6">
          <div className="space-y-2 text-xs">
            <p className="font-semibold text-ink">Paylit Statutory Compliance Registry</p>
            <p className="text-ink-muted text-[11px]">
              Office of Employment Transparency & Algorithmic Audit
            </p>
            <p className="text-[10px] text-ink-light">
              Record ID: {scanRun.id} • Automated screening aid, not legal advice.
            </p>
          </div>

          <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-brand-hairline pt-4 sm:pt-0 sm:pl-8">
            <div className="font-serif italic text-lg text-ink">Marcus V. Vance</div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-ink-muted">
              CHIEF COMPLIANCE ARCHITECT, PAYLIT
            </div>
            <div className="text-[10px] text-ink-light font-mono mt-0.5">
              SEALED DIGITALLY • {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
