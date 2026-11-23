import { Metadata } from "next";
import { CandidateCheckClient } from "./CandidateCheckClient";

export const metadata: Metadata = {
  title: "Candidate Salary Transparency Checker | Verify Job Compliance | Paylit",
  description:
    "Check if any job posting complies with California SB 1162, New York § 194-b, Colorado EPEWA, and Washington RCW 49.58. Verify salary bands, good-faith spread ratios, and required benefits before applying.",
  keywords: [
    "candidate salary transparency checker",
    "is this job compliant",
    "check salary transparency law",
    "California SB 1162 job checker",
    "New York salary transparency check",
    "good faith salary spread ratio",
    "pay transparency applicant rights",
  ],
  openGraph: {
    title: "Candidate Salary Transparency Checker | Verify Employer Compliance",
    description: "Job seekers: verify whether an employer's job description satisfies state salary transparency laws before applying.",
    type: "website",
    url: "https://paylit.dev/candidate-check",
  },
  alternates: {
    canonical: "https://paylit.dev/candidate-check",
  },
};

export default function CandidateCheckPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Paylit Candidate Salary Transparency Checker",
    applicationCategory: "BusinessApplication",
    description: "Applicant tool to verify employer compliance with US and EU salary transparency legislation.",
    url: "https://paylit.dev/candidate-check",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CandidateCheckClient />
    </>
  );
}
