"use client";

import React, { useState } from "react";
import { Building2, Share2, Copy, Check, Mail, SlidersHorizontal, ShieldCheck } from "lucide-react";

export default function SettingsPage() {
  const [agencyName, setAgencyName] = useState<string>("Littler & Mendelson Advisory LLP");
  const [accentColor, setAccentColor] = useState<string>("#C8102E");
  const [footerDisclaimer, setFooterDisclaimer] = useState<string>(
    "Certified Compliance Audit prepared under legal supervision for enterprise statutory defense."
  );
  const [mondayDigest, setMondayDigest] = useState<boolean>(true);
  const [skipNoChange, setSkipNoChange] = useState<boolean>(true);
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);
  const [savedSettings, setSavedSettings] = useState<boolean>(false);

  const referralUrl = "https://paylit.compliance/ref/client-chro-invite-992";

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="border-b border-brand-hairline pb-4">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-ink">
          Agency White-Label & Compliance Configuration
        </h1>
        <p className="text-xs text-ink-muted mt-1">
          Customize export certificates, configure client multi-tenant rollups, and manage automated digest schedules.
        </p>
      </div>

      {savedSettings && (
        <div className="p-3 bg-status-passBg border border-status-passBorder rounded text-xs text-status-pass flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Agency configuration saved successfully.</span>
        </div>
      )}

      {/* Agency White-Label Certificate Configuration */}
      <div className="p-6 bg-white border border-brand-hairline rounded-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-subtle text-brand flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">
              Agency Certificate Customization
            </h3>
            <p className="text-xs text-ink-muted">
              Certificates exported by your team will feature your law firm or agency brand identity.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-ink mb-1">Advisory / Law Firm Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block font-semibold text-ink mb-1">Brand Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-9 h-9 p-0.5 border border-brand-hairline rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full border border-brand-hairline rounded p-2 font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-ink mb-1">Custom Legal Certificate Footer</label>
            <textarea
              rows={2}
              value={footerDisclaimer}
              onChange={(e) => setFooterDisclaimer(e.target.value)}
              className="w-full border border-brand-hairline rounded p-2 outline-none focus:border-brand"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-brand text-white font-medium rounded hover:bg-brand-hover"
          >
            Save Agency Settings
          </button>
        </form>
      </div>

      {/* Monday Digest Email Automation */}
      <div className="p-6 bg-white border border-brand-hairline rounded-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-subtle text-brand flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">
              Monday Executive Digest Automation
            </h3>
            <p className="text-xs text-ink-muted">
              Delivers weekly score trends, newly flagged positions, and one-click ATS remediation links to counsel.
            </p>
          </div>
        </div>

        <div className="pt-2 space-y-3 text-xs">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={mondayDigest}
              onChange={(e) => setMondayDigest(e.target.checked)}
              className="w-4 h-4 text-brand rounded border-brand-hairline"
            />
            <span className="text-ink font-medium">
              Enable Monday 8:00 AM Executive Digest Email
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={skipNoChange}
              onChange={(e) => setSkipNoChange(e.target.checked)}
              className="w-4 h-4 text-brand rounded border-brand-hairline"
            />
            <span className="text-ink-muted">
              <strong>Noise Prevention:</strong> Skip delivery if zero postings changed status since last scan
            </span>
          </label>
        </div>
      </div>

      {/* Peer Referral Engine */}
      <div className="p-6 bg-brand-subtle border border-brand-hairline rounded-lg space-y-3">
        <div className="flex items-center gap-2 text-brand">
          <Share2 className="w-4 h-4" />
          <h3 className="font-serif text-base font-bold text-ink">
            Share a Free Scan with Another HR Leader
          </h3>
        </div>
        <p className="text-xs text-ink-muted">
          Invite another General Counsel or Chief People Officer. When they run their first careers audit, both your organization and theirs receive an additional 14 days of complimentary monitoring.
        </p>

        <div className="pt-2 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralUrl}
            className="flex-1 bg-white border border-brand-hairline rounded px-3 py-2 text-xs font-mono text-ink-muted"
          />
          <button
            onClick={handleCopyReferral}
            className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded hover:bg-brand-hover flex items-center gap-1.5"
          >
            {copiedReferral ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedReferral ? "Copied" : "Copy Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
