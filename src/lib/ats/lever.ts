import { JobInput } from "../rules/engine";
import * as cheerio from "cheerio";

export function extractLeverToken(url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    // e.g. jobs.lever.co/netflix or api.lever.co/v0/postings/netflix
    const pathSegments = parsed.pathname.split("/").filter(Boolean);

    // api.lever.co/v0/postings/{token}
    const postingsIdx = pathSegments.indexOf("postings");
    if (postingsIdx !== -1 && pathSegments[postingsIdx + 1]) {
      return pathSegments[postingsIdx + 1].toLowerCase();
    }

    if (pathSegments.length > 0) {
      return pathSegments[0].toLowerCase();
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchLeverJobs(companyToken: string): Promise<JobInput[]> {
  const apiUrl = `https://api.lever.co/v0/postings/${companyToken}?mode=json`;

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
      throw new Error(`Lever API responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const jobs: JobInput[] = [];

    if (Array.isArray(data)) {
      for (const item of data.slice(0, 50)) {
        let content = "";
        if (item.description) {
          const $ = cheerio.load(item.description);
          content += $.text() + " ";
        }
        if (item.additionalPlain) {
          content += item.additionalPlain + " ";
        }
        if (item.lists && Array.isArray(item.lists)) {
          for (const list of item.lists) {
            content += (list.text || "") + " " + (list.content || "") + " ";
          }
        }

        const location =
          item.categories?.location ||
          item.workplaceType ||
          item.categories?.team ||
          "Unspecified";

        jobs.push({
          externalId: String(item.id || Math.random().toString(36).substring(7)),
          title: item.text || "Untitled Position",
          location,
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
