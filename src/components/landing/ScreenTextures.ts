import * as THREE from "three";

/**
 * Procedurally draws crisp high-DPI canvas textures for laptop & phone screens
 */
export function createSceneCanvasTexture(sceneIndex: number, progress = 0): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return fallback;
  }

  // Common background: Deep Ink with subtle cherry radial glow
  const bgGrad = ctx.createRadialGradient(512, 320, 50, 512, 320, 600);
  bgGrad.addColorStop(0, "#1A0F12");
  bgGrad.addColorStop(1, "#0B0709");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 640);

  // Top window frame bar
  ctx.fillStyle = "#140E10";
  ctx.fillRect(0, 0, 1024, 48);
  ctx.fillStyle = "#F0D9DD";
  ctx.font = "14px monospace";
  ctx.fillText("paylit // statutory-compliance-engine v2026.1", 24, 28);

  // Window dots
  ctx.fillStyle = "#C8102E";
  ctx.beginPath();
  ctx.arc(970, 24, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#D98A00";
  ctx.beginPath();
  ctx.arc(986, 24, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0F9D6E";
  ctx.beginPath();
  ctx.arc(1002, 24, 5, 0, Math.PI * 2);
  ctx.fill();

  if (sceneIndex === 0) {
    // SCENE 1: Terminal / Initial Hook
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 32px serif";
    ctx.fillText("Paylit Hiring Disclosure Engine", 64, 130);

    ctx.fillStyle = "#8C7B80";
    ctx.font = "18px sans-serif";
    ctx.fillText("Continuous statutory transparency monitoring across US & EU jurisdictions.", 64, 170);

    // Simulated terminal prompt
    ctx.fillStyle = "#140E10";
    ctx.fillRect(64, 220, 896, 320);
    ctx.strokeStyle = "#F0D9DD";
    ctx.lineWidth = 1;
    ctx.strokeRect(64, 220, 896, 320);

    ctx.fillStyle = "#C8102E";
    ctx.font = "16px monospace";
    ctx.fillText("> paylit monitor --jurisdictions=CA,NY,CO,WA,IL,MA,EU", 96, 270);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "15px monospace";
    ctx.fillText("[OK] Statutory rules loaded: 8 jurisdictions active", 96, 310);
    ctx.fillText("[OK] ATS connector initialized (Greenhouse, Lever, Ashby)", 96, 345);
    ctx.fillText("[OK] SHA-256 Merkle chain verified: Block #992-B", 96, 380);

    ctx.fillStyle = "#0F9D6E";
    ctx.fillText("[AWAITING URL SCAN INPUT] Ready for careers ingestion...", 96, 430);
  } else if (sceneIndex === 1) {
    // SCENE 2: Problem - Flagged Job with glowing crimson range
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 28px serif";
    ctx.fillText("Staff Infrastructure Engineer — San Francisco, CA", 64, 110);

    ctx.fillStyle = "#8C7B80";
    ctx.font = "15px sans-serif";
    ctx.fillText("Requisition #REQ-4091 • Greenhouse ATS • Location: California (SB 1162 in scope)", 64, 145);

    // Job Posting Snippet Box
    ctx.fillStyle = "#140E10";
    ctx.fillRect(64, 180, 896, 380);
    ctx.strokeStyle = "#C8102E";
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 180, 896, 380);

    // Flagged Salary Range with glowing crimson highlight
    ctx.fillStyle = "rgba(200, 16, 46, 0.25)";
    ctx.fillRect(96, 230, 832, 90);
    ctx.strokeStyle = "#C8102E";
    ctx.lineWidth = 2;
    ctx.strokeRect(96, 230, 832, 90);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "14px sans-serif";
    ctx.fillText("Posted Compensation Band:", 120, 260);

    ctx.fillStyle = "#C8102E";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("$60,000 – $180,000 /year", 120, 300);

    // Statutory Violation Callout
    ctx.fillStyle = "#FDECEF";
    ctx.fillRect(96, 350, 832, 160);

    ctx.fillStyle = "#B3001B";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("STATUTORY VIOLATION: Cal. Lab. Code § 432.3 (SB 1162)", 120, 385);

    ctx.fillStyle = "#1A0F12";
    ctx.font = "14px sans-serif";
    ctx.fillText("• Excessive Spread Ratio: 200% ($60k to $180k). Statutory limit: 60%.", 120, 420);
    ctx.fillText("• Civil Fine Exposure: $1,000 to $10,000 per listing citation.", 120, 450);
    ctx.fillText("• Action: Replace with calibrated good-faith market scale ($135k – $175k).", 120, 480);
  } else if (sceneIndex === 2) {
    // SCENE 3: Discovery - Stream of parsed jobs stamped pass/flag
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px serif";
    ctx.fillText("Live Stream: Ingesting & Stamping Careers Postings", 64, 105);

    const rows = [
      { title: "Senior Product Designer", loc: "Denver, CO", sal: "$145k - $175k", status: "PASS", code: "COMPLIANT" },
      { title: "Staff Backend Engineer", loc: "New York, NY", sal: "Undisclosed", status: "FAIL", code: "MISSING_RANGE" },
      { title: "Director of Marketing", loc: "Remote - US", sal: "$90k - $270k", status: "FAIL", code: "EXCESSIVE_SPREAD" },
      { title: "VP of People Operations", loc: "Chicago, IL", sal: "$180k - $220k", status: "PASS", code: "COMPLIANT" },
    ];

    rows.forEach((row, idx) => {
      const y = 140 + idx * 105;
      ctx.fillStyle = "#140E10";
      ctx.fillRect(64, y, 896, 85);
      ctx.strokeStyle = "#F0D9DD";
      ctx.strokeRect(64, y, 896, 85);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 18px serif";
      ctx.fillText(row.title, 90, y + 35);

      ctx.fillStyle = "#8C7B80";
      ctx.font = "14px monospace";
      ctx.fillText(`${row.loc} • Pay: ${row.sal}`, 90, y + 62);

      if (row.status === "PASS") {
        ctx.fillStyle = "#0F9D6E";
        ctx.font = "bold 16px monospace";
        ctx.fillText("[STAMP: PASS]", 760, y + 45);
      } else {
        ctx.fillStyle = "#C8102E";
        ctx.font = "bold 16px monospace";
        ctx.fillText(`[STAMP: ${row.code}]`, 700, y + 45);
      }
    });
  } else if (sceneIndex === 3) {
    // SCENE 4: The Fix - Clause auto-typing and stamp flipping to COMPLIANT
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px serif";
    ctx.fillText("Instant Statutory Remediation Snippet", 64, 105);

    ctx.fillStyle = "#8C7B80";
    ctx.font = "14px sans-serif";
    ctx.fillText("Calibrated for California & Multi-State Remote. Paste-ready for Greenhouse/Lever.", 64, 135);

    ctx.fillStyle = "#140E10";
    ctx.fillRect(64, 160, 896, 420);
    ctx.strokeStyle = "#0F9D6E";
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 160, 896, 420);

    ctx.fillStyle = "#0F9D6E";
    ctx.font = "bold 16px monospace";
    ctx.fillText("STATUS FLIPPED: COMPLIANT (0 VIOLATIONS)", 96, 205);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "15px monospace";
    ctx.fillText("Compensation & Statutory Disclosure for Staff Engineer:", 96, 250);
    ctx.fillText("• Base Pay Range: $140,000 – $185,000 /year.", 96, 285);
    ctx.fillText("• Spread Ratio: 32% (Well within statutory 60% threshold).", 96, 320);
    ctx.fillText("• Benefits: Medical, Dental, Vision, 401(k) matching, and Unlimited PTO.", 96, 355);
    ctx.fillText("• Statutory Notice: In compliance with Cal. Lab. Code § 432.3 & CO EPEWA.", 96, 390);

    ctx.fillStyle = "#C8102E";
    ctx.fillRect(96, 440, 320, 50);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("Copied to Clipboard", 160, 472);
  } else {
    // SCENE 5 & 6: The Record / Hash Chain Sealed
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 26px serif";
    ctx.fillText("Cryptographically Sealed Audit Snapshot", 64, 105);

    ctx.fillStyle = "#8C7B80";
    ctx.font = "14px sans-serif";
    ctx.fillText("Tamper-evident SHA-256 Merkle chain. Admissible for regulatory inquiries.", 64, 135);

    ctx.fillStyle = "#140E10";
    ctx.fillRect(64, 170, 896, 400);
    ctx.strokeStyle = "#F0D9DD";
    ctx.lineWidth = 1;
    ctx.strokeRect(64, 170, 896, 400);

    ctx.fillStyle = "#0F9D6E";
    ctx.font = "bold 18px monospace";
    ctx.fillText("SEAL VALID • MERKLE HASH CHAIN INTACT", 96, 220);

    ctx.fillStyle = "#8C7B80";
    ctx.font = "14px monospace";
    ctx.fillText("Block Digest:  4f8b92d6e3c0a17409f5bb6199201a88cfd30491...", 96, 270);
    ctx.fillText("Parent Digest: 9a7e301cd205e4b77f18392a830177df83c92014...", 96, 310);
    ctx.fillText("Coverage Span: November 2026 – Present (Continuous)", 96, 350);
    ctx.fillText("Certified By:  Paylit Automated Regulatory Vault Protocol", 96, 390);

    ctx.fillStyle = "#C8102E";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("OFFICIAL COMPLIANCE CERTIFICATE #PAYLIT-2026-992", 96, 460);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
