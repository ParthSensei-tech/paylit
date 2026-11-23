import { extractGreenhouseToken, fetchGreenhouseJobs } from "./greenhouse";
import { extractLeverToken, fetchLeverJobs } from "./lever";
import { extractAshbyToken, fetchAshbyJobs } from "./ashby";
import { fetchGenericJobs } from "./generic";
import { JobInput } from "../rules/engine";

export type AtsType = "greenhouse" | "lever" | "ashby" | "generic";

export interface DetectionResult {
  atsType: AtsType;
  token?: string;
  normalizedUrl: string;
}

export function detectAtsType(url: string): DetectionResult {
  const lower = url.toLowerCase();

  if (lower.includes("greenhouse.io")) {
    const token = extractGreenhouseToken(url);
    return {
      atsType: "greenhouse",
      token: token || undefined,
      normalizedUrl: url,
    };
  }

  if (lower.includes("lever.co")) {
    const token = extractLeverToken(url);
    return {
      atsType: "lever",
      token: token || undefined,
      normalizedUrl: url,
    };
  }

  if (lower.includes("ashbyhq.com")) {
    const token = extractAshbyToken(url);
    return {
      atsType: "ashby",
      token: token || undefined,
      normalizedUrl: url,
    };
  }

  return {
    atsType: "generic",
    normalizedUrl: url,
  };
}

export async function fetchJobsFromSource(url: string): Promise<{ atsType: AtsType; jobs: JobInput[] }> {
  const detected = detectAtsType(url);

  if (detected.atsType === "greenhouse" && detected.token) {
    try {
      const jobs = await fetchGreenhouseJobs(detected.token);
      return { atsType: "greenhouse", jobs };
    } catch {
      // If direct API failed, try generic
    }
  }

  if (detected.atsType === "lever" && detected.token) {
    try {
      const jobs = await fetchLeverJobs(detected.token);
      return { atsType: "lever", jobs };
    } catch {
      // If direct API failed, try generic
    }
  }

  if (detected.atsType === "ashby" && detected.token) {
    try {
      const jobs = await fetchAshbyJobs(detected.token);
      return { atsType: "ashby", jobs };
    } catch {
      // If direct API failed, try generic
    }
  }

  const jobs = await fetchGenericJobs(url);
  return { atsType: "generic", jobs };
}
