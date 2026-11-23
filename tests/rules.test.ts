import { describe, it, expect } from "vitest";
import { parseSalaryFromText } from "../src/lib/rules/salary-parser";
import { detectJurisdictions } from "../src/lib/rules/jurisdiction";
import { evaluateJobCompliance, generateCompliantClause, aggregateScanAudit } from "../src/lib/rules/engine";
import { computeSha256 } from "../src/lib/vault/hash-chain";

describe("Paylit Compliance Rule Engine Unit Tests", () => {
  describe("1. Salary Parsing and Spread Calculations", () => {
    it("parses shorthand k format '$85k–$110k'", () => {
      const res = parseSalaryFromText("Base pay: $85k–$110k annually");
      expect(res.hasSalary).toBe(true);
      expect(res.hasRange).toBe(true);
      expect(res.min).toBe(85000);
      expect(res.max).toBe(110000);
      expect(res.period).toBe("annual");
      expect(res.spreadRatio).toBeCloseTo((110000 - 85000) / 85000, 2);
    });

    it("parses hourly rate '$40.50/hr'", () => {
      const res = parseSalaryFromText("Contract compensation: $40.50/hr");
      expect(res.hasSalary).toBe(true);
      expect(res.min).toBe(40.5);
      expect(res.period).toBe("hourly");
    });

    it("parses hourly range '$40.50 - $65.00 / hour'", () => {
      const res = parseSalaryFromText("Hourly pay rate: $40.50 - $65.00 / hour");
      expect(res.hasSalary).toBe(true);
      expect(res.hasRange).toBe(true);
      expect(res.min).toBe(40.5);
      expect(res.max).toBe(65);
      expect(res.period).toBe("hourly");
      expect(res.spreadRatio).toBeCloseTo((65 - 40.5) / 40.5, 2);
    });

    it("parses verbose currency notation 'USD 90,000 to 120,000'", () => {
      const res = parseSalaryFromText("The expected compensation range is USD 90,000 to 120,000 per year.");
      expect(res.hasSalary).toBe(true);
      expect(res.hasRange).toBe(true);
      expect(res.min).toBe(90000);
      expect(res.max).toBe(120000);
      expect(res.period).toBe("annual");
      expect(res.currency).toBe("USD");
    });

    it("correctly flags excessive spread (>60%)", () => {
      const res = parseSalaryFromText("Salary: $60,000 – $180,000 per year");
      expect(res.hasRange).toBe(true);
      expect(res.spreadRatio).toBe(2.0); // 200% spread
      expect(res.spreadRatio).toBeGreaterThan(0.60);
    });

    it("accepts reasonable good-faith spread (<=60%)", () => {
      const res = parseSalaryFromText("Target base: $120,000 - $160,000");
      expect(res.hasRange).toBe(true);
      expect(res.spreadRatio).toBeCloseTo(0.333, 2);
      expect(res.spreadRatio).toBeLessThanOrEqual(0.60);
    });

    it("identifies single number mentions as incomplete ranges", () => {
      const res = parseSalaryFromText("Salary up to $150,000 depending on experience");
      expect(res.hasSalary).toBe(true);
      expect(res.hasRange).toBe(false);
      expect(res.min).toBe(150000);
    });
  });

  describe("2. Jurisdiction and Scope Detection", () => {
    it("detects California cities and state code", () => {
      const j1 = detectJurisdictions("San Francisco, CA");
      expect(j1.isRegulated).toBe(true);
      expect(j1.jurisdictions).toContain("CA");

      const j2 = detectJurisdictions("Palo Alto, California");
      expect(j2.isRegulated).toBe(true);
      expect(j2.jurisdictions).toContain("CA");
    });

    it("detects New York and NYC", () => {
      const j = detectJurisdictions("New York, NY");
      expect(j.isRegulated).toBe(true);
      expect(j.jurisdictions).toContain("NY");
    });

    it("detects Colorado, Washington, Illinois, and Massachusetts", () => {
      expect(detectJurisdictions("Denver, CO").jurisdictions).toContain("CO");
      expect(detectJurisdictions("Seattle, WA").jurisdictions).toContain("WA");
      expect(detectJurisdictions("Chicago, IL").jurisdictions).toContain("IL");
      expect(detectJurisdictions("Boston, MA").jurisdictions).toContain("MA");
    });

    it("treats Remote - US as exposed to multi-state compliance", () => {
      const j = detectJurisdictions("Remote - US");
      expect(j.isRegulated).toBe(true);
      expect(j.jurisdictions).toContain("REMOTE_US");
      expect(j.jurisdictions).toContain("CA");
      expect(j.jurisdictions).toContain("NY");
      expect(j.jurisdictions).toContain("CO");
      expect(j.jurisdictions).toContain("WA");
      expect(j.jurisdictions).toContain("IL");
    });

    it("leaves unregulated international regions unflagged", () => {
      const j = detectJurisdictions("London, United Kingdom");
      expect(j.isRegulated).toBe(false);
    });
  });

  describe("3. Deterministic Compliance Evaluation & Statutory Checks", () => {
    it("flags missing salary in California listing", () => {
      const audit = evaluateJobCompliance({
        externalId: "job-ca-1",
        title: "Senior Product Designer",
        location: "San Francisco, CA",
        content: "Join our rapid growth team. Competitive compensation and equity package included.",
      });

      expect(audit.isRegulated).toBe(true);
      expect(audit.severity).toBe("violation");
      expect(audit.violationCodes).toContain("MISSING_SALARY_RANGE");
      expect(audit.fineLow).toBeGreaterThanOrEqual(1000);
      expect(audit.reasons.length).toBeGreaterThan(0);
      expect(audit.suggestedClause).toContain("Base Pay Range");
    });

    it("flags excessive salary spread in New York listing", () => {
      const audit = evaluateJobCompliance({
        externalId: "job-ny-2",
        title: "Staff Software Engineer",
        location: "New York, NY",
        content: "Base compensation: $75,000 – $225,000 per year plus health insurance and 401(k).",
      });

      expect(audit.severity).toBe("violation");
      expect(audit.violationCodes).toContain("EXCESSIVE_SPREAD");
      expect(audit.spreadRatio).toBe(2.0);
    });

    it("flags missing benefits in Colorado listing", () => {
      const audit = evaluateJobCompliance({
        externalId: "job-co-3",
        title: "Account Executive",
        location: "Denver, CO",
        content: "Base pay: $90,000 to $110,000 per year.", // No benefits or bonus mentions
      });

      expect(audit.violationCodes).toContain("MISSING_BENEFITS_DISCLOSURE");
      expect(audit.severity).toBe("warning");
    });

    it("flags automated screening without NYC LL144 bias audit notice", () => {
      const audit = evaluateJobCompliance({
        externalId: "job-ai-4",
        title: "Recruiting Coordinator",
        location: "NYC, NY",
        content: "Salary: $80,000 - $95,000 per year. Comprehensive medical benefits. Candidates will complete a 15-minute HireVue automated assessment.",
      });

      expect(audit.violationCodes).toContain("MISSING_NYC_LL144_NOTICE");
    });

    it("passes compliant job with range, benefits, and reasonable spread", () => {
      const audit = evaluateJobCompliance({
        externalId: "job-pass-5",
        title: "Full Stack Engineer",
        location: "Remote - US",
        content:
          "Salary range: $135,000 - $175,000 per year. We provide comprehensive health, dental, and vision insurance, 401k matching, and discretionary annual bonus.",
      });

      expect(audit.severity).toBe("pass");
      expect(audit.violationCodes.length).toBe(0);
      expect(audit.fineLow).toBe(0);
    });
  });

  describe("4. Aggregation and Clause Generation", () => {
    it("generates paste-ready compliant clause with legal disclaimer", () => {
      const clause = generateCompliantClause(["CA", "CO"], "Engineering Manager", 160000, 210000, "annual");
      expect(clause).toContain("Compensation & Statutory Disclosure for Engineering Manager");
      expect(clause).toContain("$160,000 – $210,000");
      expect(clause).toContain("Benefits & Incentive Compensation");
    });

    it("aggregates scan totals and calculates compliance score", () => {
      const results = [
        evaluateJobCompliance({
          externalId: "1",
          title: "Dev 1",
          location: "CA",
          content: "No salary mentioned",
        }),
        evaluateJobCompliance({
          externalId: "2",
          title: "Dev 2",
          location: "CA",
          content: "Salary: $140,000 - $180,000. Full health benefits and 401k.",
        }),
      ];

      const agg = aggregateScanAudit(results);
      expect(agg.jobsFound).toBe(2);
      expect(agg.regulatedJobs).toBe(2);
      expect(agg.criticalViolations).toBe(1);
      expect(agg.complianceScore).toBeLessThan(100);
      expect(agg.fineHigh).toBeGreaterThan(0);
    });
  });

  describe("5. Cryptographic Hash Integrity", () => {
    it("produces deterministic SHA-256 digests", () => {
      const h1 = computeSha256("Paylit-Test-Hash-1");
      const h2 = computeSha256("Paylit-Test-Hash-1");
      const h3 = computeSha256("Paylit-Test-Hash-2");

      expect(h1).toBe(h2);
      expect(h1).not.toBe(h3);
      expect(h1).toHaveLength(64);
    });
  });
});
