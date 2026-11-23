"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, ShieldCheck, AlertTriangle, XCircle, ArrowUpRight, Building2, CheckCircle2 } from "lucide-react";
import type { CompanyIndexItem } from "@/lib/companies/index-data";

interface CompaniesClientProps {
  initialCompanies: CompanyIndexItem[];
}

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [atsFilter, setAtsFilter] = useState<string>("all");
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("all");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return initialCompanies.filter((company) => {
      // Search term
      if (
        searchTerm &&
        !company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !company.slug.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // ATS filter
      if (atsFilter !== "all" && company.atsType !== atsFilter) {
        return false;
      }

      // Jurisdiction filter
      if (jurisdictionFilter !== "all" && !company.jurisdictions.includes(jurisdictionFilter)) {
        return false;
      }

      // Tier filter
      if (tierFilter === "strong" && company.complianceScore < 90) return false;
      if (tierFilter === "review" && (company.complianceScore < 70 || company.complianceScore >= 90)) return false;
      if (tierFilter === "risk" && company.complianceScore >= 70) return false;

      return true;
    });
  }, [initialCompanies, searchTerm, atsFilter, jurisdictionFilter, tierFilter]);

  const stats = useMemo(() => {
    const total = initialCompanies.length;
    const avgScore = total > 0 ? Math.round(initialCompanies.reduce((acc, c) => acc + c.complianceScore, 0) / total) : 0;
    const strongCount = initialCompanies.filter((c) => c.complianceScore >= 90).length;
    const atRiskCount = initialCompanies.filter((c) => c.complianceScore < 70).length;
    return { total, avgScore, strongCount, atRiskCount };
  }, [initialCompanies]);

  return (
    <div className="min-h-screen bg-[#FFF5F6] text-[#1A0F12]">
      {/* Top Navigation */}
      <header className="border-b border-[#F0D9DD] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-[#1A0F12]">
              Pay<span className="text-[#C8102E]">lit</span>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 pl-2 border-l border-[#F0D9DD]">
              Statutory Index
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/candidate-check"
              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-[#C8102E] transition-colors"
            >
              Candidate Checker
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-[#C8102E] transition-colors"
            >
              HR Console
            </Link>
            <Link
              href="/"
              className="h-9 px-4 rounded-md bg-[#C8102E] text-white text-xs font-medium hover:bg-[#A50D26] transition-colors inline-flex items-center"
            >
              Scan Your Careers Page
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Editorial Header */}
        <div className="border-b border-[#F0D9DD] pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C8102E] uppercase tracking-wider bg-white px-3 py-1 border border-[#F0D9DD] rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-pulse" />
            Public Disclosure Monitor
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-[#1A0F12]">
            State Pay Transparency Index
          </h1>
          <p className="mt-3 text-base text-neutral-600 max-w-3xl leading-relaxed">
            The national compliance directory of employer salary disclosures. Tracking public job listings across California SB 1162, New York § 194-b, Colorado EPEWA, Washington RCW 49.58, and Illinois HB 3129.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-neutral-500">Companies Monitored</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#1A0F12] tabular-nums">{stats.total}</div>
            <div className="mt-1 text-xs text-neutral-500">Live indexed career boards</div>
          </div>
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-neutral-500">National Average Score</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#1A0F12] tabular-nums">{stats.avgScore}<span className="text-base font-normal text-neutral-400">/100</span></div>
            <div className="mt-1 text-xs text-neutral-500">Based on statutory audit algorithms</div>
          </div>
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-[#0F9D6E]">Strong Compliance (90+)</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#0F9D6E] tabular-nums">{stats.strongCount}</div>
            <div className="mt-1 text-xs text-neutral-500">Grade A compliant disclosures</div>
          </div>
          <div className="bg-white border border-[#F0D9DD] p-5 rounded-lg shadow-sm">
            <div className="text-xs font-mono uppercase text-[#B3001B]">At Risk of Fines (&lt;70)</div>
            <div className="mt-2 text-3xl font-serif font-bold text-[#B3001B] tabular-nums">{stats.atRiskCount}</div>
            <div className="mt-1 text-xs text-neutral-500">Subject to regulatory enforcement</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#F0D9DD] p-4 rounded-lg flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search companies by name or slug (e.g. Stripe, Palantir)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-[#F0D9DD] rounded-md text-sm text-[#1A0F12] placeholder-neutral-400 focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* ATS Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-mono">ATS:</span>
              <select
                value={atsFilter}
                onChange={(e) => setAtsFilter(e.target.value)}
                className="border border-[#F0D9DD] rounded px-2.5 py-1.5 text-xs bg-white text-[#1A0F12] focus:outline-none focus:border-[#C8102E]"
              >
                <option value="all">All Systems</option>
                <option value="greenhouse">Greenhouse</option>
                <option value="lever">Lever</option>
                <option value="ashby">Ashby</option>
              </select>
            </div>

            {/* Jurisdiction Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-mono">State:</span>
              <select
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                className="border border-[#F0D9DD] rounded px-2.5 py-1.5 text-xs bg-white text-[#1A0F12] focus:outline-none focus:border-[#C8102E]"
              >
                <option value="all">All Jurisdictions</option>
                <option value="CA">California (SB 1162)</option>
                <option value="NY">New York (§ 194-b)</option>
                <option value="CO">Colorado (EPEWA)</option>
                <option value="WA">Washington (RCW 49.58)</option>
                <option value="IL">Illinois (HB 3129)</option>
              </select>
            </div>

            {/* Tier Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-mono">Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="border border-[#F0D9DD] rounded px-2.5 py-1.5 text-xs bg-white text-[#1A0F12] focus:outline-none focus:border-[#C8102E]"
              >
                <option value="all">All Tiers</option>
                <option value="strong">Strong (90+)</option>
                <option value="review">Needs Review (70-89)</option>
                <option value="risk">At Risk (&lt;70)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-white border border-[#F0D9DD] rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F0D9DD] bg-[#FFF5F6] text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Compliance Score</th>
                  <th className="py-3 px-6">Open Jobs</th>
                  <th className="py-3 px-6">Jurisdictions</th>
                  <th className="py-3 px-6">Spread Flags (&gt;60%)</th>
                  <th className="py-3 px-6">ATS Platform</th>
                  <th className="py-3 px-6 text-right">Audit Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0D9DD] text-sm">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-500">
                      No companies match your selected filters. Try broadening your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((company) => {
                    const isStrong = company.complianceScore >= 90;
                    const isRisk = company.complianceScore < 70;
                    return (
                      <tr key={company.slug} className="hover:bg-[#FFF9FA] transition-colors group">
                        <td className="py-4 px-6">
                          <Link href={`/companies/${company.slug}`} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-[#FFF0F2] border border-[#F0D9DD] flex items-center justify-center font-serif font-bold text-sm text-[#C8102E]">
                              {company.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-[#1A0F12] group-hover:text-[#C8102E] transition-colors flex items-center gap-1.5">
                                {company.name}
                                {company.claimed && (
                                  <span title="Verified & Claimed by HR Counsel" className="inline-flex text-[#0F9D6E]">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-neutral-400">/{company.slug}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold font-mono ${
                                isStrong
                                  ? "bg-[#E6F7F0] text-[#0F9D6E] border border-[#B3E8D3]"
                                  : isRisk
                                  ? "bg-[#FFEBEF] text-[#B3001B] border border-[#F5C2CB]"
                                  : "bg-[#FFF8E6] text-[#D98A00] border border-[#FCE6A8]"
                              }`}
                            >
                              {company.grade}
                            </span>
                            <div>
                              <div className="font-mono font-bold text-sm text-[#1A0F12] tabular-nums">
                                {company.complianceScore}/100
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                {isStrong ? "Compliant" : isRisk ? "High Exposure" : "Minor Gaps"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-mono text-sm text-[#1A0F12] tabular-nums">{company.totalJobs} total</div>
                          <div className="text-xs text-neutral-500 font-mono">{company.regulatedJobs} regulated</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {company.jurisdictions.slice(0, 4).map((j) => (
                              <span
                                key={j}
                                className="px-1.5 py-0.5 text-[10px] font-mono bg-[#FFF0F2] border border-[#F0D9DD] rounded text-[#C8102E]"
                              >
                                {j}
                              </span>
                            ))}
                            {company.jurisdictions.length > 4 && (
                              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-100 rounded text-neutral-600">
                                +{company.jurisdictions.length - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-mono text-sm tabular-nums ${
                              company.spreadFlags > 0 ? "text-[#B3001B] font-semibold" : "text-[#0F9D6E]"
                            }`}
                          >
                            {company.spreadFlags} {company.spreadFlags === 1 ? "flag" : "flags"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-mono uppercase text-neutral-600 bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                            {company.atsType}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/companies/${company.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider text-[#C8102E] hover:underline"
                          >
                            View Audit <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Acquisition Callout */}
        <div className="bg-[#1A0F12] text-white p-8 rounded-xl border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold">Don&apos;t see your company in the index?</h3>
            <p className="text-sm text-neutral-400 max-w-xl">
              Run a free 20-second statutory audit against your public careers board. Paylit checks min/max bands, spread ratios, benefits disclosures, and automated-screening clauses across 6 states.
            </p>
          </div>
          <Link
            href="/"
            className="px-6 py-3 rounded-md bg-[#C8102E] text-white text-sm font-medium hover:bg-[#A50D26] transition-colors whitespace-nowrap shadow-md inline-flex items-center gap-2"
          >
            Audit Careers Page Free <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
