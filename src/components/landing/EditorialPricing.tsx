"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export default function EditorialPricing() {
  const plans = [
    {
      name: "Growth",
      price: "$299",
      period: "per month",
      highlight: false,
      summary: "For single-entity companies auditing up to 50 active job requisitions.",
      features: [
        "1 ATS career board (Greenhouse, Lever, or Ashby)",
        "Daily automated statutory compliance scans",
        "CA, NY, CO, WA, IL, MA statutory rules coverage",
        "Paste-ready ATS remediation clause generation",
        "Email alert dispatch to talent acquisition & counsel",
      ],
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Scale",
      price: "$599",
      period: "per month",
      highlight: true,
      summary: "For high-volume multi-state hiring across distributed teams.",
      features: [
        "Up to 5 careers boards & custom career portals",
        "Continuous daily scans + webhook notifications",
        "Cryptographically sealed SHA-256 audit vault",
        "Downloadable print-ready Compliance Certificates",
        "EU AI Act & NYC LL144 automated-screening auditor",
        "Unlimited recruiter & legal team seats",
      ],
      cta: "Start 14-Day Free Trial",
    },
    {
      name: "Agency / Legal",
      price: "$999",
      period: "per month",
      highlight: false,
      summary: "For employment law firms and talent agencies managing client portfolios.",
      features: [
        "Up to 25 client careers boards under one umbrella",
        "White-label branded certificates (logo, firm disclaimer)",
        "Client portfolio executive roll-up dashboard",
        "Monday morning client compliance digests",
        "Dedicated regulatory compliance engineering SLA",
      ],
      cta: "Contact Counsel Sales",
    },
  ];

  return (
    <section className="bg-white text-ink border-t border-brand-hairline py-20 px-6 sm:px-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="border-b border-brand-hairline pb-6">
          <span className="text-xs font-mono tracking-widest uppercase text-brand font-semibold">
            TRANSPARENT ENTERPRISE PRICING
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
            Predictable compliance coverage. Zero surprises.
          </h2>
          <p className="text-xs text-ink-muted mt-2">
            Every plan includes our deterministic statutory rule engine, paste-ready ATS clauses, and tamper-proof audit vaults.
          </p>
        </div>

        {/* Editorial Rows (NO card grids, NO 3-up feature boxes) */}
        <div className="divide-y divide-brand-hairline border-t border-b border-brand-hairline">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`py-8 px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors ${
                p.highlight ? "bg-brand-subtle/80 border-l-4 border-l-brand" : "hover:bg-brand-subtle/30"
              }`}
            >
              {/* Plan Name & Pricing */}
              <div className="lg:w-1/4">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-2xl font-bold text-ink">{p.name}</h3>
                  {p.highlight && (
                    <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded bg-brand text-white font-semibold uppercase">
                      MOST POPULAR
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="font-serif text-3xl font-bold text-ink tabular-nums">{p.price}</span>
                  <span className="text-xs text-ink-muted font-normal">{p.period}</span>
                </div>
                <p className="text-xs text-ink-muted mt-2 leading-relaxed">{p.summary}</p>
              </div>

              {/* Ruled Features List */}
              <div className="lg:w-1/2">
                <ul className="space-y-2 text-xs text-ink-muted">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-brand flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="lg:w-1/4 lg:text-right">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded transition-colors ${
                    p.highlight
                      ? "bg-brand text-white hover:bg-brand-hover shadow-sm"
                      : "bg-white border border-brand-hairline text-ink hover:border-brand hover:text-brand"
                  }`}
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with statutory legal notice */}
        <footer className="pt-8 border-t border-brand-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-light">
          <div>
            <span className="font-serif font-bold text-ink text-sm">
              Pay<span className="text-brand">lit</span>
            </span>
            <span className="mx-2">•</span>
            <span>B2B Pay-Transparency Compliance Engine</span>
          </div>

          <p className="text-center sm:text-right">
            Automated screening aid, not legal advice. © {new Date().getFullYear()} Paylit Technologies Inc.
          </p>
        </footer>
      </div>
    </section>
  );
}
