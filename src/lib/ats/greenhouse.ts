import { JobInput } from "../rules/engine";
import * as cheerio from "cheerio";

export function extractGreenhouseToken(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // e.g. boards.greenhouse.io/stripe or boards-api.greenhouse.io/v1/boards/stripe/jobs
    const pathSegments = parsed.pathname.split("/").filter(Boolean);

    // boards-api.greenhouse.io/v1/boards/{token}/jobs
    const boardsIdx = pathSegments.indexOf("boards");
    if (boardsIdx !== -1 && pathSegments[boardsIdx + 1]) {
      return pathSegments[boardsIdx + 1].toLowerCase();
    }

    // boards.greenhouse.io/embed/job_board?for={token}
    const forParam = parsed.searchParams.get("for");
    if (forParam) {
      return forParam.toLowerCase();
    }

    // boards.greenhouse.io/{token}
    if (pathSegments.length > 0) {
      return pathSegments[0].toLowerCase();
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchGreenhouseJobs(companyToken: string): Promise<JobInput[]> {
  const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${companyToken}/jobs?content=true`;

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
      throw new Error(`Greenhouse API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const jobs: JobInput[] = [];

    if (Array.isArray(data.jobs)) {
      for (const item of data.jobs.slice(0, 50)) {
        // Strip HTML tags for clean parsing
        let plainContent = "";
        if (item.content) {
          const $ = cheerio.load(item.content);
          plainContent = $.text().replace(/\s+/g, " ").trim();
        }

        jobs.push({
          externalId: String(item.id || Math.random().toString(36).substring(7)),
          title: item.title || "Untitled Position",
          location: item.location?.name || "Unspecified",
          content: plainContent,
        });
      }
    }

    return jobs;
  } catch (err: any) {
    clearTimeout(timeoutId);
    throw err;
  }
}
