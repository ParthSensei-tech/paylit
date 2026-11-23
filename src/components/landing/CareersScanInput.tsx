"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, ShieldAlert } from "lucide-react";

export default function CareersScanInput({
  className = "",
  dark = true,
}: {
  className?: string;
  dark?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsScanning(true);
    setErrorMsg(null);
    setScanStatus("Detecting ATS and validating target host...");

    try {
      // Step simulated updates
      setTimeout(() => setScanStatus("Ingesting career postings..."), 800);
      setTimeout(() => setScanStatus("Auditing pay transparency across CA, NY, CO, WA, IL..."), 1800);
      setTimeout(() => setScanStatus("Sealing tamper-proof audit snapshot..."), 2800);

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Compliance scan failed.");
      }

      setScanStatus("Audit complete. Opening compliance report...");
      router.push(`/report/${data.publicToken || data.scanId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to complete scan.");
      setIsScanning(false);
      setScanStatus(null);
    }
  };

  const handleSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isScanning}
          placeholder="Paste your careers URL (e.g. boards.greenhouse.io/stripe)"
          className={`flex-1 px-4 py-3.5 text-sm rounded border outline-none transition-colors ${
            dark
              ? "bg-[#140E10] border-[#38262B] text-white placeholder:text-[#8C7B80] focus:border-brand"
              : "bg-white border-brand-hairline text-ink placeholder:text-ink-light focus:border-brand shadow-sm"
          }`}
        />
        <button
          type="submit"
          disabled={isScanning || !url.trim()}
          className="px-6 py-3.5 bg-brand text-white text-sm font-semibold rounded hover:bg-brand-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0 shadow-md"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <span>Scan my careers page</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Real-time Status or Error Banner */}
      {scanStatus && (
        <div className="p-2.5 rounded bg-brand/10 border border-brand/30 text-xs text-brand flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
          <span>{scanStatus}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded bg-status-violationBg border border-status-violationBorder text-xs text-status-violation flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two small text links for sample boards */}
      <div className="flex items-center gap-2 text-xs text-[#8C7B80]">
        <span>Try a sample:</span>
        <button
          type="button"
          onClick={() => handleSample("https://boards.greenhouse.io/stripe")}
          className="text-[#F0D9DD] underline hover:text-brand transition-colors"
        >
          Greenhouse board
        </button>
        <span>/</span>
        <button
          type="button"
          onClick={() => handleSample("https://jobs.lever.co/palantir")}
          className="text-[#F0D9DD] underline hover:text-brand transition-colors"
        >
          Lever board
        </button>
      </div>
    </div>
  );
}
