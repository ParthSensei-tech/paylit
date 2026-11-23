import { Metadata } from "next";
import Link from "next/link";
import { NewsjackingClient } from "../dashboard/newsjacking/NewsjackingClient";

export const metadata: Metadata = {
  title: "State Pay Transparency Enforcement Bulletins & Regulatory Fines | Paylit",
  description:
    "Live intelligence on state labor department fines, penalties, and audit actions across California SB 1162, New York § 194-b, Washington RCW 49.58, and Colorado EPEWA.",
  keywords: [
    "pay transparency enforcement fines",
    "California Civil Rights Department salary fines",
    "Washington L&I salary transparency penalties",
    "NYC Local Law 144 fines",
    "Colorado EPEWA wage audits",
    "pay transparency legal bulletins",
  ],
  openGraph: {
    title: "State Pay Transparency Enforcement Bulletins & Regulatory Penalties",
    description: "Official summary of state labor department fines and audit sweeps under salary transparency statutes.",
    type: "website",
    url: "https://paylit.dev/regulatory-alerts",
  },
  alternates: {
    canonical: "https://paylit.dev/regulatory-alerts",
  },
};

export default function RegulatoryAlertsPage() {
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
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-600 font-semibold">
              Regulatory Enforcement Intelligence
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
              href="/candidate-check"
              className="text-xs font-mono uppercase tracking-wider text-neutral-600 hover:text-[#C8102E] transition-colors"
            >
              Candidate Checker
            </Link>
            <Link
              href="/"
              className="h-9 px-4 rounded-md bg-[#C8102E] text-white text-xs font-medium hover:bg-[#A50D26] transition-colors inline-flex items-center"
            >
              Audit Careers Page
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <NewsjackingClient />
      </main>
    </div>
  );
}
