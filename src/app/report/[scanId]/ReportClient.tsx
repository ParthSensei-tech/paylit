"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Mail,
  Copy,
  Check,
  FileCheck,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface JobItem {
  id: string;
  externalId: string;
  title: string;
  location: string;
  jurisdictions: string;
  rawText: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  period: string;
  spreadRatio: number | null;
  checks: string;
  violationCodes: string;
  severity: "pass" | "warning" | "violation";
  fineLow: number;
  fineHigh: number;
  suggestedClause: string | null;
}

interface ScanReport {
  id: string;
  publicToken: string;
  sourceUrl: string;
  atsType: string;
  startedAt: string;
  jobsFound: number;
  regulatedJobs: number;
  violations: number;
  complianceScore: number;
  fineLow: number;
  fineHigh: number;
  results: JobItem[];
  monitor?: {
    name: string;
  };
  auditSnapshots?: {
    sha256: string;
  }[];
}

export default function ReportClient({ scan }: { scan: ScanReport }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);
  const [copiedSlack, setCopiedSlack] = useState(false);
  const [showExecutivePack, setShowExecutivePack] = useState(false);

  const companyName = scan.monitor?.name || "Corporate Employer";
  const headline = `${companyName}: ${scan.violations} of ${scan.jobsFound} postings need attention`;

  // Top 2 violations in full; remainder locked & blurred
  const flaggedJobs = scan.results.filter((j) => j.severity !== "pass");
  const top2Violations = flaggedJobs.slice(0, 2);
  const lockedViolations = flaggedJobs.slice(2);
  const compliantJobs = scan.results.filter((j) => j.severity === "pass");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyClause = (clause: string, id: string) => {
    navigator.clipboard.writeText(clause);
    setCopiedClauseId(id);
    setTimeout(() => setCopiedClauseId(null), 2000);
  };

  const chroMailto = `mailto:?subject=${encodeURIComponent(
    `[Paylit Audit] ${companyName} Hiring Disclosure Compliance Report`
  )}&body=${encodeURIComponent(
    `Hi,\n\nI reviewed our careers board (${scan.sourceUrl}) on Paylit's statutory pay-transparency compliance scanner.\n\nKey Findings:\n• Compliance Score: ${scan.complianceScore}%\n• Postings Flagged: ${scan.violations} of ${scan.jobsFound}\n• Potential Regulatory Fine Exposure: $${scan.fineLow.toLocaleString("en-US")} – $${scan.fineHigh.toLocaleString("en-US")}\n\nYou can review the full findings and cryptographic audit seal here:\n${typeof window !== "undefined" ? window.location.href : ""}\n\nAutomated screening aid, not legal advice.`
  )}`;

  const slackSnippet = `🚨 *Pay-Transparency Compliance Audit: ${companyName}*
• *Compliance Score*: ${scan.complianceScore}/100
• *Postings Flagged*: ${scan.violations} of ${scan.jobsFound} listings require statutory revision
• *Potential Fine Exposure*: $${scan.fineLow.toLocaleString("en-US")} – $${scan.fineHigh.toLocaleString("en-US")}
• *Key Mandates Evaluated*: CA SB 1162, NY § 194-b, CO EPEWA, WA RCW 49.58, IL HB 3129
👉 *Review Audit Findings & Remediated Clauses*: ${typeof window !== "undefined" ? window.location.href : "https://paylit.dev/report/" + scan.id}`;

  const handleCopySlack = () => {
    navigator.clipboard.writeText(slackSnippet);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Top Brand Bar */}
      <header className="border-b border-brand-hairline bg-brand-subtle py-4 px-6 sm:px-12 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-ink">
          Pay<span className="text-brand">lit</span>
          <span className="ml-2 text-[10px] font-mono tracking-widest uppercase text-ink-muted">
            AUDIT REPORT
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/report/${scan.publicToken}/cert`}
            target="_blank"
            className="text-xs text-brand border border-brand/30 bg-white hover:bg-brand-subtle px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Official Certificate</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-white bg-brand hover:bg-brand-hover px-4 py-1.5 rounded transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        {/* Company Header */}
        <div className="space-y-3 border-b border-brand-hairline pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono tracking-wider uppercase text-brand font-semibold">
              STATUTORY COMPLIANCE AUDIT
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="text-xs text-ink-muted hover:text-ink border border-brand-hairline px-3 py-1.5 rounded flex items-center gap-1.5 bg-white"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-status-pass" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied" : "Share Report"}</span>
              </button>
              <a
                href={chroMailto}
                className="text-xs text-brand border border-brand-hairline px-3 py-1.5 rounded flex items-center gap-1.5 bg-white hover:bg-brand-subtle"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send this to your CHRO</span>
              </a>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink leading-tight">
            {headline}
          </h1>

          <p className="text-xs text-ink-muted flex flex-wrap items-center gap-3">
            <span>Source: <a href={scan.sourceUrl} target="_blank" rel="noreferrer" className="underline">{scan.sourceUrl}</a></span>
            <span>•</span>
            <span>ATS: {scan.atsType.toUpperCase()}</span>
            <span>•</span>
            <span>Audit Date: {new Date(scan.startedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </p>
        </div>

        {/* 3 Overview Score Numerals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-brand-hairline pb-8 text-center sm:text-left">
          <div className="p-6 bg-brand-subtle border border-brand-hairline rounded">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider block">
              Compliance Score
            </span>
            <div className="mt-2 font-serif text-5xl font-bold text-ink tabular-nums">
              {scan.complianceScore}%
            </div>
            <p className="text-[11px] text-ink-light mt-1">
              Based on active US & EU statutory rules
            </p>
          </div>

          <div className="p-6 bg-white border border-brand-hairline rounded">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider block">
              Positions Flagged
            </span>
            <div className="mt-2 font-serif text-5xl font-bold text-status-violation tabular-nums">
              {scan.violations}
            </div>
            <p className="text-[11px] text-ink-light mt-1">
              Out of {scan.jobsFound} open job listings ({scan.regulatedJobs} regulated)
            </p>
          </div>

          <div className="p-6 bg-brand-subtle border border-brand-hairline rounded">
            <span className="text-xs font-medium text-ink-muted uppercase tracking-wider block">
              Statutory Fine Exposure
            </span>
            <div className="mt-2 font-serif text-3xl font-bold text-ink tabular-nums">
              ${scan.fineLow.toLocaleString("en-US")} – ${scan.fineHigh.toLocaleString("en-US")}
            </div>
            <p className="text-[11px] text-ink-light mt-1">
              Civil liability under CA, NY, CO, WA, IL statutes
            </p>
          </div>
        </div>

        {/* LOOP 3: Executive Forwarding & CHRO Slack/Email Pack */}
        <div className="bg-[#1A0F12] text-white rounded-xl p-6 sm:p-8 space-y-5 shadow-lg border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#FF4D6D] font-semibold">
                Executive Action Pack
              </span>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-white">
                Forward Findings to General Counsel &amp; CHRO
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/report/${scan.publicToken}/cert`}
                target="_blank"
                className="px-3.5 py-2 bg-white text-[#1A0F12] rounded text-xs font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <FileCheck className="w-3.5 h-3.5 text-brand" />
                <span>Export Executive 1-Pager (PDF)</span>
              </Link>
            </div>
          </div>

          <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
            Equip executive leadership and talent acquisition with immediate, actionable context before statutory labor audits occur. Choose a pre-formatted format below:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Action 1: Email Briefing */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF4D6D] uppercase">
                  <Mail className="w-4 h-4" />
                  <span>1-Click Email Briefing</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Pre-composed formal email draft addressed to internal counsel summarizing total fine exposure and public audit findings.
                </p>
              </div>
              <a
                href={chroMailto}
                className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium text-center transition-colors border border-white/20 inline-flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Open Pre-Drafted Email</span>
              </a>
            </div>

            {/* Action 2: Slack / Teams Channel Snippet */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#FF4D6D] uppercase">
                  <Copy className="w-4 h-4" />
                  <span>Slack / Teams Channel Snippet</span>
                </div>
                <p className="text-xs text-neutral-400">
                  Formatted Markdown snippet ready to paste directly into <code className="text-[#FF4D6D]">#talent-acquisition</code> or <code className="text-[#FF4D6D]">#legal</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopySlack}
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-white rounded text-xs font-medium text-center transition-colors inline-flex items-center justify-center gap-2 shadow"
              >
                {copiedSlack ? <Check className="w-3.5 h-3.5 text-status-pass" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSlack ? "Copied Markdown to Clipboard!" : "Copy Slack / Teams Snippet"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top 2 Violations in Full Detail */}
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">
              Priority Violations Identified
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Full statutory analysis and ATS remediation clauses for the highest-exposure postings.
            </p>
          </div>

          <div className="space-y-6">
            {top2Violations.map((job, idx) => {
              const jurisdictions = JSON.parse(job.jurisdictions || "[]");
              const checks = JSON.parse(job.checks || "[]");
              return (
                <div
                  key={job.id}
                  className="p-6 border-2 border-brand/20 bg-white rounded-lg shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-hairline pb-3">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase text-brand font-semibold">
                        FLAGGED POSTING #{idx + 1}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-ink">{job.title}</h3>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {job.location} • Applicable Jurisdictions: {jurisdictions.join(", ")}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-status-violation block">
                        Exposure: ${job.fineLow.toLocaleString("en-US")} – ${job.fineHigh.toLocaleString("en-US")}
                      </span>
                      <span className="text-[10px] text-ink-light">Per statutory occurrence</span>
                    </div>
                  </div>

                  {/* Rule Checklist */}
                  <div className="space-y-2">
                    {checks.map((chk: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded text-xs border ${
                          chk.passed
                            ? "bg-status-passBg/30 border-status-passBorder text-ink"
                            : "bg-status-violationBg/40 border-status-violationBorder text-status-violation"
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5">
                            {chk.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-status-pass" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-status-violation" />
                            )}
                            {chk.name}
                          </span>
                          <span className="font-mono text-[10px]">{chk.citation}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-ink-muted font-normal">{chk.details}</p>
                        {chk.officialSourceUrl && (
                          <div className="mt-2 pt-1.5 border-t border-brand-hairline/60 flex flex-wrap items-center justify-between gap-1 text-[10px]">
                            <span className="text-ink-muted font-sans">
                              Agency: <strong>{chk.governingAgency || "State Labor Enforcement"}</strong>
                            </span>
                            <a
                              href={chk.officialSourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand font-mono font-semibold underline flex items-center gap-1 hover:text-brand-hover"
                            >
                              <span>Official Primary Source ({chk.officialSourceUrl.includes(".gov") ? ".gov" : ".europa.eu"})</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Suggested Compliant Clause */}
                  {job.suggestedClause && (
                    <div className="pt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-ink uppercase tracking-wider">
                          Statutory Fix (Paste into ATS)
                        </span>
                        <button
                          onClick={() => handleCopyClause(job.suggestedClause!, job.id)}
                          className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1"
                        >
                          {copiedClauseId === job.id ? (
                            <Check className="w-3.5 h-3.5 text-status-pass" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedClauseId === job.id ? "Copied!" : "Copy Clause"}</span>
                        </button>
                      </div>
                      <div className="p-3 bg-brand-subtle border border-brand-hairline rounded font-mono text-xs text-ink whitespace-pre-wrap">
                        {job.suggestedClause}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Locked Remaining Violations (Teaser Rows with Blurred Remediation) */}
        {lockedViolations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-ink">
                  Additional Flagged Positions ({lockedViolations.length} Locked)
                </h3>
                <p className="text-xs text-ink-muted">
                  Full disclosure analysis and copy-ready clauses unlocked with monitoring trial.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-brand-subtle border border-brand-hairline text-brand text-xs font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </span>
            </div>

            <div className="border border-brand-hairline rounded overflow-hidden divide-y divide-brand-hairline">
              {lockedViolations.map((job) => (
                <div key={job.id} className="p-4 bg-brand-subtle/30 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-ink">{job.title}</h4>
                    <p className="text-xs text-ink-muted">{job.location} • {JSON.parse(job.jurisdictions || "[]").join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="filter blur-sm select-none font-mono text-xs text-ink-light hidden sm:inline">
                      $120,000 – $165,000 /year + benefits disclosure
                    </span>
                    <Link
                      href="/dashboard"
                      className="text-xs text-brand font-semibold hover:underline flex items-center gap-1"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Unlock Clause</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Primary CTA (Hick's Law) */}
        <div className="p-8 sm:p-10 bg-brand text-white rounded-xl text-center space-y-4 shadow-lg">
          <span className="text-xs font-mono uppercase tracking-widest text-white/80">
            CONTINUOUS STATUTORY PROTECTION
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Stop checking manually. Start monitoring automatically.
          </h2>
          <p className="text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
            Paylit tracks every recruiter edit, new job posting, and state law change with daily hash-chained proof for counsel.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand font-bold text-sm rounded shadow hover:bg-brand-subtle transition-transform hover:scale-[1.02]"
            >
              <span>Start 14-Day Free Monitoring Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-[11px] text-white/70">
            No credit card required. Connect Greenhouse, Lever, or Ashby in 60 seconds.
          </p>
        </div>

        {/* Statutory Legal Disclaimer Notice */}
        <div className="pt-6 border-t border-brand-hairline text-center text-xs text-ink-light space-y-1">
          <p>Automated screening aid, not legal advice.</p>
          <p className="text-[11px]">
            Paylit is an automated auditing engine designed to assist internal talent and legal operations. Consult qualified employment counsel regarding statutory jurisdictional exposures.
          </p>
        </div>
      </main>
    </div>
  );
}
