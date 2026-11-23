import { Metadata } from "next";
import { getAllCompanyProfiles } from "@/lib/companies/index-data";
import { CompaniesClient } from "./CompaniesClient";

export const metadata: Metadata = {
  title: "State Pay Transparency Index | National Employer Compliance Directory | Paylit",
  description:
    "Explore the national compliance directory of employer salary disclosures. Public pay transparency scores, good-faith spread ratios, and statutory audit grades across CA, NY, CO, WA, and IL.",
  keywords: [
    "pay transparency index",
    "salary disclosure directory",
    "employer pay transparency compliance",
    "California SB 1162 scores",
    "New York pay transparency audit",
    "salary spread compliance",
    "state salary transparency tracker",
  ],
  openGraph: {
    title: "State Pay Transparency Index | Employer Compliance Directory",
    description: "Public directory of employer salary disclosures and statutory compliance scores under state pay transparency mandates.",
    type: "website",
    url: "https://paylit.dev/companies",
  },
  alternates: {
    canonical: "https://paylit.dev/companies",
  },
};

export default async function CompaniesPage() {
  const companies = await getAllCompanyProfiles();

  const directoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "State Pay Transparency Index",
    description: "Public compliance directory of employer salary disclosures under US and EU statutory pay transparency mandates.",
    url: "https://paylit.dev/companies",
    hasPart: companies.slice(0, 20).map((c) => ({
      "@type": "Organization",
      name: c.name,
      url: `https://paylit.dev/companies/${c.slug}`,
      sameAs: c.careersUrl,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directoryJsonLd) }}
      />
      <CompaniesClient initialCompanies={companies} />
    </>
  );
}
