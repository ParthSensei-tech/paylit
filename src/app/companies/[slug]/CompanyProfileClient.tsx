"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Building2,
  ExternalLink,
  CheckCircle2,
  Scale,
  Calendar,
  Sparkles,
  ArrowRight,
  Lock,
  ChevronRight,
  Copy,
  Check,
} from "lucide-react";
import type { CompanyIndexItem } from "@/lib/companies/index-data";

interface CompanyProfileClientProps {
  company: CompanyIndexItem;
}

export function CompanyProfileClient({ company }: CompanyProfileClientProps) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isStrong = company.complianceScore >= 90;
  const isRisk = company.complianceScore < 70;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimEmail) return;
    setClaimSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F6] text-[#1A0F12]">
      {/* Top Header */}
      <header className="border-b border-[#F0D9DD] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#1A0F12]">
              Pay<span className="text-[#C8102E]">lit</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <Link
              href="/companies"
              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-[#C8102E] transition-colors"
            >
              Index
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-mono text-neutral-800 font-semibold">{company.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#F0D9DD] bg-white text-xs font-mono text-neutral-600 hover:text-[#C8102E] transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#0F9D6E]" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? "Link Copied" : "Share Profile"}
            </button>
            <Link
              href={`/candidate-check`}
              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-[#C8102E] transition-colors hidden md:block"
            >
              Candidate Checker
            </Link>
            <button
              onClick={() => setClaimModalOpen(true)}
              className="h-9 px-4 rounded-md bg-[#C8102E] text-white text-xs font-medium hover:bg-[#A50D26] transition-colors inline-flex items-center"
            >
              Claim Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Company Hero Header */}
        <div className="bg-white border border-[#F0D9DD] rounded-xl p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-xl bg-[#FFF0F2] border border-[#F0D9DD] flex items-center justify-center font-serif font-bold text-2xl text-[#C8102E] shadow-sm">
                {company.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight text-[#1A0F12]">
                    {company.name}
                  </h1>
                  {company.claimed ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#E6F7F0] text-[#0F9D6E] border border-[#B3E8D3]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified Profile
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono bg-neutral-100 text-neutral-600 border border-neutral-200">
                      Unclaimed Profile
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500 flex items-center gap-2 flex-wrap">
                  <span>ATS: <strong className="font-mono text-neutral-700 uppercase">{company.atsType}</strong></span>
                  <span>•</span>
                  <a
                    href={company.careersUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#C8102E] hover:underline"
                  >
                    Official Careers Board <ExternalLink className="w-3 h-3" />
                  </a>
                  <span>•</span>
                  <span>Last Audited: <strong className="font-mono text-neutral-700">{new Date(company.lastScannedAt).toLocaleDateString()}</strong></span>
                </p>
              </div>
            </div>

            {/* Score Pill Card */}
            <div className="flex items-center gap-4 bg-[#FFF5F6] border border-[#F0D9DD] p-4 rounded-lg">
              <div
                className={`w-14 h-14 rounded-lg flex items-center justify-center font-serif text-2xl font-bold ${
                  isStrong
                    ? "bg-[#E6F7F0] text-[#0F9D6E] border border-[#B3E8D3]"
                    : isRisk
                    ? "bg-[#FFEBEF] text-[#B3001B] border border-[#F5C2CB]"
                    : "bg-[#FFF8E6] text-[#D98A00] border border-[#FCE6A8]"
                }`}
              >
                {company.grade}
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase text-neutral-500">Statutory Score</div>
                <div className="text-2xl font-serif font-bold text-[#1A0F12] tabular-nums">
                  {company.complianceScore}<span className="text-sm font-normal text-neutral-400">/100</span>
                </div>
                <div className="text-xs font-medium text-neutral-600">
                  {isStrong ? "Grade A: Strong Disclosure" : isRisk ? "Grade F: Non-Compliant Gaps" : "Grade B/C: Needs Review"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-neutral-500">Total Listings Scanned</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#1A0F12] tabular-nums">{company.totalJobs}</div>
            <div className="mt-1 text-xs text-neutral-500">Open career postings</div>
          </div>
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-neutral-500">Regulated Listings</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#1A0F12] tabular-nums">{company.regulatedJobs}</div>
            <div className="mt-1 text-xs text-neutral-500">Covered by CA, NY, CO, WA, IL</div>
          </div>
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-[#B3001B]">Statutory Exceptions</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#B3001B] tabular-nums">{company.violations}</div>
            <div className="mt-1 text-xs text-neutral-500">Disclosure gaps flagged</div>
          </div>
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-neutral-500">Excessive Spreads (&gt;60%)</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#1A0F12] tabular-nums">{company.spreadFlags}</div>
            <div className="mt-1 text-xs text-neutral-500">Subject to good-faith scrutiny</div>
          </div>
        </div>

        {/* Breakdown & Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2-column breakdown */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statutory Exceptions Breakdown */}
            <div className="bg-white border border-[#F0D9DD] rounded-xl p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-xl font-bold text-[#1A0F12]">
                Statutory Disclosure Findings
              </h2>
              <p className="text-sm text-neutral-600">
                Evaluation of public postings against mandatory disclosure statutes: explicit min/max salary ranges, benefits inclusion, good-faith spread ratios, and automated screening transparency.
              </p>

              <div className="space-y-3">
                {/* Check 1: Spread Ratios */}
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA] flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm text-[#1A0F12] flex items-center gap-2">
                      <span>Salary Spread Ratios (Good-Faith Standard)</span>
                      {company.spreadFlags === 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#E6F7F0] text-[#0F9D6E] font-mono">Compliant</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#FFEBEF] text-[#B3001B] font-mono">{company.spreadFlags} Flagged</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      California SB 1162 and New York § 194-b require good-faith opportunity ranges. Paylit flags bands where (max - min) / min exceeds 60%.
                    </p>
                  </div>
                </div>

                {/* Check 2: Benefits Disclosures */}
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA] flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm text-[#1A0F12] flex items-center gap-2">
                      <span>Benefits & Incentive Descriptions</span>
                      {company.benefitFlags === 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#E6F7F0] text-[#0F9D6E] font-mono">Compliant</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#FFF8E6] text-[#D98A00] font-mono">{company.benefitFlags} Omissions</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Colorado EPEWA and Illinois HB 3129 require a general description of bonuses, commissions, healthcare, and retirement benefits.
                    </p>
                  </div>
                </div>

                {/* Check 3: Automated Screening & AI Disclosures */}
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA] flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium text-sm text-[#1A0F12] flex items-center gap-2">
                      <span>Automated Screening & AI Disclosures</span>
                      {company.aiFlags === 0 ? (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#E6F7F0] text-[#0F9D6E] font-mono">Compliant</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded bg-[#FFEBEF] text-[#B3001B] font-mono">{company.aiFlags} Warnings</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      NYC Local Law 144 and EU AI Act Article 26 require notice to applicants when automated employment decision tools (AEDT) evaluate resumes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Jurisdiction Coverage Matrix */}
            <div className="bg-white border border-[#F0D9DD] rounded-xl p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-xl font-bold text-[#1A0F12]">
                Active Jurisdictions Analyzed
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {company.jurisdictions.map((j) => (
                  <div key={j} className="p-3 border border-[#F0D9DD] rounded-lg bg-[#FFF5F6] flex flex-col">
                    <span className="font-mono text-xs font-bold text-[#C8102E]">{j}</span>
                    <span className="text-[11px] text-neutral-600 mt-0.5">
                      {j === "CA" && "SB 1162 / Cal. Lab. Code § 432.3"}
                      {j === "NY" && "N.Y. Lab. Law § 194-b"}
                      {j === "CO" && "Colo. Rev. Stat. § 8-5-201"}
                      {j === "WA" && "Wash. Rev. Code § 49.58.110"}
                      {j === "IL" && "820 ILCS 112/10 (HB 3129)"}
                      {j === "MA" && "Mass. St. 2024 c. 182"}
                      {j === "Remote-US" && "Multi-State Remote Exposure"}
                      {!["CA", "NY", "CO", "WA", "IL", "MA", "Remote-US"].includes(j) && "State Disclosure Law"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Rail: Claim & Live Audit CTAs */}
          <div className="space-y-6">
            {/* Sticky Claim Profile Box */}
            <div className="bg-white border-2 border-[#C8102E] rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="w-1.5 bg-[#C8102E] absolute left-0 top-0 bottom-0" />
              <div className="space-y-3">
                <span className="inline-flex text-[11px] font-mono uppercase tracking-wider text-[#C8102E] font-semibold bg-[#FFF0F2] px-2.5 py-0.5 rounded">
                  HR & Legal Ownership
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1A0F12]">
                  Are you an HR leader or counsel at {company.name}?
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Claim this public index profile to configure automated daily scans, receive Slack/email alerts before regulators fine listings, and generate print-ready compliance audit certificates.
                </p>
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-md bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#A50D26] transition-colors shadow-sm"
                >
                  Claim Profile & Monitor Daily
                </button>
              </div>
            </div>

            {/* Candidate Viral Card */}
            <div className="bg-white border border-[#F0D9DD] rounded-xl p-6 shadow-sm space-y-3">
              <div className="text-xs font-mono uppercase text-neutral-500">For Job Applicants</div>
              <h4 className="font-serif text-lg font-bold text-[#1A0F12]">
                Applying to {company.name}?
              </h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Verify any specific job posting before your interview. Check if the salary range is compliant and get a pre-written template to ask the recruiter for required disclosures.
              </p>
              <Link
                href="/candidate-check"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C8102E] hover:underline font-semibold"
              >
                Open Candidate Checker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Live Scan Trigger */}
            <div className="bg-[#1A0F12] text-white rounded-xl p-6 shadow-sm space-y-3">
              <div className="text-xs font-mono uppercase text-[#F0D9DD]">Real-Time Scanner</div>
              <h4 className="font-serif text-lg font-bold">
                Run On-Demand Audit
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Perform an instant crawl against the current live careers board of {company.name} with hash-chained snapshot verification.
              </p>
              <Link
                href={`/?url=${encodeURIComponent(company.careersUrl)}`}
                className="w-full py-2.5 px-4 rounded-md bg-white text-[#1A0F12] text-xs font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                Scan Live Board Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Claim Profile Modal */}
      {claimModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#F0D9DD] max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setClaimModalOpen(false);
                setClaimSubmitted(false);
              }}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700 text-lg"
            >
              ×
            </button>

            {!claimSubmitted ? (
              <>
                <div className="w-10 h-10 rounded-lg bg-[#FFF0F2] border border-[#F0D9DD] flex items-center justify-center text-[#C8102E]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A0F12]">
                    Claim {company.name} on Paylit
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1">
                    Enter your work email address (matching your company domain). We will verify your company domain and unlock the executive monitoring dashboard.
                  </p>
                </div>

                <form onSubmit={handleClaim} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-mono uppercase text-neutral-500">Corporate Email</label>
                    <input
                      type="email"
                      required
                      placeholder={`counsel@${company.slug}.com`}
                      value={claimEmail}
                      onChange={(e) => setClaimEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-[#F0D9DD] rounded-md text-sm text-[#1A0F12] placeholder-neutral-400 focus:outline-none focus:border-[#C8102E]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-md bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#A50D26] transition-colors"
                  >
                    Verify Domain & Claim Profile
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#E6F7F0] border border-[#B3E8D3] flex items-center justify-center text-[#0F9D6E] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A0F12]">
                  Verification Request Received
                </h3>
                <p className="text-xs text-neutral-600">
                  We have dispatched a verification token to <strong>{claimEmail}</strong>. Follow the link in your corporate inbox to manage {company.name}&apos;s compliance monitoring.
                </p>
                <button
                  onClick={() => {
                    setClaimModalOpen(false);
                    setClaimSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-md bg-[#1A0F12] text-white text-xs font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
