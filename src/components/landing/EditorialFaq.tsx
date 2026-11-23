"use client";

import React from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";

export default function EditorialFaq() {
  const faqs = [
    {
      q: "What is California SB 1162 pay transparency compliance?",
      a: "California Labor Code § 432.3 (enacted via Senate Bill 1162) requires any employer with 15 or more employees to include a pay scale (the salary or hourly wage range that the employer reasonably expects to pay for the position) in any job advertisement. Civil statutory penalties range from $100 up to $10,000 per violation.",
    },
    {
      q: "How does the good-faith salary spread rule work?",
      a: "Labor enforcement agencies in California, New York, and other jurisdictions require salary bands to represent genuine, good-faith hiring expectations. Bands with extreme spreads—such as $60,000 to $180,000, exceeding a 60% spread ratio—are regularly flagged as bad-faith compliance evasions that trigger administrative investigation and civil liability.",
    },
    {
      q: "What benefits and bonus disclosures are required in Colorado and Illinois?",
      a: "Under the Colorado Equal Pay for Equal Work Act (C.R.S. § 8-5-201) and the Illinois Equal Pay Act Amendment (820 ILCS 112/11, HB 3129), employers must disclose not only the base salary range, but also a general description of all bonuses, commissions, healthcare benefits, retirement contributions, and paid leave options in all external and internal job postings.",
    },
    {
      q: "How does NYC Local Law 144 apply to job postings and hiring?",
      a: "NYC Local Law 144 regulates Automated Employment Decision Tools (AEDTs). If an employer uses AI, algorithmic resume scoring, or automated video interview assessments for NYC candidates, they must publish a summary of an independent bias audit and give candidates at least 10 business days prior notice with opt-out / accommodation instructions.",
    },
    {
      q: "Are remote positions subject to state pay transparency statutes?",
      a: "Yes. When a position is listed as 'Remote', 'US - Remote', or open to nationwide candidates, state enforcement agencies in CA, NY, CO, WA, and IL assert extraterritorial jurisdiction because qualified residents in those states can apply. Paylit automatically evaluates remote postings against the strictest cumulative statutory standard.",
    },
    {
      q: "How does Paylit prove compliance during a regulatory audit or inquiry?",
      a: "Every scan run computes an append-only Audit Snapshot linked by a cryptographic SHA-256 Merkle hash chain. This creates an unalterable, timestamped historical ledger showing exact dates of posting compliance, resolved exceptions, and statutory coverage for legal counsel and labor commissioners.",
    },
  ];

  return (
    <section id="faq" className="bg-white text-ink border-t border-brand-hairline py-20 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="border-b border-brand-hairline pb-6">
          <span className="text-xs font-mono tracking-widest uppercase text-brand font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            STATUTORY KNOWLEDGE BASE & LEGAL FAQ
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink mt-2">
            Everything your General Counsel and Talent Team need to know
          </h2>
          <p className="text-xs text-ink-muted mt-2">
            Statutory legal guidance across California, New York, Colorado, Washington, Illinois, Massachusetts, and the EU.
          </p>
        </div>

        <div className="divide-y divide-brand-hairline border-t border-b border-brand-hairline">
          {faqs.map((faq, i) => (
            <details key={i} className="group py-5 text-left cursor-pointer transition-colors">
              <summary className="flex items-center justify-between font-serif text-lg font-bold text-ink list-none group-hover:text-brand transition-colors">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-ink-muted group-open:rotate-180 transition-transform flex-shrink-0 ml-4" />
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-ink-muted pr-6 font-sans">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
