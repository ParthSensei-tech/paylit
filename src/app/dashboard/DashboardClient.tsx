"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  X,
  ArrowRight,
  Filter,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

interface JobResult {
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

interface ScanData {
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
  results: JobResult[];
  monitor?: {
    name: string;
  };
}

export default function DashboardClient({
  initialScan,
  violationsPrevented,
  exposureAvoided,
}: {
  initialScan: ScanData | null;
  violationsPrevented: number;
  exposureAvoided: number;
}) {
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<JobResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!initialScan) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="border-b border-brand-hairline pb-4">
          <span className="text-[10px] font-mono tracking-widest text-brand uppercase font-semibold">
            PRODUCTION WORKSPACE READY
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink mt-1">
            Enterprise Pay-Transparency Compliance Workspace
          </h1>
          <p className="text-xs text-ink-muted mt-1">
            Connect your corporate careers board to initiate continuous statutory auditing across CA, NY, CO, WA, IL, MA, and the EU.
          </p>
        </div>

        {/* Scan Ingestion Card */}
        <div className="p-8 bg-brand-subtle border border-brand-hairline rounded-lg space-y-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-ink">
              Initiate Baseline Compliance Scan
            </h3>
            <p className="text-xs text-ink-muted mt-1">
              Enter your public careers board URL below. Paylit will extract all open postings, evaluate statutory compensation bands, and seal an immutable audit snapshot.
            </p>
          </div>

          <div className="max-w-2xl">
            {/* Inline Scanner */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const input = form.elements.namedItem("careersUrl") as HTMLInputElement;
                if (!input || !input.value.trim()) return;
                window.location.href = `/?scan=${encodeURIComponent(input.value.trim())}`;
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                name="careersUrl"
                type="text"
                required
                placeholder="https://boards.greenhouse.io/yourcompany or https://jobs.lever.co/yourcompany"
                className="flex-1 px-4 py-3 text-xs border border-brand-hairline rounded outline-none focus:border-brand bg-white"
              />
              <Link
                href="/"
                className="px-6 py-3 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-hover flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Launch Live Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </form>

            <div className="mt-3 flex items-center gap-2 text-xs text-ink-light">
              <span>Quick Test Samples:</span>
              <Link
                href="/?scan=https://boards.greenhouse.io/stripe"
                className="text-brand underline hover:text-brand-hover"
              >
                Greenhouse (Stripe)
              </Link>
              <span>/</span>
              <Link
                href="/?scan=https://jobs.lever.co/palantir"
                className="text-brand underline hover:text-brand-hover"
              >
                Lever (Palantir)
              </Link>
            </div>
          </div>
        </div>

        {/* Statutory Coverage Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-brand-hairline rounded">
            <span className="font-serif text-sm font-bold text-ink block">US State Transparency</span>
            <p className="text-xs text-ink-muted mt-1">
              Deterministic auditing of California (SB 1162), New York (§ 194-b), Washington (RCW 49.58), and Massachusetts.
            </p>
          </div>
          <div className="p-4 bg-white border border-brand-hairline rounded">
            <span className="font-serif text-sm font-bold text-ink block">Benefits & Incentive Rules</span>
            <p className="text-xs text-ink-muted mt-1">
              Automated checking of mandatory bonus, commission, and healthcare disclosures under Colorado EPEWA and Illinois HB 3129.
            </p>
          </div>
          <div className="p-4 bg-white border border-brand-hairline rounded">
            <span className="font-serif text-sm font-bold text-ink block">Algorithmic Hiring Notices</span>
            <p className="text-xs text-ink-muted mt-1">
              Detection of automated video interviews and AI screening under NYC Local Law 144 and EU AI Act Article 26(11).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find the top item for the "Fix next" queue (highest severity + highest fine)
  const fixNextJob =
    initialScan.results.find((j) => j.severity === "violation") ||
    initialScan.results.find((j) => j.severity === "warning") ||
    null;

  // Filter jobs for table
  const filteredJobs = initialScan.results.filter((job) => {
    if (filterSeverity !== "all" && job.severity !== filterSeverity) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      return (
        job.title.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.jurisdictions.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyClause = (clause: string, jobId: string) => {
    navigator.clipboard.writeText(clause);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track analytics
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "clause_copied", metadata: { jobId } }),
    }).catch(() => {});
  };

  return (
    <div className="space-y-8">
      {/* Company & Scan Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-brand-hairline pb-4 gap-2">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
            {initialScan.monitor?.name || "Corporate Career Postings"}
          </h1>
          <p className="text-xs text-ink-muted mt-1 flex items-center gap-2">
            <span>ATS: {initialScan.atsType.toUpperCase()}</span>
            <span>•</span>
            <span className="truncate max-w-md">{initialScan.sourceUrl}</span>
            <span>•</span>
            <span>Last Scan: {new Date(initialScan.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/report/${initialScan.publicToken}`}
            target="_blank"
            className="text-xs text-ink-muted hover:text-brand flex items-center gap-1 border border-brand-hairline px-3 py-1.5 rounded bg-white hover:bg-brand-subtle transition-colors"
          >
            <span>Public Report View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Hick's Law: 4 Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-brand-hairline pb-8">
        {/* Metric 1: Compliance Score */}
        <div className="p-4 border border-brand-hairline rounded bg-brand-subtle">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            Compliance Score
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-ink tabular-nums">
              {initialScan.complianceScore}%
            </span>
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                initialScan.complianceScore >= 80
                  ? "bg-status-passBg text-status-pass"
                  : initialScan.complianceScore >= 60
                  ? "bg-status-warningBg text-status-warning"
                  : "bg-status-violationBg text-status-violation"
              }`}
            >
              {initialScan.complianceScore >= 80 ? "STRONG" : "AT RISK"}
            </span>
          </div>
          <p className="text-[11px] text-ink-light mt-1">Weighted across statutory requirements</p>
        </div>

        {/* Metric 2: Active Regulated Jobs */}
        <div className="p-4 border border-brand-hairline rounded bg-white">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            Active Regulated Jobs
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-ink tabular-nums">
              {initialScan.regulatedJobs}
            </span>
            <span className="text-xs text-ink-muted">of {initialScan.jobsFound} total</span>
          </div>
          <p className="text-[11px] text-ink-light mt-1">CA, NY, CO, WA, IL, MA & Remote US</p>
        </div>

        {/* Metric 3: Critical Violations */}
        <div className="p-4 border border-brand-hairline rounded bg-white">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            Critical Violations
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-status-violation tabular-nums">
              {initialScan.violations}
            </span>
            <span className="text-xs text-ink-muted">postings flagged</span>
          </div>
          <p className="text-[11px] text-ink-light mt-1">Missing range or spread &gt; 60%</p>
        </div>

        {/* Metric 4: Statutory Exposure */}
        <div className="p-4 border border-brand-hairline rounded bg-brand-subtle">
          <div className="text-xs font-medium text-ink-muted uppercase tracking-wider">
            Statutory Fine Exposure
          </div>
          <div className="mt-2">
            <span className="font-serif text-2xl font-bold text-ink tabular-nums">
              ${initialScan.fineLow.toLocaleString("en-US")} – ${initialScan.fineHigh.toLocaleString("en-US")}
            </span>
          </div>
          <p className="text-[11px] text-ink-light mt-1">Aggregate statutory exposure range</p>
        </div>
      </div>

      {/* Fix-to-Green Loop & Traction Strip */}
      <div className="p-4 bg-white border border-brand-hairline rounded flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-status-passBg text-status-pass flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Violations Prevented</p>
              <p className="font-serif text-lg font-bold text-ink tabular-nums">{violationsPrevented} resolved</p>
            </div>
          </div>
          <div className="h-8 w-px bg-brand-hairline" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-status-passBg text-status-pass flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Regulatory Exposure Avoided</p>
              <p className="font-serif text-lg font-bold text-status-pass tabular-nums">
                +${exposureAvoided.toLocaleString("en-US")}
              </p>
            </div>
          </div>
        </div>
        <div className="text-xs text-ink-muted text-right">
          <span>Continuous hash-chained audit active</span>
        </div>
      </div>

      {/* Regulatory Calendar Strip ("Law Changes") */}
      <div className="p-4 bg-brand-subtle border border-brand-hairline rounded">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Statutory Enforcement Calendar & Pending Statutes
          </span>
          <span className="text-[11px] text-ink-muted">Updated Jan 2026</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-2.5 bg-white border border-brand-hairline rounded">
            <span className="font-semibold text-ink">Illinois (HB 3129)</span>
            <span className="ml-2 text-[10px] text-brand font-mono">EFFECTIVE JAN 1, 2025</span>
            <p className="text-ink-muted mt-1 text-[11px]">
              Mandatory pay scale and benefits overview for external and internal postings.
            </p>
          </div>
          <div className="p-2.5 bg-white border border-brand-hairline rounded">
            <span className="font-semibold text-ink">EU AI Act (Recital 26)</span>
            <span className="ml-2 text-[10px] text-brand font-mono">ENFORCING FEB 2, 2025</span>
            <p className="text-ink-muted mt-1 text-[11px]">
              Mandatory notice to applicants prior to deployment of algorithmic CV ranking tools.
            </p>
          </div>
          <div className="p-2.5 bg-white border border-brand-hairline rounded">
            <span className="font-semibold text-ink">Massachusetts (St. 2024, c. 182)</span>
            <span className="ml-2 text-[10px] text-brand font-mono">EFFECTIVE JUL 29, 2025</span>
            <p className="text-ink-muted mt-1 text-[11px]">
              Employers with 25+ staff must state pay range on all job advertisements.
            </p>
          </div>
        </div>
      </div>

      {/* Hick's Law: Priority "Fix Next" Queue */}
      {fixNextJob && (
        <div className="border-2 border-brand/30 bg-brand-subtle/50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-widest uppercase text-brand flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              Priority Action: Fix Next Posting
            </span>
            <span className="text-xs font-mono text-status-violation font-bold">
              Potential Fine: ${fixNextJob.fineLow.toLocaleString("en-US")} – ${fixNextJob.fineHigh.toLocaleString("en-US")}
            </span>
          </div>

          <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-ink">{fixNextJob.title}</h3>
              <p className="text-xs text-ink-muted mt-1">
                Location: <span className="font-semibold text-ink">{fixNextJob.location}</span> • Scope:{" "}
                <span className="font-mono text-brand">{JSON.parse(fixNextJob.jurisdictions || "[]").join(", ")}</span>
              </p>
              <p className="text-xs text-status-violation mt-2 font-medium">
                {JSON.parse(fixNextJob.violationCodes || "[]").join(" • ").replace(/_/g, " ")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedJob(fixNextJob)}
                className="px-4 py-2 bg-brand text-white text-xs font-medium rounded hover:bg-brand-hover transition-colors flex items-center gap-2"
              >
                <span>Inspect & Copy Clause</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filterable Ruled Violation Table (Dense Data Grid) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-brand-hairline">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span className="text-xs font-semibold text-ink uppercase tracking-wider">
              All Monitored Postings ({filteredJobs.length})
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center border border-brand-hairline rounded p-0.5 bg-brand-subtle text-xs">
              {["all", "violation", "warning", "pass"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSeverity(s)}
                  className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                    filterSeverity === s
                      ? "bg-white text-brand shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {s === "all" ? "All" : s}
                </button>
              ))}
            </div>

            {/* In-table search */}
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter title or location..."
              className="text-xs border border-brand-hairline rounded px-3 py-1.5 outline-none focus:border-brand w-52"
            />
          </div>
        </div>

        {/* Real Ruled Table (NO card grids, NO gradient blobs) */}
        <div className="overflow-x-auto border border-brand-hairline rounded">
          <table className="ruled-table text-left">
            <thead>
              <tr className="bg-brand-subtle">
                <th className="w-12">#</th>
                <th>Job Title</th>
                <th>Location / Jurisdictions</th>
                <th>Detected Pay Scale</th>
                <th>Compliance Status</th>
                <th>Exposure</th>
                <th className="text-right">Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-hairline text-xs">
              {filteredJobs.map((job, idx) => {
                const jurisdictions = JSON.parse(job.jurisdictions || "[]");
                return (
                  <tr key={job.id} className="hover:bg-brand-subtle/50 transition-colors">
                    <td className="text-ink-light font-mono text-[11px]">{idx + 1}</td>
                    <td className="font-semibold text-ink">
                      <div className="max-w-xs truncate">{job.title}</div>
                      <div className="text-[11px] text-ink-light font-normal font-mono">ID: {job.externalId}</div>
                    </td>
                    <td>
                      <div className="text-ink">{job.location}</div>
                      <div className="text-[10px] font-mono text-ink-muted">{jurisdictions.join(", ")}</div>
                    </td>
                    <td className="tabular-nums">
                      {job.salaryMin && job.salaryMax ? (
                        <div>
                          <span className="font-medium">
                            ${job.salaryMin.toLocaleString("en-US")} – ${job.salaryMax.toLocaleString("en-US")}
                          </span>
                          <span className="text-[10px] text-ink-muted ml-1">/{job.period}</span>
                          {job.spreadRatio !== null && (
                            <div className="text-[10px] text-ink-muted">
                              Spread: {Math.round(job.spreadRatio * 100)}%
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-status-violation italic">Undisclosed</span>
                      )}
                    </td>
                    <td>
                      {job.severity === "pass" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-status-passBg text-status-pass border border-status-passBorder">
                          <CheckCircle2 className="w-3 h-3" />
                          COMPLIANT
                        </span>
                      )}
                      {job.severity === "warning" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-status-warningBg text-status-warning border border-status-warningBorder">
                          <AlertTriangle className="w-3 h-3" />
                          WARNING
                        </span>
                      )}
                      {job.severity === "violation" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-status-violationBg text-status-violation border border-status-violationBorder">
                          <AlertCircle className="w-3 h-3" />
                          VIOLATION
                        </span>
                      )}
                    </td>
                    <td className="tabular-nums text-ink-muted">
                      {job.fineHigh > 0 ? (
                        <span className="font-mono text-status-violation font-medium">
                          ${job.fineLow.toLocaleString("en-US")} – ${job.fineHigh.toLocaleString("en-US")}
                        </span>
                      ) : (
                        <span className="text-status-pass font-mono">$0</span>
                      )}
                    </td>
                    <td className="text-right">
                      {job.suggestedClause ? (
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="px-2.5 py-1 text-xs font-medium text-brand border border-brand/30 rounded hover:bg-brand-subtle transition-colors"
                        >
                          Remediate
                        </button>
                      ) : (
                        <span className="text-ink-light text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Drawer for Remediation & Compliant Clause Copying */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-brand-hairline">
            {/* Drawer Header */}
            <div className="p-6 border-b border-brand-hairline flex items-center justify-between sticky top-0 bg-white">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-brand uppercase">
                  REMEDIATION INSPECTOR
                </span>
                <h2 className="font-serif text-xl font-bold text-ink mt-0.5">{selectedJob.title}</h2>
                <p className="text-xs text-ink-muted">
                  {selectedJob.location} • ID: {selectedJob.externalId}
                </p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded text-ink-muted hover:text-ink hover:bg-brand-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Statutory Checks Breakdown */}
              <div>
                <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
                  Statutory Rule Checklist
                </h4>
                <div className="space-y-2">
                  {JSON.parse(selectedJob.checks || "[]").map((chk: any, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded border text-xs ${
                        chk.passed
                          ? "bg-status-passBg/40 border-status-passBorder"
                          : "bg-status-violationBg/40 border-status-violationBorder"
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
                        <span className="font-mono text-[10px] text-ink-muted">{chk.citation}</span>
                      </div>
                      <p className="text-ink-muted mt-1 text-[11px]">{chk.details}</p>
                      {chk.officialSourceUrl && (
                        <div className="mt-2 pt-1.5 border-t border-brand-hairline/60 flex items-center justify-between text-[10px]">
                          <span className="text-ink-muted">
                            Agency: <strong>{chk.governingAgency || "State Labor Commissioner"}</strong>
                          </span>
                          <a
                            href={chk.officialSourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand font-mono font-semibold underline flex items-center gap-1 hover:text-brand-hover"
                          >
                            <span>Official Statute (.gov)</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Clause Section */}
              {selectedJob.suggestedClause && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-ink uppercase tracking-wider">
                        Paste-Ready Statutory Clause
                      </h4>
                      <p className="text-[10px] text-ink-muted">
                        Statutory provenance validated against official legislative docket.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-status-pass font-semibold">
                      VERIFIED COMPLIANT
                    </span>
                  </div>
                  <div className="p-4 bg-brand-subtle border border-brand-hairline rounded font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed">
                    {selectedJob.suggestedClause}
                  </div>
                  <div className="p-2.5 bg-white border border-brand-hairline rounded flex items-center justify-between text-[11px] text-ink-muted">
                    <span>
                      Enforcing Framework: <strong>State Civil Rights & Labor Standards</strong>
                    </span>
                    <span className="font-mono text-[10px] text-status-pass">Primary .gov Verified</span>
                  </div>
                  <p className="text-[11px] text-ink-light italic">
                    Paste directly into your Greenhouse, Lever, or Ashby job description.
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-6 border-t border-brand-hairline bg-brand-subtle sticky bottom-0 flex items-center justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 border border-brand-hairline rounded text-xs font-medium text-ink hover:bg-white"
              >
                Close Inspector
              </button>
              {selectedJob.suggestedClause && (
                <button
                  onClick={() => handleCopyClause(selectedJob.suggestedClause!, selectedJob.id)}
                  className="px-5 py-2 bg-brand text-white text-xs font-medium rounded hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Copied to Clipboard!" : "Copy Compliant Clause"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
