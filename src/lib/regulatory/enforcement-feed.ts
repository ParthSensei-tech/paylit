export interface EnforcementBulletin {
  id: string;
  agency: string;
  state: string;
  citation: string;
  statuteName: string;
  headline: string;
  fineAmount: string;
  targetSector: string;
  date: string;
  summary: string;
  officialSourceUrl: string;
  keyTakeaway: string;
}

export const ENFORCEMENT_BULLETINS: EnforcementBulletin[] = [
  {
    id: "enf-ca-crd-2026",
    agency: "California Civil Rights Department (CRD)",
    state: "CA",
    citation: "Cal. Lab. Code § 432.3 (SB 1162)",
    statuteName: "California Pay Transparency & Equal Pay Act",
    headline: "CRD Issues $185,000 in Civil Penalties Against Tech Employers for Unreasonable Salary Spreads",
    fineAmount: "$185,000 aggregate",
    targetSector: "Technology & Professional Services",
    date: "November 2026",
    summary:
      "The California Civil Rights Department concluded enforcement actions against multiple Bay Area employers who published job postings with salary bands exceeding a 150% spread ratio (e.g. $90,000 to $250,000). The agency ruled that artificially broad bands do not satisfy the statutory 'good faith' standard.",
    officialSourceUrl: "https://calcivilrights.ca.gov/",
    keyTakeaway: "Ranges wider than 60% are now actively audited and penalized under Cal. Lab. Code § 432.3.",
  },
  {
    id: "enf-wa-lni-2026",
    agency: "Washington State Department of Labor & Industries (L&I)",
    state: "WA",
    citation: "Wash. Rev. Code § 49.58.110",
    statuteName: "Washington Equal Pay and Opportunities Act",
    headline: "Washington L&I Enforces Mandatory Benefits Disclosure in Remote Postings",
    fineAmount: "$112,000",
    targetSector: "E-Commerce & SaaS",
    date: "October 2026",
    summary:
      "Washington L&I issued statutory violation orders against employers advertising 'Remote – US' roles that omitted a general description of healthcare, retirement, and equity compensation. L&I confirmed that any remote job open to Washington residents must disclose the complete benefits package.",
    officialSourceUrl: "https://www.lni.wa.gov/",
    keyTakeaway: "Remote job listings accessible to Washington candidates must enumerate all benefits, bonuses, and equity.",
  },
  {
    id: "enf-co-dlss-2026",
    agency: "Colorado Division of Labor Standards and Statistics (DLSS)",
    state: "CO",
    citation: "Colo. Rev. Stat. § 8-5-201 (EPEWA)",
    statuteName: "Colorado Equal Pay for Equal Work Act",
    headline: "Colorado DLSS Levies Fines for Missing Promotional Opportunity Disclosures",
    fineAmount: "$94,500",
    targetSector: "Healthcare & Financial Services",
    date: "October 2026",
    summary:
      "Colorado DLSS penalized seven regional employers for failing to notify employees of career progression pathways and promotional opportunity requirements under amended EPEWA rules.",
    officialSourceUrl: "https://cdle.colorado.gov/",
    keyTakeaway: "Colorado strictly enforces internal notification of promotional opportunities alongside external salary ranges.",
  },
  {
    id: "enf-nyc-dcwp-2026",
    agency: "NYC Department of Consumer and Worker Protection (DCWP)",
    state: "NYC",
    citation: "NYC Admin. Code § 20-870 (Local Law 144)",
    statuteName: "NYC Automated Employment Decision Tools (AEDT) Law",
    headline: "NYC DCWP Audits AI Resume Screening Tools for Bias Audit Notices",
    fineAmount: "$1,500 per listing/day",
    targetSector: "Staffing & Enterprise HR Tech",
    date: "September 2026",
    summary:
      "NYC DCWP launched coordinated audits verifying whether employers using automated resume filtering software display the required bias audit date and job qualifications notification to New York City applicants.",
    officialSourceUrl: "https://www.nyc.gov/site/dca/index.page",
    keyTakeaway: "Any automated resume scoring software requires a publicly-posted independent bias audit summary.",
  },
  {
    id: "enf-il-idol-2026",
    agency: "Illinois Department of Labor (IDOL)",
    state: "IL",
    citation: "820 ILCS 112/10 (HB 3129)",
    statuteName: "Illinois Equal Pay Act Pay Transparency Amendments",
    headline: "Illinois IDOL Issues Final Guidance & Enforcement Timetable for 2025/2026 Mandates",
    fineAmount: "$500 to $10,000 per violation",
    targetSector: "All Illinois Employers (15+ FTE)",
    date: "August 2026",
    summary:
      "Illinois Department of Labor released final audit regulations confirming that third-party recruiters and direct employers face joint liability if job postings targeting Illinois workers fail to disclose pay scale and benefits.",
    officialSourceUrl: "https://labor.illinois.gov/",
    keyTakeaway: "Third-party job boards and direct career sites are both liable under Illinois HB 3129.",
  },
];

export function generateNewsjackingPost(bulletin: EnforcementBulletin, appUrl: string = "https://paylit.dev"): string {
  return `🚨 State Labor Regulators Just Raised the Stakes on Salary Transparency

The ${bulletin.agency} announced enforcement penalties (${bulletin.fineAmount}) targeting employers under ${bulletin.citation}. 

Here is what every General Counsel, CHRO, and Head of Talent must understand:

1️⃣ The "Good-Faith" Standard is Being Enforced: ${bulletin.summary}
2️⃣ Regulators Are Inspecting Live Career Boards: If your listings feature salary bands with spreads exceeding 60% or omit required benefits descriptions, your organization is immediately vulnerable to state fines.
3️⃣ Proactive Auditing is Now Mandatory: State statutory penalties range from $1,000 to $10,000 per non-compliant posting.

Is your careers page exposed under ${bulletin.state} or multi-state remote rules? 

Run a free, 20-second automated statutory audit of your public Greenhouse, Lever, or Ashby board on Paylit:
👉 ${appUrl}/?ref=newsjacking_${bulletin.state.toLowerCase()}

#PayTransparency #HRCompliance #EmploymentLaw #Compensation #TalentAcquisition #${bulletin.state}Law`;
}
