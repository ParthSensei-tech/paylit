import { STATUTORY_RULES, ComplianceRuleConfig } from "./config";
import { parseSalaryFromText, ParsedSalary } from "./salary-parser";
import { detectJurisdictions, JurisdictionMatch } from "./jurisdiction";

export interface JobInput {
  externalId?: string;
  title: string;
  location: string;
  content?: string; // HTML or cleaned text
  rawText?: string;
}

export interface RuleCheckResult {
  code: string;
  name: string;
  passed: boolean;
  citation: string;
  details: string;
  fineLow: number;
  fineHigh: number;
  officialSourceUrl?: string;
  statutoryExcerpts?: string;
  governingAgency?: string;
}

export interface JobAuditOutput {
  externalId: string;
  title: string;
  location: string;
  jurisdictions: string[];
  isRegulated: boolean;
  rawText: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  period: "annual" | "hourly" | "monthly";
  spreadRatio: number | null;
  checks: RuleCheckResult[];
  violationCodes: string[];
  severity: "pass" | "warning" | "violation";
  fineLow: number;
  fineHigh: number;
  reasons: string[];
  suggestedClause: string;
  disclaimer: string;
}

const STATUTORY_DISCLAIMER = "Automated screening aid, not legal advice.";

/**
 * Checks for benefits/bonus disclosure verbiage required by CO and IL
 */
function checkBenefitsDisclosure(text: string): boolean {
  const lower = text.toLowerCase();
  const benefitKeywords = [
    "benefits",
    "401(k)",
    "401k",
    "health insurance",
    "medical, dental",
    "dental and vision",
    "paid time off",
    "pto",
    "bonus",
    "commission",
    "equity",
    "stock options",
    "life insurance",
    "parental leave",
    "retirement",
  ];

  return benefitKeywords.some((kw) => lower.includes(kw));
}

/**
 * Checks if the posting indicates AI or automated assessment
 */
function detectAutomatedScreening(text: string): { usesAi: boolean; hasDisclosure: boolean } {
  const lower = text.toLowerCase();
  const aiKeywords = [
    "hirevue",
    "automated assessment",
    "algorithmic evaluation",
    "ai-assisted interview",
    "asynchronous video interview",
    "automated screening",
    "pre-employment assessment",
    "predictive talent score",
    "ai screening",
  ];

  const usesAi = aiKeywords.some((kw) => lower.includes(kw));

  // Check if it includes standard compliance notices
  const disclosureKeywords = [
    "local law 144",
    "bias audit",
    "alternative selection process",
    "request an accommodation or alternative screening",
    "opt-out of automated screening",
    "automated employment decision tool",
  ];

  const hasDisclosure = disclosureKeywords.some((kw) => lower.includes(kw));

  return { usesAi, hasDisclosure };
}

/**
 * Generates an ATS paste-ready statutory compliance clause tailored to jurisdiction and position
 */
export function generateCompliantClause(
  jurisdictions: string[],
  title: string,
  minVal?: number | null,
  maxVal?: number | null,
  period: "annual" | "hourly" | "monthly" = "annual"
): string {
  const primaryState = jurisdictions.find((j) => j !== "REMOTE_US") || "CA";
  const displayMin = minVal && minVal > 0 ? minVal : 95000;
  // Good-faith spread under 60%: default to max = min * 1.35
  const displayMax = maxVal && maxVal > displayMin ? Math.min(maxVal, Math.round(displayMin * 1.5)) : Math.round(displayMin * 1.35);

  const formattedMin = "$" + displayMin.toLocaleString("en-US");
  const formattedMax = "$" + displayMax.toLocaleString("en-US");
  const periodText = period === "hourly" ? "/hour" : period === "monthly" ? "/month" : "/year";

  const includesCoOrIl = jurisdictions.includes("CO") || jurisdictions.includes("IL") || jurisdictions.includes("REMOTE_US");

  let clause = `Compensation & Statutory Disclosure for ${title}:\n`;
  clause += `• Base Pay Range: ${formattedMin} – ${formattedMax} ${periodText}. Starting pay is determined by job-related knowledge, skills, experience, and geographic location.\n`;

  if (includesCoOrIl) {
    clause += `• Benefits & Incentive Compensation: In accordance with statutory requirements (including CO Equal Pay for Equal Work Act & IL Equal Pay Act), full-time employees are eligible for comprehensive medical, dental, and vision insurance, 401(k) retirement plan with employer matching, generous paid time off (PTO), paid parental leave, and eligibility for an annual performance-based discretionary bonus.\n`;
  } else {
    clause += `• Benefits: Comprehensive healthcare coverage (medical, dental, vision), 401(k) matching, and paid time off.\n`;
  }

  clause += `• Notice to Applicants: Paylit verified compliance disclosure. Equal Opportunity Employer.`;

  return clause;
}

/**
 * Pure evaluation function for a single job listing
 */
export function evaluateJobCompliance(job: JobInput): JobAuditOutput {
  const raw = job.content || job.rawText || "";
  const extId = job.externalId || `job-${Date.now()}`;
  const text = `${job.title} ${job.location} ${raw}`;
  const jResult = detectJurisdictions(job.location, job.title, raw);
  const salary = parseSalaryFromText(text);

  const checks: RuleCheckResult[] = [];
  const violationCodes: string[] = [];
  const reasons: string[] = [];
  let fineLow = 0;
  let fineHigh = 0;

  // If location has no regulated US state or EU and is not remote US, it passes with standard notice
  if (!jResult.isRegulated) {
    return {
      externalId: extId,
      title: job.title,
      location: job.location,
      jurisdictions: jResult.jurisdictions,
      isRegulated: false,
      rawText: raw.slice(0, 500),
      salaryMin: salary.min,
      salaryMax: salary.max,
      currency: salary.currency,
      period: salary.period,
      spreadRatio: salary.spreadRatio,
      checks: [
        {
          code: "UNREGULATED_JURISDICTION",
          name: "Jurisdiction Outside Statutory Scope",
          passed: true,
          citation: "General",
          details: `Position location "${job.location}" is not currently subject to statutory pay transparency mandates.`,
          fineLow: 0,
          fineHigh: 0,
        },
      ],
      violationCodes: [],
      severity: "pass",
      fineLow: 0,
      fineHigh: 0,
      reasons: [],
      suggestedClause: "",
      disclaimer: STATUTORY_DISCLAIMER,
    };
  }

  // 1. Check: Salary presence and complete range
  const hasCompleteRange = salary.hasSalary && salary.hasRange && salary.min !== null && salary.max !== null;

  if (!salary.hasSalary) {
    violationCodes.push("MISSING_SALARY_RANGE");
    const citingRules = jResult.jurisdictions
      .map((j) => STATUTORY_RULES[j])
      .filter(Boolean);

    const minFine = Math.min(...citingRules.map((r) => r.fineRange.min), 1000);
    const maxFine = Math.max(...citingRules.map((r) => r.fineRange.max), 10000);

    fineLow += minFine;
    fineHigh += maxFine;

    const citationNames = citingRules.map((r) => r.citation).join("; ");
    reasons.push(`No compensation range disclosed. Mandatory under ${citationNames}.`);

    const primaryRule = citingRules[0] || STATUTORY_RULES.CA;

    checks.push({
      code: "MISSING_SALARY_RANGE",
      name: "Mandatory Base Pay Scale Disclosure",
      passed: false,
      citation: citationNames || "Cal. Lab. Code § 432.3; N.Y. Lab. Law § 194-b",
      details: "No numerical base salary or wage scale was found in this posting.",
      fineLow: minFine,
      fineHigh: maxFine,
      officialSourceUrl: primaryRule.officialSourceUrl,
      statutoryExcerpts: primaryRule.statutoryExcerpts,
      governingAgency: primaryRule.governingAgency,
    });
  } else if (!hasCompleteRange) {
    // Has a single number (e.g. "Up to $120,000" or "$45/hr") but not a full min/max range
    violationCodes.push("INCOMPLETE_SALARY_RANGE");
    fineLow += 1000;
    fineHigh += 5000;
    reasons.push(`Single rate disclosed without statutory minimum and maximum range (${salary.rawMatch || "single figure"}).`);

    const primaryRule = jResult.jurisdictions.map((j) => STATUTORY_RULES[j]).find(Boolean) || STATUTORY_RULES.CA;

    checks.push({
      code: "INCOMPLETE_SALARY_RANGE",
      name: "Complete Range (Min & Max) Requirement",
      passed: false,
      citation: "Cal. Lab. Code § 432.3(c)(1); N.Y. Lab. Law § 194-b",
      details: `Posting specifies only a partial wage figure (${salary.rawMatch}). Both the low-end and high-end must be explicitly stated.`,
      fineLow: 1000,
      fineHigh: 5000,
      officialSourceUrl: primaryRule.officialSourceUrl,
      statutoryExcerpts: primaryRule.statutoryExcerpts,
      governingAgency: primaryRule.governingAgency,
    });
  } else {
    const rangeRule = jResult.jurisdictions.map((j) => STATUTORY_RULES[j]).find((r) => r?.requiresRange) || STATUTORY_RULES.CA;

    // Salary range is present: check good-faith spread
    checks.push({
      code: "SALARY_RANGE_PRESENT",
      name: "Mandatory Base Pay Scale Disclosure",
      passed: true,
      citation: "Statutory Range Compliance",
      details: `Disclosed range: $${salary.min?.toLocaleString("en-US")} to $${salary.max?.toLocaleString("en-US")} (${salary.period}).`,
      fineLow: 0,
      fineHigh: 0,
      officialSourceUrl: rangeRule.officialSourceUrl,
      statutoryExcerpts: rangeRule.statutoryExcerpts,
      governingAgency: rangeRule.governingAgency,
    });

    if (salary.spreadRatio !== null && salary.spreadRatio > 0.60) {
      violationCodes.push("EXCESSIVE_SPREAD");
      fineLow += 1000;
      fineHigh += 5000;
      const spreadPct = Math.round(salary.spreadRatio * 100);
      reasons.push(
        `Good-faith spread violation: range spread of ${spreadPct}% ($${salary.min?.toLocaleString("en-US")} – $${salary.max?.toLocaleString("en-US")}) exceeds the 60% regulatory threshold.`
      );

      checks.push({
        code: "EXCESSIVE_SPREAD",
        name: "Good-Faith Pay Scale Spread Limit",
        passed: false,
        citation: "Cal. Lab. Code § 432.3 / NY DOL Guidance",
        details: `The high-end of the band ($${salary.max?.toLocaleString("en-US")}) exceeds the low-end ($${salary.min?.toLocaleString("en-US")}) by ${spreadPct}%. Spreads above 60% are flagged as unreasonable by enforcement agencies.`,
        fineLow: 1000,
        fineHigh: 5000,
        officialSourceUrl: rangeRule.officialSourceUrl,
        statutoryExcerpts: rangeRule.statutoryExcerpts,
        governingAgency: rangeRule.governingAgency,
      });
    } else {
      checks.push({
        code: "GOOD_FAITH_SPREAD",
        name: "Good-Faith Pay Scale Spread Limit",
        passed: true,
        citation: "Regulatory Guidance",
        details: `Spread ratio is ${Math.round((salary.spreadRatio || 0) * 100)}%, within acceptable 60% threshold.`,
        fineLow: 0,
        fineHigh: 0,
        officialSourceUrl: rangeRule.officialSourceUrl,
        statutoryExcerpts: rangeRule.statutoryExcerpts,
        governingAgency: rangeRule.governingAgency,
      });
    }
  }

  // 2. Check: Benefits & Commission disclosure for CO, IL, or REMOTE_US
  const requiresBenefits = jResult.jurisdictions.some((j) => STATUTORY_RULES[j]?.requiresBenefitsDisclosure);
  if (requiresBenefits) {
    const hasBenefits = checkBenefitsDisclosure(text);
    const benefitsRule = jResult.jurisdictions.includes("IL")
      ? STATUTORY_RULES.IL
      : jResult.jurisdictions.includes("CO")
      ? STATUTORY_RULES.CO
      : STATUTORY_RULES.CO;

    if (!hasBenefits) {
      violationCodes.push("MISSING_BENEFITS_DISCLOSURE");
      fineLow += 500;
      fineHigh += 2500;
      reasons.push("Missing required general description of bonuses, commissions, or health/retirement benefits (required in CO/IL/Remote).");

      checks.push({
        code: "MISSING_BENEFITS_DISCLOSURE",
        name: "Mandatory Benefits & Bonus Overview",
        passed: false,
        citation: "C.R.S. § 8-5-201; 820 ILCS 112/11",
        details: "Colorado and Illinois statutes mandate a general description of all employment benefits and incentive compensation.",
        fineLow: 500,
        fineHigh: 2500,
        officialSourceUrl: benefitsRule.officialSourceUrl,
        statutoryExcerpts: benefitsRule.statutoryExcerpts,
        governingAgency: benefitsRule.governingAgency,
      });
    } else {
      checks.push({
        code: "BENEFITS_DISCLOSED",
        name: "Mandatory Benefits & Bonus Overview",
        passed: true,
        citation: "C.R.S. § 8-5-201; 820 ILCS 112/11",
        details: "Sufficient benefits, health, or incentive bonus terms detected.",
        fineLow: 0,
        fineHigh: 0,
        officialSourceUrl: benefitsRule.officialSourceUrl,
        statutoryExcerpts: benefitsRule.statutoryExcerpts,
        governingAgency: benefitsRule.governingAgency,
      });
    }
  }

  // 3. Check: Automated-screening & AI disclosure
  const aiStatus = detectAutomatedScreening(text);
  if (aiStatus.usesAi && !aiStatus.hasDisclosure) {
    const isNycApplicable = jResult.jurisdictions.includes("NY") || jResult.jurisdictions.includes("REMOTE_US");
    const isEuApplicable = jResult.jurisdictions.includes("EU_AI_ACT");

    if (isNycApplicable) {
      violationCodes.push("MISSING_NYC_LL144_NOTICE");
      fineLow += 500;
      fineHigh += 1500;
      reasons.push("Automated/algorithmic screening reference detected without NYC Local Law 144 bias-audit notice or candidate accommodation opt-out.");
      checks.push({
        code: "MISSING_NYC_LL144_NOTICE",
        name: "NYC Automated Employment Decision Tool Notice",
        passed: false,
        citation: "NYC Admin. Code § 20-870 (Local Law 144)",
        details: "Automated assessment language identified without statutory 10-business-day prior notice and published bias-audit link.",
        fineLow: 500,
        fineHigh: 1500,
        officialSourceUrl: STATUTORY_RULES.NYC_LL144.officialSourceUrl,
        statutoryExcerpts: STATUTORY_RULES.NYC_LL144.statutoryExcerpts,
        governingAgency: STATUTORY_RULES.NYC_LL144.governingAgency,
      });
    }

    if (isEuApplicable) {
      violationCodes.push("MISSING_EU_AI_ACT_NOTICE");
      fineLow += 5000;
      fineHigh += 15000;
      reasons.push("AI recruitment tool mentioned without EU AI Act Article 26(11) high-risk worker notification.");
      checks.push({
        code: "MISSING_EU_AI_ACT_NOTICE",
        name: "EU AI Act High-Risk Employment Notification",
        passed: false,
        citation: "Regulation (EU) 2024/1689 Art. 26(11)",
        details: "Deployers of high-risk AI systems in recruitment must inform affected workers and candidates before algorithmic assessment.",
        fineLow: 5000,
        fineHigh: 15000,
        officialSourceUrl: STATUTORY_RULES.EU_AI_ACT.officialSourceUrl,
        statutoryExcerpts: STATUTORY_RULES.EU_AI_ACT.statutoryExcerpts,
        governingAgency: STATUTORY_RULES.EU_AI_ACT.governingAgency,
      });
    }
  }

  // Determine overall severity
  let severity: "pass" | "warning" | "violation" = "pass";
  if (violationCodes.includes("MISSING_SALARY_RANGE") || violationCodes.includes("EXCESSIVE_SPREAD")) {
    severity = "violation";
  } else if (violationCodes.length > 0) {
    severity = "warning";
  }

  const suggestedClause = generateCompliantClause(
    jResult.jurisdictions,
    job.title,
    salary.min,
    salary.max,
    salary.period
  );

  return {
    externalId: extId,
    title: job.title,
    location: job.location,
    jurisdictions: jResult.jurisdictions,
    isRegulated: true,
    rawText: raw.slice(0, 1000),
    salaryMin: salary.min,
    salaryMax: salary.max,
    currency: salary.currency,
    period: salary.period,
    spreadRatio: salary.spreadRatio,
    checks,
    violationCodes,
    severity,
    fineLow,
    fineHigh,
    reasons,
    suggestedClause,
    disclaimer: STATUTORY_DISCLAIMER,
  };
}

/**
 * Aggregates audit results into an overall scan evaluation
 */
export function aggregateScanAudit(results: JobAuditOutput[]) {
  const jobsFound = results.length;
  const regulatedJobs = results.filter((r) => r.isRegulated).length;
  const violationResults = results.filter((r) => r.severity === "violation");
  const warningResults = results.filter((r) => r.severity === "warning");
  const violations = violationResults.length + warningResults.length;

  let fineLow = 0;
  let fineHigh = 0;
  for (const r of results) {
    fineLow += r.fineLow;
    fineHigh += r.fineHigh;
  }

  // Compliance score calculation:
  // If no regulated jobs: 100
  // Each violation deducts 20 points, each warning deducts 10 points
  let score = 100;
  if (regulatedJobs > 0) {
    const penalty = (violationResults.length * 25 + warningResults.length * 10) / regulatedJobs;
    score = Math.max(0, Math.min(100, Math.round(100 - penalty)));
  }

  return {
    jobsFound,
    regulatedJobs,
    violations,
    criticalViolations: violationResults.length,
    warnings: warningResults.length,
    complianceScore: score,
    fineLow,
    fineHigh,
  };
}
