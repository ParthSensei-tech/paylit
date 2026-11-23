import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompanyProfileBySlug, getAllCompanyProfiles } from "@/lib/companies/index-data";
import { CompanyProfileClient } from "./CompanyProfileClient";

interface CompanyProfilePageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const company = await getCompanyProfileBySlug(params.slug);
  if (!company) {
    return {
      title: "Company Not Found | Paylit Index",
    };
  }

  const title = `${company.name} Salary Transparency Score & Hiring Compliance Audit | Paylit Index`;
  const description = `${company.name} compliance audit: scored ${company.complianceScore}/100 (Grade ${company.grade}) across ${company.regulatedJobs} state-regulated listings. View salary spread flags and statutory disclosures.`;

  return {
    title,
    description,
    keywords: [
      `${company.name} salary transparency score`,
      `${company.name} hiring compliance audit`,
      `${company.name} pay transparency`,
      `${company.name} California SB 1162 compliance`,
      `${company.name} New York pay transparency`,
      `${company.name} job salary spreads`,
      "pay transparency compliance index",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://paylit.dev/companies/${company.slug}`,
    },
    alternates: {
      canonical: `https://paylit.dev/companies/${company.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const companies = await getAllCompanyProfiles();
  return companies.map((c) => ({
    slug: c.slug,
  }));
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const company = await getCompanyProfileBySlug(params.slug);

  if (!company) {
    notFound();
  }

  // Structured Data: Organization & Review/Audit Schema
  const companyJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `https://paylit.dev/companies/${company.slug}#org`,
        name: company.name,
        url: company.careersUrl,
        sameAs: [company.careersUrl],
      },
      {
        "@type": "Review",
        itemReviewed: {
          "@type": "Organization",
          name: company.name,
          url: company.careersUrl,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: company.complianceScore,
          bestRating: 100,
          worstRating: 0,
        },
        author: {
          "@type": "Organization",
          name: "Paylit Statutory Compliance Engine",
          url: "https://paylit.dev",
        },
        reviewBody: `${company.name} holds a Paylit Compliance Grade of ${company.grade} with an overall statutory rating of ${company.complianceScore}/100 based on automated analysis of ${company.totalJobs} public job listings against US and EU pay transparency statutes.`,
        datePublished: company.lastScannedAt,
      },
      {
        "@type": "AggregateRating",
        itemReviewed: {
          "@type": "Organization",
          name: company.name,
        },
        ratingValue: (company.complianceScore / 20).toFixed(1),
        reviewCount: company.totalJobs || 10,
        bestRating: "5",
        worstRating: "1",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(companyJsonLd) }}
      />
      <CompanyProfileClient company={company} />
    </>
  );
}
