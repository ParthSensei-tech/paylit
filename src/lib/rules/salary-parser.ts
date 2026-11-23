export interface ParsedSalary {
  hasSalary: boolean;
  hasRange: boolean;
  min: number | null;
  max: number | null;
  currency: string;
  period: "annual" | "hourly" | "monthly";
  spreadRatio: number | null; // (max - min) / min
  rawMatch?: string;
}

/**
 * Normalizes number representation (e.g., "$120k" -> 120000, "95,000" -> 95000, "45.50" -> 45.5)
 */
function parseNumericValue(val: string): number | null {
  if (!val) return null;
  const cleaned = val.trim().toLowerCase().replace(/,/g, "");

  if (cleaned.endsWith("k")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1000;
  }

  if (cleaned.endsWith("m")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1000000;
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Detects currency from token or string
 */
function detectCurrency(text: string): string {
  if (text.includes("EUR") || text.includes("€")) return "EUR";
  if (text.includes("GBP") || text.includes("£")) return "GBP";
  if (text.includes("CAD")) return "CAD";
  if (text.includes("AUD")) return "AUD";
  return "USD";
}

/**
 * Detects pay frequency/period
 */
function detectPeriod(text: string, minVal?: number | null): "annual" | "hourly" | "monthly" {
  const lower = text.toLowerCase();
  if (lower.includes("/hr") || lower.includes("per hour") || lower.includes("/hour") || lower.includes("hourly")) {
    return "hourly";
  }
  if (lower.includes("/mo") || lower.includes("per month") || lower.includes("monthly")) {
    return "monthly";
  }
  if (lower.includes("/yr") || lower.includes("per year") || lower.includes("annual") || lower.includes("annually") || lower.includes("/year")) {
    return "annual";
  }

  // Heuristic if unspecified: values < $500 are typically hourly
  if (minVal && minVal < 500) {
    return "hourly";
  }

  return "annual";
}

export function parseSalaryFromText(text: string): ParsedSalary {
  if (!text) {
    return {
      hasSalary: false,
      hasRange: false,
      min: null,
      max: null,
      currency: "USD",
      period: "annual",
      spreadRatio: null,
    };
  }

  const currency = detectCurrency(text);

  // Regex patterns to capture various formats:
  // 1. Range: ($|USD|EUR|GBP)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?k?m?)\s*(?:-|–|—|to)\s*(\$|USD|EUR|GBP)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?k?m?)\s*(?:\/(?:hr|hour|yr|year|mo|month)|per (?:hour|year|annum|month))?
  const rangePattern = /(?:(?:USD|\$|EUR|€|GBP|£)\s*)?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?[kKmM]?)\s*(?:-|–|—|\bto\b)\s*(?:(?:USD|\$|EUR|€|GBP|£)\s*)?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?[kKmM]?)\s*(?:\/(?:hr|hour|yr|year|mo|month)|\bper (?:hour|year|annum|month)\b|\bhourly\b|\bannually\b)?/i;

  const matches = text.match(new RegExp(rangePattern, "gi"));

  if (matches && matches.length > 0) {
    // Look through matched candidate ranges
    for (const matchStr of matches) {
      // Ignore years like "2024 - 2025" or "10 - 15 years"
      if (
        /\b(?:years|months|days|weeks|fte|hours|pts)\b/i.test(matchStr) ||
        /\b(?:19|20)\d{2}\s*[-–]\s*(?:19|20)\d{2}\b/.test(matchStr)
      ) {
        continue;
      }

      // Check if context has currency signs or salary keywords
      const idx = text.indexOf(matchStr);
      const surroundingContext = text.slice(Math.max(0, idx - 40), Math.min(text.length, idx + matchStr.length + 40)).toLowerCase();

      const hasSalaryContext =
        surroundingContext.includes("$") ||
        surroundingContext.includes("usd") ||
        surroundingContext.includes("salary") ||
        surroundingContext.includes("pay") ||
        surroundingContext.includes("compensation") ||
        surroundingContext.includes("rate") ||
        surroundingContext.includes("base") ||
        surroundingContext.includes("/hr") ||
        surroundingContext.includes("hour");

      if (!hasSalaryContext && !matchStr.includes("$") && !matchStr.toLowerCase().includes("usd")) {
        continue;
      }

      const subMatch = matchStr.match(rangePattern);
      if (subMatch && subMatch[1] && subMatch[2]) {
        let min = parseNumericValue(subMatch[1]);
        let max = parseNumericValue(subMatch[2]);

        if (min !== null && max !== null) {
          // If min was parsed as e.g. 85 and max as 110000 (e.g. "85k - 110,000" or "85 - 110k")
          if (min < 1000 && max >= 10000 && !matchStr.toLowerCase().includes("hr") && !matchStr.toLowerCase().includes("hour")) {
            min = min * 1000;
          }

          if (min > max) {
            const tmp = min;
            min = max;
            max = tmp;
          }

          const period = detectPeriod(surroundingContext + " " + matchStr, min);
          const spreadRatio = min > 0 ? (max - min) / min : null;

          return {
            hasSalary: true,
            hasRange: true,
            min,
            max,
            currency,
            period,
            spreadRatio: spreadRatio !== null ? Math.round(spreadRatio * 1000) / 1000 : null,
            rawMatch: matchStr.trim(),
          };
        }
      }
    }
  }

  // Check for single salary mentions like "$120,000/yr" or "Starting at $45/hr"
  const singlePattern = /(?:(?:USD|\$|EUR|€|GBP|£)\s*)([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?[kKmM]?)\s*(?:\/(?:hr|hour|yr|year|mo|month)|\bper (?:hour|year|annum|month)\b)?/i;
  const singleMatches = text.match(new RegExp(singlePattern, "gi"));

  if (singleMatches && singleMatches.length > 0) {
    for (const matchStr of singleMatches) {
      if (/\b(?:19|20)\d{2}\b/.test(matchStr)) continue; // avoid year
      const sub = matchStr.match(singlePattern);
      if (sub && sub[1]) {
        const val = parseNumericValue(sub[1]);
        if (val !== null && val > 0) {
          const period = detectPeriod(matchStr, val);
          return {
            hasSalary: true,
            hasRange: false, // Single number is not a complete min/max range
            min: val,
            max: val,
            currency,
            period,
            spreadRatio: 0,
            rawMatch: matchStr.trim(),
          };
        }
      }
    }
  }

  return {
    hasSalary: false,
    hasRange: false,
    min: null,
    max: null,
    currency,
    period: "annual",
    spreadRatio: null,
  };
}
