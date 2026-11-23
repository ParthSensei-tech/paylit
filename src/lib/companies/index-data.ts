import { prisma } from "../prisma";

export interface CompanyIndexItem {
  id: string;
  slug: string;
  name: string;
  careersUrl: string;
  atsType: string;
  complianceScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  totalJobs: number;
  regulatedJobs: number;
  violations: number;
  jurisdictions: string[];
  spreadFlags: number;
  benefitFlags: number;
  aiFlags: number;
  lastScannedAt: string;
  claimed: boolean;
  scanRunId?: string | null;
}

export function getScoreGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function extractCompanyInfoFromUrl(rawUrl: string): { slug: string; name: string } {
  try {
    const url = new URL(rawUrl);
    const pathname = url.pathname.toLowerCase();
    const hostname = url.hostname.toLowerCase();

    // Greenhouse pattern: boards.greenhouse.io/{company} or boards-api.greenhouse.io/v1/boards/{company}
    if (hostname.includes("greenhouse.io")) {
      const match = pathname.match(/\/(?:v1\/boards\/)?([a-z0-9_-]+)/);
      if (match && match[1] && match[1] !== "embed") {
        const slug = match[1];
        return { slug, name: formatCompanyName(slug) };
      }
    }

    // Lever pattern: jobs.lever.co/{company} or api.lever.co/v0/postings/{company}
    if (hostname.includes("lever.co")) {
      const match = pathname.match(/\/(?:v0\/postings\/)?([a-z0-9_-]+)/);
      if (match && match[1]) {
        const slug = match[1];
        return { slug, name: formatCompanyName(slug) };
      }
    }

    // Ashby pattern: jobs.ashbyhq.com/{company}
    if (hostname.includes("ashbyhq.com")) {
      const match = pathname.match(/\/([a-z0-9_-]+)/);
      if (match && match[1]) {
        const slug = match[1];
        return { slug, name: formatCompanyName(slug) };
      }
    }

    // Hostname fallback e.g. careers.stripe.com -> stripe
    const hostParts = hostname.replace("www.", "").split(".");
    const primaryPart = hostParts[0] === "careers" || hostParts[0] === "jobs" ? hostParts[1] : hostParts[0];
    const slug = primaryPart.replace(/[^a-z0-9-]/g, "") || "company";
    return { slug, name: formatCompanyName(slug) };
  } catch {
    return { slug: "company", name: "Company" };
  }
}

function formatCompanyName(slug: string): string {
  const overrides: Record<string, string> = {
    stripe: "Stripe",
    palantir: "Palantir Technologies",
    datadog: "Datadog",
    figma: "Figma",
    cloudflare: "Cloudflare",
    airbnb: "Airbnb",
    snowflake: "Snowflake",
    github: "GitHub",
    reddit: "Reddit",
    uber: "Uber",
    coinbase: "Coinbase",
    doordash: "DoorDash",
    pinterest: "Pinterest",
    notion: "Notion",
    canva: "Canva",
  };

  if (overrides[slug.toLowerCase()]) {
    return overrides[slug.toLowerCase()];
  }

  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const BENCHMARK_COMPANIES: CompanyIndexItem[] = [
  {
    id: "bench-stripe",
    slug: "stripe",
    name: "Stripe",
    careersUrl: "https://boards.greenhouse.io/stripe",
    atsType: "greenhouse",
    complianceScore: 94,
    grade: "A",
    totalJobs: 142,
    regulatedJobs: 98,
    violations: 6,
    jurisdictions: ["CA", "NY", "WA", "CO", "IL"],
    spreadFlags: 2,
    benefitFlags: 3,
    aiFlags: 1,
    lastScannedAt: "2026-11-23T18:00:00.000Z",
    claimed: true,
  },
  {
    id: "bench-palantir",
    slug: "palantir",
    name: "Palantir Technologies",
    careersUrl: "https://jobs.lever.co/palantir",
    atsType: "lever",
    complianceScore: 88,
    grade: "B",
    totalJobs: 86,
    regulatedJobs: 64,
    violations: 8,
    jurisdictions: ["CA", "NY", "CO", "WA"],
    spreadFlags: 4,
    benefitFlags: 2,
    aiFlags: 2,
    lastScannedAt: "2026-11-23T17:30:00.000Z",
    claimed: false,
  },
  {
    id: "bench-datadog",
    slug: "datadog",
    name: "Datadog",
    careersUrl: "https://boards.greenhouse.io/datadog",
    atsType: "greenhouse",
    complianceScore: 91,
    grade: "A",
    totalJobs: 120,
    regulatedJobs: 75,
    violations: 7,
    jurisdictions: ["NY", "CA", "CO", "MA"],
    spreadFlags: 3,
    benefitFlags: 4,
    aiFlags: 0,
    lastScannedAt: "2026-11-23T16:15:00.000Z",
    claimed: false,
  },
  {
    id: "bench-figma",
    slug: "figma",
    name: "Figma",
    careersUrl: "https://boards.greenhouse.io/figma",
    atsType: "greenhouse",
    complianceScore: 96,
    grade: "A",
    totalJobs: 78,
    regulatedJobs: 58,
    violations: 2,
    jurisdictions: ["CA", "NY", "WA", "CO"],
    spreadFlags: 1,
    benefitFlags: 1,
    aiFlags: 0,
    lastScannedAt: "2026-11-23T15:45:00.000Z",
    claimed: true,
  },
  {
    id: "bench-cloudflare",
    slug: "cloudflare",
    name: "Cloudflare",
    careersUrl: "https://boards.greenhouse.io/cloudflare",
    atsType: "greenhouse",
    complianceScore: 82,
    grade: "B",
    totalJobs: 95,
    regulatedJobs: 62,
    violations: 11,
    jurisdictions: ["CA", "WA", "IL", "NY"],
    spreadFlags: 5,
    benefitFlags: 4,
    aiFlags: 2,
    lastScannedAt: "2026-11-23T14:20:00.000Z",
    claimed: false,
  },
  {
    id: "bench-snowflake",
    slug: "snowflake",
    name: "Snowflake",
    careersUrl: "https://boards.greenhouse.io/snowflake",
    atsType: "greenhouse",
    complianceScore: 89,
    grade: "B",
    totalJobs: 110,
    regulatedJobs: 72,
    violations: 9,
    jurisdictions: ["CA", "WA", "CO", "NY"],
    spreadFlags: 3,
    benefitFlags: 5,
    aiFlags: 1,
    lastScannedAt: "2026-11-23T13:10:00.000Z",
    claimed: false,
  },
  {
    id: "bench-canva",
    slug: "canva",
    name: "Canva",
    careersUrl: "https://jobs.lever.co/canva",
    atsType: "lever",
    complianceScore: 76,
    grade: "C",
    totalJobs: 68,
    regulatedJobs: 41,
    violations: 14,
    jurisdictions: ["CA", "NY", "Remote-US"],
    spreadFlags: 7,
    benefitFlags: 5,
    aiFlags: 2,
    lastScannedAt: "2026-11-23T12:00:00.000Z",
    claimed: false,
  },
  {
    id: "bench-notion",
    slug: "notion",
    name: "Notion",
    careersUrl: "https://jobs.lever.co/notion",
    atsType: "lever",
    complianceScore: 93,
    grade: "A",
    totalJobs: 54,
    regulatedJobs: 46,
    violations: 3,
    jurisdictions: ["CA", "NY", "CO"],
    spreadFlags: 1,
    benefitFlags: 2,
    aiFlags: 0,
    lastScannedAt: "2026-11-23T11:40:00.000Z",
    claimed: true,
  },
];

export async function getAllCompanyProfiles(): Promise<CompanyIndexItem[]> {
  try {
    const dbProfiles = await prisma.companyProfile.findMany({
      orderBy: { complianceScore: "desc" },
    });

    const parsedDbProfiles: CompanyIndexItem[] = dbProfiles.map((p) => {
      let jList: string[] = [];
      try {
        jList = JSON.parse(p.jurisdictions);
      } catch {
        jList = ["CA", "NY"];
      }
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        careersUrl: p.careersUrl,
        atsType: p.atsType,
        complianceScore: p.complianceScore,
        grade: p.grade as any,
        totalJobs: p.totalJobs,
        regulatedJobs: p.regulatedJobs,
        violations: p.violations,
        jurisdictions: jList,
        spreadFlags: p.spreadFlags,
        benefitFlags: p.benefitFlags,
        aiFlags: p.aiFlags,
        lastScannedAt: p.lastScannedAt.toISOString(),
        claimed: p.claimed,
        scanRunId: p.scanRunId,
      };
    });

    // Merge benchmarks without duplicate slugs
    const existingSlugs = new Set(parsedDbProfiles.map((p) => p.slug.toLowerCase()));
    const benchmarksToAdd = BENCHMARK_COMPANIES.filter((b) => !existingSlugs.has(b.slug.toLowerCase()));

    return [...parsedDbProfiles, ...benchmarksToAdd].sort((a, b) => b.complianceScore - a.complianceScore);
  } catch (err) {
    console.error("[getAllCompanyProfiles Error]", err);
    return BENCHMARK_COMPANIES;
  }
}

export async function getCompanyProfileBySlug(slug: string): Promise<CompanyIndexItem | null> {
  const normalizedSlug = slug.toLowerCase();
  try {
    const dbProfile = await prisma.companyProfile.findUnique({
      where: { slug: normalizedSlug },
    });

    if (dbProfile) {
      let jList: string[] = [];
      try {
        jList = JSON.parse(dbProfile.jurisdictions);
      } catch {
        jList = ["CA", "NY"];
      }
      return {
        id: dbProfile.id,
        slug: dbProfile.slug,
        name: dbProfile.name,
        careersUrl: dbProfile.careersUrl,
        atsType: dbProfile.atsType,
        complianceScore: dbProfile.complianceScore,
        grade: dbProfile.grade as any,
        totalJobs: dbProfile.totalJobs,
        regulatedJobs: dbProfile.regulatedJobs,
        violations: dbProfile.violations,
        jurisdictions: jList,
        spreadFlags: dbProfile.spreadFlags,
        benefitFlags: dbProfile.benefitFlags,
        aiFlags: dbProfile.aiFlags,
        lastScannedAt: dbProfile.lastScannedAt.toISOString(),
        claimed: dbProfile.claimed,
        scanRunId: dbProfile.scanRunId,
      };
    }
  } catch (err) {
    console.error("[getCompanyProfileBySlug Error]", err);
  }

  const benchmark = BENCHMARK_COMPANIES.find((b) => b.slug.toLowerCase() === normalizedSlug);
  return benchmark || null;
}

export async function upsertCompanyFromScan(params: {
  scanRunId: string;
  sourceUrl: string;
  atsType: string;
  totals: {
    jobsFound: number;
    regulatedJobs: number;
    violations: number;
    complianceScore: number;
  };
  auditResults: any[];
}) {
  try {
    const { slug, name } = extractCompanyInfoFromUrl(params.sourceUrl);
    const score = params.totals.complianceScore;
    const grade = getScoreGrade(score);

    // Collect jurisdictions and count exceptions
    const jurisdictionSet = new Set<string>();
    let spreadFlags = 0;
    let benefitFlags = 0;
    let aiFlags = 0;

    for (const r of params.auditResults) {
      if (Array.isArray(r.jurisdictions)) {
        r.jurisdictions.forEach((j: string) => jurisdictionSet.add(j));
      }
      const codes = Array.isArray(r.violationCodes) ? r.violationCodes : [];
      if (codes.includes("EXCESSIVE_SPREAD")) spreadFlags++;
      if (codes.includes("MISSING_BENEFITS")) benefitFlags++;
      if (codes.includes("MISSING_AI_DISCLOSURE")) aiFlags++;
    }

    const jurisdictions = Array.from(jurisdictionSet);

    await prisma.companyProfile.upsert({
      where: { slug },
      update: {
        name,
        careersUrl: params.sourceUrl,
        atsType: params.atsType,
        complianceScore: score,
        grade,
        totalJobs: params.totals.jobsFound,
        regulatedJobs: params.totals.regulatedJobs,
        violations: params.totals.violations,
        jurisdictions: JSON.stringify(jurisdictions),
        spreadFlags,
        benefitFlags,
        aiFlags,
        lastScannedAt: new Date(),
        scanRunId: params.scanRunId,
      },
      create: {
        slug,
        name,
        careersUrl: params.sourceUrl,
        atsType: params.atsType,
        complianceScore: score,
        grade,
        totalJobs: params.totals.jobsFound,
        regulatedJobs: params.totals.regulatedJobs,
        violations: params.totals.violations,
        jurisdictions: JSON.stringify(jurisdictions),
        spreadFlags,
        benefitFlags,
        aiFlags,
        lastScannedAt: new Date(),
        scanRunId: params.scanRunId,
      },
    });
  } catch (err) {
    console.error("[upsertCompanyFromScan Failed]", err);
  }
}
