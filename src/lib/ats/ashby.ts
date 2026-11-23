import { JobInput } from "../rules/engine";
import * as cheerio from "cheerio";

export function extractAshbyToken(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // e.g. jobs.ashbyhq.com/company
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    if (pathSegments.length > 0) {
      return pathSegments[0].toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchAshbyJobs(companyToken: string): Promise<JobInput[]> {
  const apiUrl = `https://api.ashbyhq.com/posting-api/job-board/${companyToken}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "PaylitComplianceBot/1.0 (+https://paylit.compliance)",
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ashby API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const jobs: JobInput[] = [];

    const postings = data.jobs || data.jobPostings || [];
    if (Array.isArray(postings)) {
      for (const item of postings.slice(0, 50)) {
        let content = "";
        if (item.descriptionHtml) {
          const $ = cheerio.load(item.descriptionHtml);
          content = $.text();
        } else if (item.descriptionPlain) {
          content = item.descriptionPlain;
        }

        if (item.compensationTierSummary) {
          content += ` Compensation: ${item.compensationTierSummary}`;
        }

        jobs.push({
          externalId: String(item.id || Math.random().toString(36).substring(7)),
          title: item.title || "Untitled Position",
          location: item.locationName || (item.isRemote ? "Remote" : "Unspecified"),
          content: content.replace(/\s+/g, " ").trim(),
        });
      }
    }

    return jobs;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}
