import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { STATUTORY_RULES } from "../src/lib/rules/config.ts";

function computeSha256(str) {
  return crypto.createHash("sha256").update(str, "utf8").digest("hex");
}

function isValidGovSource(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.endsWith(".gov") || host.endsWith(".europa.eu");
  } catch {
    return false;
  }
}

function validateRuleCandidate(candidate) {
  const requiredFields = [
    "code",
    "jurisdiction",
    "name",
    "citation",
    "effectiveDate",
    "lastReviewedDate",
    "fineRange",
    "requiresRange",
    "maxGoodFaithSpreadRatio",
    "requiresBenefitsDisclosure",
    "requiresAiScreeningDisclosure",
    "description",
    "officialSourceUrl",
    "statutoryExcerpts",
    "governingAgency",
  ];

  for (const field of requiredFields) {
    if (candidate[field] === undefined || candidate[field] === null || candidate[field] === "") {
      return { valid: false, reason: `Missing required field: ${field}` };
    }
  }

  if (typeof candidate.fineRange?.min !== "number" || typeof candidate.fineRange?.max !== "number") {
    return { valid: false, reason: "fineRange must have numeric min and max" };
  }

  if (typeof candidate.maxGoodFaithSpreadRatio !== "number") {
    return { valid: false, reason: "maxGoodFaithSpreadRatio must be a number" };
  }

  if (!isValidGovSource(candidate.officialSourceUrl)) {
    return { valid: false, reason: `officialSourceUrl must be from .gov or .europa.eu domain, got: ${candidate.officialSourceUrl}` };
  }

  return { valid: true };
}

/**
 * Deterministic Regulatory Sync Engine
 * @param {Array} incomingLegislativeUpdates - Optional array of candidate enacted bills to evaluate
 */
export async function runRegulatorySync(incomingLegislativeUpdates = []) {
  console.log("================================================================================");
  console.log("PAYLIT DETERMINISTIC REGULATORY SYNC & STATUTORY SOURCE PROVENANCE ENGINE");
  console.log("================================================================================");

  const configPath = path.resolve(process.cwd(), "src/lib/rules/config.ts");
  const currentFileContent = await fs.readFile(configPath, "utf8");
  const initialHash = computeSha256(currentFileContent);
  console.log(`[STATE] Active rules config SHA-256: ${initialHash}`);
  console.log(`[STATE] Currently tracked statutory jurisdictions: ${Object.keys(STATUTORY_RULES).length}`);

  let hasModifications = false;
  const updatedRules = { ...STATUTORY_RULES };

  // Evaluate candidate legislative updates against gated protection standards
  for (const candidate of incomingLegislativeUpdates) {
    console.log(`\n[EVALUATING] Candidate bill: ${candidate.citation} (${candidate.jurisdiction})`);

    // Gated Check 1: Enactment status
    const status = (candidate.status || "").toLowerCase();
    const isEnacted = status === "enacted" || status === "signed into law" || status === "effective";
    if (!isEnacted) {
      console.log(`  └─ [SKIPPED] Bill status is "${candidate.status}" — only "Enacted" or "Signed into Law" statutes are eligible.`);
      continue;
    }

    // Gated Check 2: Schema and .gov domain validation
    const validation = validateRuleCandidate(candidate);
    if (!validation.valid) {
      console.log(`  └─ [REJECTED] Gated validation failed: ${validation.reason}`);
      continue;
    }

    // Gated Check 3: Automated diff against existing rule
    const existingRule = updatedRules[candidate.key || candidate.code];
    if (existingRule) {
      const isIdentical =
        existingRule.citation === candidate.citation &&
        existingRule.effectiveDate === candidate.effectiveDate &&
        existingRule.fineRange.min === candidate.fineRange.min &&
        existingRule.fineRange.max === candidate.fineRange.max &&
        existingRule.maxGoodFaithSpreadRatio === candidate.maxGoodFaithSpreadRatio &&
        existingRule.officialSourceUrl === candidate.officialSourceUrl;

      if (isIdentical) {
        console.log(`  └─ [UNCHANGED] Existing statutory rule in ${candidate.jurisdiction} matches candidate. No diff.`);
        continue;
      }
    }

    // Approved update
    console.log(`  └─ [APPROVED] Validated statutory update for ${candidate.jurisdiction}. Provenance: ${candidate.officialSourceUrl}`);
    updatedRules[candidate.key || candidate.code] = {
      code: candidate.code,
      jurisdiction: candidate.jurisdiction,
      name: candidate.name,
      citation: candidate.citation,
      effectiveDate: candidate.effectiveDate,
      lastReviewedDate: new Date().toISOString().split("T")[0],
      fineRange: candidate.fineRange,
      requiresRange: candidate.requiresRange,
      maxGoodFaithSpreadRatio: candidate.maxGoodFaithSpreadRatio,
      requiresBenefitsDisclosure: candidate.requiresBenefitsDisclosure,
      requiresAiScreeningDisclosure: candidate.requiresAiScreeningDisclosure,
      description: candidate.description,
      officialSourceUrl: candidate.officialSourceUrl,
      statutoryExcerpts: candidate.statutoryExcerpts,
      governingAgency: candidate.governingAgency,
    };
    hasModifications = true;
  }

  if (!hasModifications) {
    console.log("\n================================================================================");
    console.log("[OUTCOME] Zero statutory modifications detected. Zero writes performed to config.");
    console.log("[OUTCOME] Gated write protection preserved file integrity.");
    console.log("================================================================================");
    return { modified: false, sha256: initialHash };
  }

  // Generate serialized config with strict TypeScript formatting
  const generatedCode = `export interface ComplianceRuleConfig {
  code: string;
  jurisdiction: string;
  name: string;
  citation: string;
  effectiveDate: string;
  lastReviewedDate: string;
  fineRange: {
    min: number;
    max: number;
  };
  requiresRange: boolean;
  maxGoodFaithSpreadRatio: number; // e.g. 0.60
  requiresBenefitsDisclosure: boolean;
  requiresAiScreeningDisclosure: boolean;
  description: string;
  officialSourceUrl: string; // Must be an official .gov or .europa.eu primary link
  statutoryExcerpts: string; // Verbatim legal sentence defining the statutory mandate
  governingAgency: string; // Official state/federal/EU regulatory enforcement agency
}

export const STATUTORY_RULES: Record<string, ComplianceRuleConfig> = ${JSON.stringify(updatedRules, null, 2)};
`;

  const newHash = computeSha256(generatedCode);
  await fs.writeFile(configPath, generatedCode, "utf8");

  console.log("\n================================================================================");
  console.log("[OUTCOME] Successfully updated statutory rules config with verified provenance.");
  console.log(`[OUTCOME] New Config SHA-256 Digest: ${newHash}`);
  console.log("================================================================================");

  return { modified: true, sha256: newHash };
}

// Allow CLI execution directly: `node scripts/regulatory-sync.mjs`
if (process.argv[1] && process.argv[1].endsWith("regulatory-sync.mjs")) {
  runRegulatorySync().catch((err) => {
    console.error("[FATAL Regulatory Sync Error]", err);
    process.exit(1);
  });
}
