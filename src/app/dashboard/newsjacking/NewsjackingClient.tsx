"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Linkedin,
  FileText,
  AlertCircle,
  Building,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ENFORCEMENT_BULLETINS, generateNewsjackingPost, EnforcementBulletin } from "@/lib/regulatory/enforcement-feed";

export function NewsjackingClient() {
  const [selectedBulletin, setSelectedBulletin] = useState<EnforcementBulletin | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [copiedTalkingPoints, setCopiedTalkingPoints] = useState(false);
  const [selectedState, setSelectedState] = useState<string>("all");

  const filteredBulletins = ENFORCEMENT_BULLETINS.filter((b) => {
    if (selectedState !== "all" && b.state !== selectedState) return false;
    return true;
  });

  const handleCopyPost = (bulletin: EnforcementBulletin) => {
    const post = generateNewsjackingPost(bulletin);
    navigator.clipboard.writeText(post);
    setCopiedPostId(bulletin.id);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handleCopyTalkingPoints = (bulletin: EnforcementBulletin) => {
    const points = `Executive Talking Points: ${bulletin.headline}
• Regulatory Body: ${bulletin.agency}
• Legal Citation: ${bulletin.citation}
• Penalties Imposed: ${bulletin.fineAmount}
• Key Risk: ${bulletin.keyTakeaway}
• Paylit Audit Link: https://paylit.dev/?ref=briefing`;
    navigator.clipboard.writeText(points);
    setCopiedTalkingPoints(true);
    setTimeout(() => setCopiedTalkingPoints(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#F0D9DD] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#C8102E] uppercase tracking-wider bg-white px-3 py-1 border border-[#F0D9DD] rounded-full mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-pulse" />
            Viral Acquisition Loop
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#1A0F12]">
            Regulatory Newsjacking &amp; Enforcement Intelligence
          </h1>
          <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
            Track real-time state labor agency citations, penalties, and audit sweeps. Generate high-authority executive LinkedIn commentary with 1 click to position your team as compliance leaders.
          </p>
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-mono uppercase text-neutral-500">Filter State:</span>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="border border-[#F0D9DD] rounded px-3 py-1.5 text-xs bg-white text-[#1A0F12] focus:outline-none focus:border-[#C8102E]"
          >
            <option value="all">All States</option>
            <option value="CA">California</option>
            <option value="NY">New York</option>
            <option value="CO">Colorado</option>
            <option value="WA">Washington</option>
            <option value="IL">Illinois</option>
          </select>
        </div>
      </div>

      {/* Bulletins Grid */}
      <div className="space-y-4">
        {filteredBulletins.map((bulletin) => (
          <div
            key={bulletin.id}
            className="bg-white border border-[#F0D9DD] rounded-xl p-6 shadow-sm hover:border-[#C8102E]/40 transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#FFEBEF] text-[#B3001B] border border-[#F5C2CB]">
                    {bulletin.fineAmount} Penalty
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 text-neutral-700">
                    {bulletin.state} • {bulletin.citation}
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">{bulletin.date}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#1A0F12] mt-1">
                  {bulletin.headline}
                </h3>
                <div className="text-xs text-neutral-500 font-mono">
                  Agency: <strong className="text-neutral-700">{bulletin.agency}</strong> | Target: <strong className="text-neutral-700">{bulletin.targetSector}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedBulletin(bulletin)}
                  className="px-3.5 py-2 rounded-md bg-[#1A0F12] text-white text-xs font-semibold hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#FF4D6D]" />
                  <span>Generate LinkedIn Post</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              {bulletin.summary}
            </p>

            <div className="pt-2 border-t border-[#F0D9DD] flex items-center justify-between text-xs text-neutral-500">
              <div className="font-medium text-[#B3001B]">
                Key Mandate: {bulletin.keyTakeaway}
              </div>
              <a
                href={bulletin.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#C8102E] hover:underline font-mono text-[11px]"
              >
                Official Agency Docket <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Generated Post Modal */}
      {selectedBulletin && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-[#F0D9DD] max-w-2xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBulletin(null)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700 text-lg"
            >
              ×
            </button>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#C8102E] font-semibold bg-[#FFF0F2] px-2 py-0.5 rounded">
                Executive Newsjacking Engine
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A0F12]">
                1-Click LinkedIn Outbound Post
              </h3>
              <p className="text-xs text-neutral-600">
                Pre-formatted 3-paragraph thought leadership commentary citing {selectedBulletin.citation} with hook to your free Paylit audit scanner.
              </p>
            </div>

            <div className="bg-[#1A0F12] text-neutral-200 p-5 rounded-lg font-mono text-xs whitespace-pre-wrap leading-relaxed border border-neutral-800">
              {generateNewsjackingPost(selectedBulletin)}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyPost(selectedBulletin)}
                  className="px-4 py-2.5 rounded-md bg-[#C8102E] text-white text-xs font-semibold hover:bg-[#A50D26] transition-colors inline-flex items-center gap-2 shadow"
                >
                  {copiedPostId === selectedBulletin.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedPostId === selectedBulletin.id ? "Post Copied!" : "Copy Full LinkedIn Post"}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyTalkingPoints(selectedBulletin)}
                  className="px-4 py-2.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-[#1A0F12] text-xs font-semibold transition-colors inline-flex items-center gap-2"
                >
                  {copiedTalkingPoints ? <Check className="w-4 h-4 text-[#0F9D6E]" /> : <FileText className="w-4 h-4" />}
                  {copiedTalkingPoints ? "Points Copied!" : "Copy Talking Points"}
                </button>
              </div>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://paylit.dev")}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-md border border-[#F0D9DD] text-[#1A0F12] text-xs font-mono hover:text-[#C8102E] transition-colors inline-flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4 text-[#0077b5]" />
                <span>Open LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
