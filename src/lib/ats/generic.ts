import { JobInput } from "../rules/engine";
import * as cheerio from "cheerio";

async function isAllowedByRobotsTxt(targetUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(targetUrl);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(robotsUrl, {
      headers: { "User-Agent": "PaylitComplianceBot/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return true; // Standard robots.txt rule: if 404/error, allow crawling
    const text = await res.text();

    // Check simple Disallow rules for * or Paylit
    const lines = text.split("\n").map((l) => l.trim().toLowerCase());
    let relevantAgent = false;
    for (const line of lines) {
      if (line.startsWith("user-agent:")) {
        const agent = line.replace("user-agent:", "").trim();
        relevantAgent = agent === "*" || agent.includes("paylit");
      } else if (relevantAgent && line.startsWith("disallow:")) {
        const path = line.replace("disallow:", "").trim();
        if (path === "/" || (path && parsed.pathname.startsWith(path))) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return true; // fail-open for timeout
  }
}

export async function fetchGenericJobs(url: string): Promise<JobInput[]> {
  const allowed = await isAllowedByRobotsTxt(url);
  if (!allowed) {
    throw new Error("Robots.txt restricts automated compliance scanning on this domain.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PaylitComplianceBot/1.0 (+https://paylit.compliance)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Target page returned HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs: JobInput[] = [];

    // 1. JSON-LD JobPosting Extraction
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const jsonContent = $(elem).html();
        if (!jsonContent) return;
        const parsed = JSON.parse(jsonContent);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          if (item["@type"] === "JobPosting") {
            let salaryStr = "";
            if (item.baseSalary) {
              const bs = item.baseSalary;
              const val = bs.value;
              if (val) {
                salaryStr = ` Base Salary: ${val.minValue || ""} - ${val.maxValue || val.value || ""} ${val.unitText || ""}`;
              }
            }

            jobs.push({
              externalId: String(item.identifier?.value || Math.random().toString(36).substring(7)),
              title: item.title || "Untitled Position",
              location: item.jobLocation?.address?.addressLocality || item.jobLocationType || "Unspecified",
              content: `${item.description || ""} ${salaryStr}`.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
            });
          }
        }
      } catch {
        // ignore malformed JSON-LD
      }
    });

    if (jobs.length > 0) {
      return jobs.slice(0, 50);
    }

    // 2. Fallback Heuristic Card Scraping
    const candidateSelectors = [
      '[class*="job-posting"]',
      '[class*="job-item"]',
      '[class*="career-item"]',
      '[data-testid*="job"]',
      'li[class*="job"]',
      'div[class*="posting"]',
    ];

    for (const sel of candidateSelectors) {
      const elements = $(sel);
      if (elements.length > 0) {
        elements.slice(0, 30).each((i, el) => {
          const $el = $(el);
          const title = $el.find("h2, h3, h4, [class*='title']").first().text().trim() || `Position #${i + 1}`;
          const location = $el.find("[class*='location'], [class*='city'], span").first().text().trim() || "Unspecified";
          const text = $el.text().replace(/\s+/g, " ").trim();

          if (text.length > 20) {
            jobs.push({
              externalId: `generic-${i}-${Math.random().toString(36).substring(5)}`,
              title,
              location,
              content: text,
            });
          }
        });
        if (jobs.length > 0) break;
      }
    }

    return jobs;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}
