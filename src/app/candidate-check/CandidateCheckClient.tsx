"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Mail,
  Linkedin,
  Share2,
  Sparkles,
  ArrowRight,
  Code,
  FileText,
  Building,
  MapPin,
  Scale,
} from "lucide-react";
import type { RuleCheckResult } from "@/lib/rules/engine";

export function CandidateCheckClient() {
  const [jobTitle, setJobTitle] = useState("");
  const [jobLocation, setJobLocation] = useState("San Francisco, CA");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  // Copy states
  const [copiedInMail, setCopiedInMail] = useState(false);
  const [copiedBadgeHtml, setCopiedBadgeHtml] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [badgeTheme, setBadgeTheme] = useState<"light" | "dark">("light");

  const runEvaluation = async (textToRun: string, titleToRun: string, locationToRun: string, urlToRun?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/candidate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToRun,
          title: titleToRun,
          location: locationToRun,
          url: urlToRun,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze listing.");
      }
      setResult(data.evaluation);
    } catch (err: any) {
      setError(err.message || "An error occurred while evaluating.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobText.trim() && !jobUrl.trim()) {
      setError("Please paste the job text or provide a job posting URL.");
      return;
    }
    runEvaluation(jobText, jobTitle || "Role Opportunity", jobLocation, jobUrl);
  };

  // Sample listing presets
  const loadSample = (type: "missing" | "spread" | "compliant") => {
    if (type === "missing") {
      setJobTitle("Senior Product Designer");
      setJobLocation("San Francisco, CA");
      setJobUrl("");
      const text = `We are looking for a Senior Product Designer to lead design systems at our high-growth startup. 
Requirements: 5+ years of experience, Figma proficiency, strong portfolio.
Benefits include health insurance, 401(k), and equity. 
Competitive compensation based on experience. Apply now.`;
      setJobText(text);
      runEvaluation(text, "Senior Product Designer", "San Francisco, CA");
    } else if (type === "spread") {
      setJobTitle("Staff Software Engineer");
      setJobLocation("New York, NY");
      setJobUrl("");
      const text = `Join our core infrastructure engineering team in NYC. 
Salary range: $95,000 - $260,000 USD depending on seniority and qualifications.
We offer comprehensive health coverage, 401(k) matching, and parental leave.
We use algorithmic resume matching to screen applications.`;
      setJobText(text);
      runEvaluation(text, "Staff Software Engineer", "New York, NY");
    } else {
      setJobTitle("Principal Product Manager");
      setJobLocation("Denver, CO");
      setJobUrl("");
      const text = `Principal Product Manager - Enterprise Platform.
Compensation: $165,000 to $195,000 annual base salary.
Comprehensive benefits package: Medical, dental, vision, 401(k) with 4% match, annual discretionary bonus target of 15%, and equity grant.
Location: Denver, CO or Remote US.`;
      setJobText(text);
      runEvaluation(text, "Principal Product Manager", "Denver, CO");
    }
  };

  // Pre-filled Recruiter Outreach
  const recruiterMessage = `Hi there,\n\nI came across the ${jobTitle || "open role"} listing in ${jobLocation || "your careers board"} and noticed that it may be missing required statutory compensation or spread disclosures under state pay transparency laws (e.g. California SB 1162 / New York § 194-b).\n\nYou can verify the listing's compliance and obtain the exact legally-compliant clause here: https://paylit.dev/candidate-check\n\nLooking forward to learning more about the role!`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(
    `Question regarding salary disclosure on ${jobTitle || "open opportunity"}`
  )}&body=${encodeURIComponent(recruiterMessage)}`;

  const badgeHtmlCode = `<a href="https://paylit.dev" target="_blank" rel="noopener noreferrer">
  <img src="https://paylit.dev/badge/paylit-verified-${badgeTheme}.svg" alt="Compliance Verified by Paylit" width="180" height="36" />
</a>`;

  return (
    <div className="min-h-screen bg-[#FFF5F6] text-[#1A0F12]">
      {/* Header */}
      <header className="border-b border-[#F0D9DD] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#1A0F12]">
              Pay<span className="text-[#C8102E]">lit</span>
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-600 font-semibold">
              Candidate Salary Transparency Checker
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/companies"
              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-[#C8102E] transition-colors"
            >
              Company Index
            </Link>
            <Link
              href="/"
              className="h-9 px-4 rounded-md bg-[#C8102E] text-white text-xs font-medium hover:bg-[#A50D26] transition-colors inline-flex items-center"
            >
              Employer Scanner
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Title & Introduction */}
        <div className="border-b border-[#F0D9DD] pb-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C8102E] uppercase tracking-wider bg-white px-3 py-1 border border-[#F0D9DD] rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E]" />
            Applicant Rights Tool
          </div>
          <h1 className="font-serif text-3xl lg:text-4xl font-bold tracking-tight text-[#1A0F12]">
            Is This Job Posting Compliant with Pay Transparency Laws?
          </h1>
          <p className="mt-2 text-sm text-neutral-600 max-w-2xl leading-relaxed">
            In California, New York, Colorado, Washington, and Illinois, employers are legally required to disclose transparent salary ranges and benefits. Paste any job posting below to verify whether the listing violates state statutory requirements before you apply.
          </p>
        </div>

        {/* Input Box & Presets */}
        <div className="bg-white border border-[#F0D9DD] rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-mono uppercase text-neutral-500 font-semibold">
              Check a Listing
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 font-mono">Load test samples:</span>
              <button
                type="button"
                onClick={() => loadSample("missing")}
                className="text-xs font-mono px-2 py-1 bg-[#FFEBEF] text-[#B3001B] rounded border border-[#F5C2CB] hover:bg-[#FCD8DF]"
              >
                Missing Salary
              </button>
              <button
                type="button"
                onClick={() => loadSample("spread")}
                className="text-xs font-mono px-2 py-1 bg-[#FFF8E6] text-[#D98A00] rounded border border-[#FCE6A8] hover:bg-[#FDF0CE]"
              >
                Excessive Spread (166%)
              </button>
              <button
                type="button"
                onClick={() => loadSample("compliant")}
                className="text-xs font-mono px-2 py-1 bg-[#E6F7F0] text-[#0F9D6E] rounded border border-[#B3E8D3] hover:bg-[#D1F2E4]"
              >
                Compliant Job
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase text-neutral-500">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#F0D9DD] rounded-md text-sm text-[#1A0F12] placeholder-neutral-400 focus:outline-none focus:border-[#C8102E]"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase text-neutral-500">Location / State</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA or New York, NY or Remote - US"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-[#F0D9DD] rounded-md text-sm text-[#1A0F12] placeholder-neutral-400 focus:outline-none focus:border-[#C8102E]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-500">
                Paste Job Description Text (or compensation section)
              </label>
              <textarea
                rows={5}
                placeholder="Paste the full job description or the compensation & requirements section here..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="w-full mt-1 p-3 border border-[#F0D9DD] rounded-md text-sm font-sans text-[#1A0F12] placeholder-neutral-400 focus:outline-none focus:border-[#C8102E]"
              />
            </div>

            {error && (
              <div className="p-3 bg-[#FFEBEF] text-[#B3001B] text-xs rounded border border-[#F5C2CB]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-md bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#A50D26] transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
            >
              {loading ? "Evaluating Statutory Rules..." : "Verify Job Listing Compliance"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Results Breakdown */}
        {result && (
          <div className="space-y-6">
            <div className="bg-white border border-[#F0D9DD] rounded-xl p-6 shadow-sm space-y-6">
              {/* Verdict Header */}
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#F0D9DD] pb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      result.severity === "violation"
                        ? "bg-[#FFEBEF] text-[#B3001B] border border-[#F5C2CB]"
                        : result.severity === "warning"
                        ? "bg-[#FFF8E6] text-[#D98A00] border border-[#FCE6A8]"
                        : "bg-[#E6F7F0] text-[#0F9D6E] border border-[#B3E8D3]"
                    }`}
                  >
                    {result.severity === "violation" ? (
                      <XCircle className="w-7 h-7" />
                    ) : result.severity === "warning" ? (
                      <AlertTriangle className="w-7 h-7" />
                    ) : (
                      <ShieldCheck className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase text-neutral-500">Statutory Audit Result</div>
                    <h3 className="font-serif text-2xl font-bold text-[#1A0F12]">
                      {result.severity === "violation"
                        ? "Statutory Non-Compliance Detected"
                        : result.severity === "warning"
                        ? "Disclosure Discrepancies Flagged"
                        : "Listing Appears Fully Compliant"}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono uppercase text-neutral-500">Potential Employer Fine</div>
                  <div className="font-mono text-xl font-bold text-[#B3001B] tabular-nums">
                    ${result.fineLow?.toLocaleString("en-US")} – ${result.fineHigh?.toLocaleString("en-US")}
                  </div>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA]">
                  <div className="text-[11px] font-mono uppercase text-neutral-500">Detected Salary Band</div>
                  <div className="mt-1 font-mono font-bold text-base text-[#1A0F12]">
                    {result.salaryMin && result.salaryMax
                      ? `$${result.salaryMin.toLocaleString("en-US")} – $${result.salaryMax.toLocaleString("en-US")}`
                      : "No Salary Disclosed"}
                  </div>
                </div>
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA]">
                  <div className="text-[11px] font-mono uppercase text-neutral-500">Spread Ratio</div>
                  <div className="mt-1 font-mono font-bold text-base text-[#1A0F12]">
                    {result.spreadRatio !== null ? `${Math.round(result.spreadRatio * 100)}%` : "N/A"}
                    {result.spreadRatio !== null && result.spreadRatio > 0.60 && (
                      <span className="text-xs text-[#B3001B] ml-1">(&gt;60% Flag)</span>
                    )}
                  </div>
                </div>
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA]">
                  <div className="text-[11px] font-mono uppercase text-neutral-500">Applicable States</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {result.jurisdictions?.map((j: string) => (
                      <span key={j} className="text-xs font-mono font-bold px-1.5 py-0.5 bg-white border border-[#F0D9DD] rounded text-[#C8102E]">
                        {j}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 border border-[#F0D9DD] rounded-lg bg-[#FFF9FA]">
                  <div className="text-[11px] font-mono uppercase text-neutral-500">Violations Flagged</div>
                  <div className="mt-1 font-mono font-bold text-base text-[#B3001B]">
                    {result.violationCodes?.length || 0}
                  </div>
                </div>
              </div>

              {/* Rule Checks List */}
              <div className="space-y-3">
                <h4 className="font-serif text-base font-bold text-[#1A0F12]">
                  Individual Statutory Findings
                </h4>
                {result.checks?.map((chk: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                      chk.passed
                        ? "bg-[#E6F7F0]/40 border-[#B3E8D3]"
                        : "bg-[#FFEBEF]/50 border-[#F5C2CB]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1A0F12]">{chk.ruleCode}</span>
                        <span className="text-xs text-neutral-500">• {chk.citation}</span>
                        {chk.governingAgency && (
                          <span className="text-[11px] font-mono text-neutral-600 bg-white px-2 py-0.5 rounded border border-neutral-200">
                            {chk.governingAgency}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-700">{chk.reason}</p>
                      {chk.officialSourceUrl && (
                        <a
                          href={chk.officialSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex text-[11px] font-mono text-[#C8102E] hover:underline"
                        >
                          Verify primary government docket ({chk.officialSourceUrl.replace(/https?:\/\//, "").split("/")[0]}) →
                        </a>
                      )}
                    </div>
                    <span
                      className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        chk.passed ? "bg-[#0F9D6E] text-white" : "bg-[#B3001B] text-white"
                      }`}
                    >
                      {chk.passed ? "Pass" : "Flag"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* VIRAL SHARE WITH RECRUITER / EMPLOYER */}
            <div className="bg-[#1A0F12] text-white rounded-xl p-8 shadow-lg space-y-6">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F0D9DD] uppercase tracking-wider">
                <Share2 className="w-4 h-4 text-[#C8102E]" />
                Automated Candidate Action Loop
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold">
                  Share this finding politely with the hiring recruiter
                </h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                  Most employers are unaware their job boards violate state transparency rules. Send this pre-composed message to the hiring manager or recruiter to request the missing salary range and help them remediate the listing.
                </p>
              </div>

              {/* Message Box */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 whitespace-pre-wrap leading-relaxed">
                {recruiterMessage}
              </div>

              {/* 1-Click Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(recruiterMessage);
                    setCopiedInMail(true);
                    setTimeout(() => setCopiedInMail(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-md bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#A50D26] transition-colors inline-flex items-center gap-2"
                >
                  {copiedInMail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedInMail ? "Message Copied!" : "Copy InMail / LinkedIn Message"}
                </button>

                <a
                  href={mailtoLink}
                  className="px-4 py-2.5 rounded-md bg-white text-[#1A0F12] text-xs font-semibold hover:bg-neutral-100 transition-colors inline-flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Open Email Draft to Hiring Team
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setCopiedShareLink(true);
                    setTimeout(() => setCopiedShareLink(false), 2000);
                  }}
                  className="px-4 py-2.5 rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 text-xs font-mono hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  {copiedShareLink ? <Check className="w-4 h-4 text-[#0F9D6E]" /> : <Share2 className="w-4 h-4" />}
                  {copiedShareLink ? "Link Copied" : "Copy Checker Link"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMBEDDABLE BADGE SECTION */}
        <div className="bg-white border border-[#F0D9DD] rounded-xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-xs font-mono uppercase text-neutral-500">For Compliant Employers</div>
              <h3 className="font-serif text-2xl font-bold text-[#1A0F12] mt-0.5">
                Embeddable &quot;Compliance Verified by Paylit&quot; Badge
              </h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-xl">
                Show job applicants that your company practices ethical, transparent compensation. Embed this live badge on your careers page or job postings.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#FFF5F6] p-1 rounded border border-[#F0D9DD]">
              <button
                type="button"
                onClick={() => setBadgeTheme("light")}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  badgeTheme === "light" ? "bg-white text-[#C8102E] font-bold shadow-sm" : "text-neutral-600"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setBadgeTheme("dark")}
                className={`px-3 py-1 text-xs font-mono rounded ${
                  badgeTheme === "dark" ? "bg-[#1A0F12] text-white font-bold shadow-sm" : "text-neutral-600"
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Visual Preview */}
          <div className="p-6 rounded-lg border border-[#F0D9DD] bg-[#FFF9FA] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-500 uppercase">Live Badge Preview:</span>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-medium shadow-sm ${
                  badgeTheme === "dark"
                    ? "bg-[#1A0F12] text-white border-neutral-800"
                    : "bg-white text-[#1A0F12] border-[#F0D9DD]"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#0F9D6E]" />
                <span>Compliance Verified by <strong className="text-[#C8102E]">Paylit</strong></span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(badgeHtmlCode);
                setCopiedBadgeHtml(true);
                setTimeout(() => setCopiedBadgeHtml(false), 2000);
              }}
              className="px-3.5 py-2 rounded-md bg-[#1A0F12] text-white text-xs font-mono hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
            >
              {copiedBadgeHtml ? <Check className="w-3.5 h-3.5 text-[#0F9D6E]" /> : <Code className="w-3.5 h-3.5" />}
              {copiedBadgeHtml ? "Snippet Copied!" : "Copy HTML Snippet"}
            </button>
          </div>

          <div className="relative">
            <pre className="bg-[#1A0F12] text-neutral-300 p-4 rounded-lg text-xs font-mono overflow-x-auto border border-neutral-800">
              {badgeHtmlCode}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
