import { describe, it, expect } from "vitest";
import { extractCompanyInfoFromUrl, getScoreGrade, BENCHMARK_COMPANIES } from "../src/lib/companies/index-data";
import { evaluateJobCompliance } from "../src/lib/rules/engine";
import { ENFORCEMENT_BULLETINS, generateNewsjackingPost } from "../src/lib/regulatory/enforcement-feed";

describe("Loop 1: Programmatic State Pay Transparency Index", () => {
  it("extracts company info from Greenhouse, Lever, Ashby, and custom URLs", () => {
    const gh = extractCompanyInfoFromUrl("https://boards.greenhouse.io/stripe");
    expect(gh.slug).toBe("stripe");
    expect(gh.name).toBe("Stripe");

    const lever = extractCompanyInfoFromUrl("https://jobs.lever.co/palantir");
    expect(lever.slug).toBe("palantir");
    expect(lever.name).toBe("Palantir Technologies");

    const ashby = extractCompanyInfoFromUrl("https://jobs.ashbyhq.com/linear");
    expect(ashby.slug).toBe("linear");
    expect(ashby.name).toBe("Linear");

    const custom = extractCompanyInfoFromUrl("https://careers.datadoghq.com/jobs");
    expect(custom.slug).toBe("datadoghq");
  });

  it("calculates statutory compliance letter grades accurately", () => {
    expect(getScoreGrade(95)).toBe("A");
    expect(getScoreGrade(90)).toBe("A");
    expect(getScoreGrade(85)).toBe("B");
    expect(getScoreGrade(72)).toBe("C");
    expect(getScoreGrade(64)).toBe("D");
    expect(getScoreGrade(45)).toBe("F");
  });

  it("contains pre-seeded high-authority benchmark companies with complete fields", () => {
    expect(BENCHMARK_COMPANIES.length).toBeGreaterThanOrEqual(8);
    for (const c of BENCHMARK_COMPANIES) {
      expect(c.slug).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.complianceScore).toBeGreaterThan(0);
      expect(c.jurisdictions.length).toBeGreaterThan(0);
      expect(c.careersUrl).toMatch(/^https?:\/\//);
    }
  });
});

describe("Loop 2: Candidate Viral Loop & Checker", () => {
  it("flags listings missing required salary transparency under CA SB 1162", () => {
    const evaluation = evaluateJobCompliance({
      title: "Product Designer",
      location: "San Francisco, CA",
      rawText: "Join our fast-paced design team in SF. Competitive salary and benefits.",
    });

    expect(evaluation.severity).toBe("violation");
    expect(evaluation.violationCodes).toContain("MISSING_SALARY_RANGE");
    expect(evaluation.fineHigh).toBeGreaterThan(0);
  });

  it("flags excessive salary spreads exceeding the 60% good-faith standard", () => {
    const evaluation = evaluateJobCompliance({
      title: "Senior Backend Engineer",
      location: "New York, NY",
      rawText: "Base salary range: $100,000 to $250,000. Full health insurance included.",
    });

    expect(evaluation.spreadRatio).toBe(1.5);
    expect(evaluation.violationCodes).toContain("EXCESSIVE_SPREAD");
  });

  it("validates compliant postings that provide min, max, and required benefits", () => {
    const evaluation = evaluateJobCompliance({
      title: "Staff Engineer",
      location: "Denver, CO",
      rawText: "Salary: $160,000 - $190,000. Comprehensive benefits: 401(k), health, dental, vision, and annual performance bonus.",
    });

    expect(evaluation.violationCodes).not.toContain("MISSING_SALARY_RANGE");
    expect(evaluation.violationCodes).not.toContain("EXCESSIVE_SPREAD");
    expect(evaluation.violationCodes).not.toContain("MISSING_BENEFITS");
  });
});

describe("Loop 4: Regulatory Newsjacking & Enforcement Generator", () => {
  it("formats 3-paragraph executive LinkedIn posts citing exact agency and statutes", () => {
    const bulletin = ENFORCEMENT_BULLETINS[0];
    const post = generateNewsjackingPost(bulletin, "https://paylit.dev");

    expect(post).toContain(bulletin.agency);
    expect(post).toContain(bulletin.citation);
    expect(post).toContain(bulletin.fineAmount);
    expect(post).toContain("https://paylit.dev/?ref=newsjacking_ca");
    expect(post).toContain("#PayTransparency");
  });
});
