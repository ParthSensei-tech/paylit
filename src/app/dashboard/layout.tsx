"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  History,
  Radio,
  Sliders,
  ExternalLink,
  Search,
  FileCheck,
  Building,
  ChevronRight,
  LogOut,
  Scale,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: ShieldAlert },
    { name: "Audit Vault", href: "/dashboard/audit-logs", icon: History },
    { name: "Monitors", href: "/dashboard/monitors", icon: Radio },
    { name: "Newsjacking Feed", href: "/dashboard/newsjacking", icon: Scale },
    { name: "Agency & Settings", href: "/dashboard/settings", icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Rail Navigation */}
      <aside className="w-64 border-r border-brand-hairline bg-brand-subtle flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 border-b border-brand-hairline">
            <Link href="/" className="group flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-ink">
                Pay<span className="text-brand">lit</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-ink-muted">
                COMPLIANCE
              </span>
            </Link>
            <p className="text-xs text-ink-muted mt-1">B2B Hiring Disclosure Monitor</p>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "text-ink hover:text-brand hover:bg-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Scanner Action */}
          <div className="px-4 pt-4">
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-brand border border-brand-hairline rounded bg-white hover:bg-brand-subtle transition-colors"
            >
              <span className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-brand animate-pulse" />
                Scan New Board
              </span>
              <ExternalLink className="w-3 h-3 text-ink-muted" />
            </Link>
          </div>
        </div>

        {/* Account Info / Footer */}
        <div className="p-4 border-t border-brand-hairline bg-white/70">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink truncate">Enterprise Legal Workspace</p>
              <p className="text-[11px] text-ink-muted truncate">counsel@enterprise.client</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-status-pass" title="Active Monitoring" />
          </div>
          <div className="mt-3 pt-2 border-t border-brand-hairline flex items-center justify-between text-[11px] text-ink-light">
            <span>v1.0.4 PROD</span>
            <span className="font-mono">US-EAST</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-brand-hairline px-8 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Cmd+K Search Bar (Jakob's Law) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-ink-muted bg-brand-subtle border border-brand-hairline rounded hover:border-brand/40 transition-colors w-72"
            >
              <Search className="w-3.5 h-3.5 text-ink-light" />
              <span className="flex-1 text-left">Search job title, location, or rule...</span>
              <kbd className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-brand-hairline text-ink-muted">
                ⌘K
              </kbd>
            </button>

            {/* Coverage Lock-in Badge */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-ink-muted pl-4 border-l border-brand-hairline">
              <span className="w-2 h-2 rounded-full bg-brand" />
              <span>Coverage active since Nov 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Statutory Disclaimer Pill */}
            <span className="text-[11px] text-ink-light bg-brand-subtle border border-brand-hairline px-2.5 py-1 rounded">
              Automated screening aid, not legal advice
            </span>

            {/* Primary Action Button */}
            <Link
              href="/dashboard/audit-logs"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand border border-brand/30 rounded hover:bg-brand-subtle transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              Export Audit
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Cmd+K Search Modal Dialog */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-start justify-center pt-24">
          <div className="bg-white border border-brand-hairline rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-3 border-b border-brand-hairline flex items-center gap-2">
              <Search className="w-4 h-4 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to position, rule (e.g. CA SB 1162), or monitor..."
                className="w-full text-sm outline-none text-ink placeholder:text-ink-light"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs text-ink-muted px-1.5 py-0.5 border border-brand-hairline rounded hover:bg-brand-subtle"
              >
                ESC
              </button>
            </div>
            <div className="p-4 text-xs text-ink-muted space-y-2">
              <p className="font-semibold text-ink uppercase tracking-wider text-[10px]">
                Quick Destinations
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded hover:bg-brand-subtle text-ink"
                >
                  <span>Dashboard Overview & Violation Queue</span>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-light" />
                </Link>
                <Link
                  href="/dashboard/audit-logs"
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded hover:bg-brand-subtle text-ink"
                >
                  <span>Immutable Hash-Chained Audit Logs</span>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-light" />
                </Link>
                <Link
                  href="/dashboard/monitors"
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between p-2 rounded hover:bg-brand-subtle text-ink"
                >
                  <span>Configured Company Monitors & Daily Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5 text-ink-light" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
