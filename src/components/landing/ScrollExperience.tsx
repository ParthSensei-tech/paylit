"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CareersScanInput from "./CareersScanInput";
import EditorialPricing from "./EditorialPricing";
import EditorialFaq from "./EditorialFaq";

// Register GSAP ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamically import 3D canvas with SSR disabled
const LandingCanvas = dynamic(() => import("./LandingCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0B0709] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const SCENE_NAMES = [
  "Hook",
  "The Problem",
  "Continuous Discovery",
  "Instant Remediation",
  "Immutable Record",
  "Continuous Coverage",
];

export default function ScrollExperience() {
  const [activeScene, setActiveScene] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      handleScroll();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    function handleScroll() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // Each scene is 100vh
      const rawProgress = scrollY / windowHeight;
      const currentIdx = Math.max(0, Math.min(5, Math.floor(rawProgress)));
      const subProgress = rawProgress - currentIdx;

      setActiveScene(currentIdx);
      setSceneProgress(subProgress);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      gsap.ticker.remove(tickerCallback);
      window.removeEventListener("scroll", handleScroll);
      lenis.destroy();
    };
  }, []);

  const scrollToScene = (idx: number) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(idx * window.innerHeight, { duration: 1.2 });
    } else {
      window.scrollTo({ top: idx * window.innerHeight, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="relative bg-[#0B0709] text-white">
      {/* Pinned 3D Stage Background (fixed in viewport) */}
      <div className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-700">
        <LandingCanvas sceneIndex={activeScene} progress={sceneProgress} />
      </div>

      {/* Floating Scene Dots Navigator (Right Edge) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-3 pointer-events-auto">
        {SCENE_NAMES.map((name, idx) => (
          <button
            key={name}
            onClick={() => scrollToScene(idx)}
            className="group flex items-center justify-end gap-2 focus:outline-none"
            title={`Scene ${idx + 1}: ${name}`}
          >
            <span
              className={`text-[10px] font-mono tracking-wider transition-all duration-300 ${
                activeScene === idx
                  ? "text-brand opacity-100 translate-x-0"
                  : "text-[#8C7B80] opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
              }`}
            >
              0{idx + 1} {name}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                activeScene === idx
                  ? "bg-brand border-brand scale-125 shadow-lg shadow-brand/50"
                  : "bg-transparent border-[#8C7B80] group-hover:border-white"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Top Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-30 px-6 sm:px-12 py-5 flex items-center justify-between backdrop-blur-md bg-[#0B0709]/70 border-b border-[#38262B]">
        <div className="flex items-center gap-3">
          <span className="font-serif text-2xl font-bold tracking-tight text-white">
            Pay<span className="text-brand">lit</span>
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#8C7B80] hidden sm:inline">
            STATUTORY COMPLIANCE
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="/companies"
            className="text-xs text-[#8C7B80] hover:text-white transition-colors hidden md:inline"
          >
            State Index
          </a>
          <a
            href="/candidate-check"
            className="text-xs text-[#8C7B80] hover:text-white transition-colors hidden sm:inline"
          >
            Candidate Checker
          </a>
          <a
            href="/regulatory-alerts"
            className="text-xs text-[#8C7B80] hover:text-white transition-colors hidden lg:inline"
          >
            Enforcement Feed
          </a>
          <button
            onClick={() => scrollToScene(5)}
            className="text-xs text-[#8C7B80] hover:text-white transition-colors"
          >
            Pricing
          </button>
          <a
            href="/dashboard"
            className="text-xs font-semibold px-4 py-2 rounded bg-brand hover:bg-brand-hover text-white transition-colors"
          >
            Client Sign In
          </a>
        </div>
      </nav>

      {/* 6 Pinned Scroll Scenes (each ~100vh tall) */}
      <div className="relative z-10">
        {/* SCENE 1 — HOOK */}
        <section
          id="scene-1"
          className="h-screen flex items-center justify-between px-6 sm:px-16 pointer-events-auto"
        >
          <div className="max-w-xl space-y-6">
            <span className="text-xs font-mono tracking-widest uppercase text-brand font-semibold block">
              B2B PAY TRANSPARENCY & HIRING DISCLOSURE
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold leading-tight tracking-tight text-white">
              Your careers page is a legal document.
            </h1>
            <p className="text-lg text-[#8C7B80]">
              Six states are reading it. Are you?
            </p>
            <div className="pt-2">
              <CareersScanInput dark={true} />
            </div>
          </div>

          {/* Depth-layered Scene 1 Editorial Cutaway */}
          <div className="hidden lg:block w-80 h-96 relative rounded-lg overflow-hidden border border-[#38262B] shadow-2xl opacity-85 hover:opacity-100 transition-opacity">
            <img
              src="/images/hiring-desk.jpg"
              alt="Hiring manager desk at night with active careers posting"
              className="w-full h-full object-cover filter contrast-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0709] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-[#F0D9DD]">
              FIG 1.0 // Unmonitored job postings exposed to statutory inspection
            </div>
          </div>
        </section>

        {/* SCENE 2 — PROBLEM */}
        <section
          id="scene-2"
          className="h-screen flex items-center justify-between px-6 sm:px-16 pointer-events-auto"
        >
          {/* Depth-layered Scene 2 Editorial Cutaway */}
          <div className="hidden lg:block w-80 h-80 relative rounded-lg overflow-hidden border border-[#C8102E]/40 shadow-2xl">
            <img
              src="/images/salary-macro.jpg"
              alt="Macro photograph of flagged salary range"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0709] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-status-violation">
              EVIDENCE // Excessive spread: 200% exceeds 60% legal threshold
            </div>
          </div>

          <div className="max-w-lg bg-[#0B0709]/80 backdrop-blur-md p-8 rounded-lg border border-[#38262B] space-y-4 shadow-2xl">
            <span className="text-xs font-mono tracking-wider text-status-violation uppercase font-semibold">
              CALIFORNIA SB 1162 / NY § 194-B
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
              One recruiter wrote one range. California counts that as a violation.
            </h2>
            <div className="space-y-2 text-sm text-[#8C7B80] leading-relaxed">
              <p>Fines run $1,000 to $10,000 per listing. You have 40 listings.</p>
              <p>Nobody in HR is checking them every day. Regulators don&apos;t need to.</p>
            </div>
          </div>
        </section>

        {/* SCENE 3 — DISCOVERY */}
        <section
          id="scene-3"
          className="h-screen flex items-center justify-between px-6 sm:px-16 pointer-events-auto"
        >
          <div className="max-w-md bg-[#0B0709]/80 backdrop-blur-md p-8 rounded-lg border border-[#38262B] space-y-4 shadow-2xl">
            <span className="text-xs font-mono tracking-wider text-brand uppercase font-semibold">
              CONTINUOUS ATS INGESTION
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
              Paylit reads every open posting on your Greenhouse, Lever, Ashby, or custom careers page.
            </h2>
            <p className="text-sm text-[#8C7B80] leading-relaxed">
              Location. Salary range. Good-faith spread. Benefits. Automated-screening notices.
            </p>
          </div>

          {/* Depth-layered Scene 3 Regulatory Legal Document Cutaway */}
          <div className="hidden lg:block w-80 h-96 relative rounded-lg overflow-hidden border border-[#38262B] shadow-2xl">
            <img
              src="/images/legal-document.jpg"
              alt="State labor law statutory text with regulatory seal"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0709] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-[#F0D9DD]">
              STATUTORY CITATION // Cal. Lab. Code § 432.3 & 820 ILCS 112/11
            </div>
          </div>
        </section>

        {/* SCENE 4 — THE FIX */}
        <section
          id="scene-4"
          className="h-screen flex items-center justify-between px-6 sm:px-16 pointer-events-auto"
        >
          {/* Depth-layered Scene 4 Regulatory Calendar Cutaway */}
          <div className="hidden lg:block w-80 h-80 relative rounded-lg overflow-hidden border border-[#38262B] shadow-2xl">
            <img
              src="/images/regulatory-calendar.jpg"
              alt="Regulatory enforcement timeline of effective transparency dates"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0709] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-brand">
              CALENDAR // Multi-state enforcement dates active
            </div>
          </div>

          <div className="max-w-lg bg-[#0B0709]/80 backdrop-blur-md p-8 rounded-lg border border-[#38262B] space-y-4 shadow-2xl">
            <span className="text-xs font-mono tracking-wider text-status-pass uppercase font-semibold">
              INSTANT STATUTORY REMEDIATION
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
              Every violation arrives with the exact paragraph to paste into your ATS.
            </h2>
            <p className="text-sm text-[#8C7B80] leading-relaxed">
              Fixed in a minute, not a meeting.
            </p>
          </div>
        </section>

        {/* SCENE 5 — THE RECORD */}
        <section
          id="scene-5"
          className="h-screen flex items-center justify-between px-6 sm:px-16 pointer-events-auto"
        >
          <div className="max-w-lg bg-[#0B0709]/80 backdrop-blur-md p-8 rounded-lg border border-[#38262B] space-y-4 shadow-2xl">
            <span className="text-xs font-mono tracking-wider text-brand uppercase font-semibold">
              TAMPER-PROOF AUDIT VAULT
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
              Every scan is sealed and timestamped. If a regulator asks, you hand them the history.
            </h2>
            <p className="text-sm text-[#8C7B80] leading-relaxed">
              Cryptographic SHA-256 Merkle chain guarantees tamper evidence for outside counsel and labor commissioners.
            </p>
          </div>

          {/* Depth-layered Scene 5 Official Certificate Cutaway */}
          <div className="hidden lg:block w-80 h-96 relative rounded-lg overflow-hidden border border-brand/40 shadow-2xl">
            <img
              src="/images/audit-certificate.jpg"
              alt="Cryptographically sealed compliance certificate"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0709] via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-[#F0D9DD]">
              SEALED RECORD // SHA-256 Cryptographic Chain Intact
            </div>
          </div>
        </section>

        {/* SCENE 6 — THE CLOSE */}
        <section
          id="scene-6"
          className="min-h-screen flex flex-col justify-center px-6 sm:px-16 py-20 pointer-events-auto"
        >
          <div className="max-w-xl mx-auto text-center space-y-6">
            <span className="text-xs font-mono tracking-widest uppercase text-brand font-semibold block">
              CONTINUOUS COVERAGE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Scan free in 20 seconds. Keep watching for $299 a month.
            </h2>
            <p className="text-base text-[#8C7B80]">
              Protect your organization from statutory citations before regulators or plaintiff firms audit your board.
            </p>

            <div className="pt-2 max-w-md mx-auto">
              <CareersScanInput dark={true} />
            </div>
          </div>
        </section>
      </div>

      {/* Statutory FAQ & Legal Knowledge Base (GEO & Search Intent) */}
      <div id="faq" className="relative z-20">
        <EditorialFaq />
      </div>

      {/* Pricing Section (Transitions into White Product Theme) */}
      <div id="pricing" className="relative z-20">
        <EditorialPricing />
      </div>
    </div>
  );
}
