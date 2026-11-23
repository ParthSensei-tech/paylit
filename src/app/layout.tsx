import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://paylit.compliance";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Paylit — Pay-Transparency & Hiring-Disclosure Compliance Monitor (US & EU)",
    template: "%s | Paylit Compliance",
  },
  description:
    "Paylit is the authoritative B2B hiring-disclosure compliance engine for mid-sized US and EU enterprises. Continuous automated ATS auditing across California (SB 1162), New York (§ 194-b), Colorado (EPEWA), Washington (RCW 49.58), Illinois (HB 3129), Massachusetts, and EU AI Act.",
  keywords: [
    "pay transparency compliance software",
    "automated hiring disclosure monitor",
    "California SB 1162 compliance checker",
    "Cal. Lab. Code 432.3",
    "New York Labor Law 194-b salary audit",
    "NYC Local Law 144 bias audit notice",
    "NYC Local Law 32 pay transparency",
    "Colorado Equal Pay for Equal Work Act",
    "C.R.S. 8-5-201 benefits disclosure",
    "Washington Equal Pay RCW 49.58.110",
    "Illinois Equal Pay Act HB 3129",
    "820 ILCS 112/11",
    "Massachusetts salary range transparency St. 2024 c. 182",
    "EU AI Act Article 26 recruitment disclosure",
    "Regulation (EU) 2024/1689",
    "good faith salary spread audit",
    "Greenhouse pay transparency scanner",
    "Lever compensation disclosure auditor",
    "Ashby ATS compliance tool",
    "tamper-proof compliance certificate",
    "HR legal compliance software",
    "statutory fine exposure calculator",
  ],
  authors: [{ name: "Paylit Compliance Engineering Team", url: baseUrl }],
  creator: "Paylit Technologies Inc.",
  publisher: "Paylit Technologies Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "en-US": baseUrl,
      "en-GB": `${baseUrl}?lang=en-GB`,
    },
  },
  openGraph: {
    title: "Paylit — Enterprise Pay-Transparency & Hiring-Disclosure Compliance Monitor",
    description:
      "Continuous automated compliance auditing across California, New York, Colorado, Washington, Illinois, Massachusetts, and the EU AI Act. Instant paste-ready statutory clauses and cryptographic audit vault.",
    url: baseUrl,
    siteName: "Paylit",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/images/audit-certificate.jpg`,
        width: 1200,
        height: 630,
        alt: "Paylit Official Statutory Pay-Transparency Audit Certificate",
      },
      {
        url: `${baseUrl}/images/salary-macro.jpg`,
        width: 1200,
        height: 630,
        alt: "Paylit Salary Spread and Statutory Disclosure Auditor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paylit — Pay-Transparency & Hiring-Disclosure Compliance Monitor",
    description:
      "Continuous automated careers board auditing for mid-sized US and EU enterprises across CA, NY, CO, WA, IL, MA, and EU AI Act.",
    images: [`${baseUrl}/images/audit-certificate.jpg`],
    creator: "@paylitcompliance",
  },
  other: {
    // Geographic / GEO tags for top search ranking in regulated jurisdictions
    "geo.region": "US-CA;US-NY;US-CO;US-WA;US-IL;US-MA;EU",
    "geo.placename": "San Francisco, New York, Denver, Seattle, Chicago, Boston, Brussels, Dublin",
    "geo.position": "37.7749;-122.4194",
    "ICBM": "37.7749, -122.4194",
    "rating": "General",
    "distribution": "Global",
    "target": "HR, Legal Counsel, Chief People Officers, Talent Acquisition",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Comprehensive Structured Data (JSON-LD) for GEO and AI Search Engines (Perplexity, ChatGPT, Google SGE)
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Paylit",
    "operatingSystem": "All modern web browsers, Cloud",
    "applicationCategory": "BusinessApplication, ComplianceSoftware, LegalSoftware",
    "description":
      "Automated enterprise pay-transparency and hiring-disclosure compliance engine that continuously audits job postings across CA, NY, CO, WA, IL, MA, and EU statutory mandates.",
    "url": baseUrl,
    "offers": [
      {
        "@type": "Offer",
        "name": "Growth Plan",
        "price": "299",
        "priceCurrency": "USD",
        "billingIncrement": "Monthly",
      },
      {
        "@type": "Offer",
        "name": "Scale Plan",
        "price": "599",
        "priceCurrency": "USD",
        "billingIncrement": "Monthly",
      },
      {
        "@type": "Offer",
        "name": "Agency & Legal Plan",
        "price": "999",
        "priceCurrency": "USD",
        "billingIncrement": "Monthly",
      },
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "184",
      "bestRating": "5",
      "worstRating": "1",
    },
    "featureList": [
      "California SB 1162 Salary Range Enforcement",
      "New York Labor Law § 194-b Compensation Audit",
      "NYC Local Law 144 Automated Screening Bias Notice",
      "Colorado Equal Pay Act Benefits & Bonus Disclosure (C.R.S. § 8-5-201)",
      "Washington Equal Pay Act (RCW 49.58.110)",
      "Illinois Equal Pay Act Amendment (820 ILCS 112/11)",
      "EU AI Act High-Risk Recruitment Screening Notification (Reg. 2024/1689 Art. 26)",
      "Good-Faith 60% Spread Limit Verification",
      "Append-Only Cryptographic SHA-256 Audit Vault",
      "Official Print-Optimized Compliance Certificates",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Paylit Technologies Inc.",
    "url": baseUrl,
    "logo": `${baseUrl}/images/audit-certificate.jpg`,
    "description": "Provider of automated statutory pay-transparency and hiring disclosure compliance technology for enterprise organizations.",
    "knowsAbout": [
      "Pay Transparency Laws",
      "California SB 1162",
      "New York Labor Law Section 194-b",
      "Colorado Equal Pay for Equal Work Act",
      "Washington RCW 49.58.110",
      "Illinois 820 ILCS 112/11",
      "NYC Local Law 144",
      "EU AI Act Regulation (EU) 2024/1689",
      "Statutory Compensation Spread Ratios",
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "compliance support",
      "email": "counsel@paylit.compliance",
      "availableLanguage": ["English"],
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "addressCountry": "US",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Paylit Compliance",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/api/scan?url={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is California SB 1162 pay transparency compliance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "California Labor Code § 432.3 (SB 1162) requires employers with 15 or more employees to include a pay scale (minimum and maximum base salary or hourly rate) in every external and internal job advertisement. Civil penalties range from $100 up to $10,000 per violation.",
        },
      },
      {
        "@type": "Question",
        "name": "How does the good-faith salary spread rule work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Under regulatory enforcement guidance in California, New York, and other transparency states, salary bands must reflect a good-faith estimate. Postings with excessively wide bands (such as $60,000 to $180,000, exceeding a 60% spread ratio) are routinely flagged by regulators and plaintiff firms as non-compliant bad-faith ranges.",
        },
      },
      {
        "@type": "Question",
        "name": "What additional disclosures are mandatory in Colorado and Illinois?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Under Colorado Equal Pay for Equal Work Act (C.R.S. § 8-5-201) and Illinois HB 3129 (820 ILCS 112/11), employers must include not only base salary ranges but also a general description of all bonuses, commissions, stock options, healthcare benefits, and retirement plans in all job listings.",
        },
      },
      {
        "@type": "Question",
        "name": "How does NYC Local Law 144 apply to job postings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "NYC Local Law 144 mandates that employers using automated employment decision tools (AEDTs) such as AI video screening, resume scoring, or algorithmic filtering must provide candidates with at least 10 business days advance notice and publish the summary results of an independent bias audit.",
        },
      },
      {
        "@type": "Question",
        "name": "Are remote job postings subject to state pay transparency laws?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Yes. If a position is advertised as Remote – US or can be performed anywhere in the United States, labor regulators in California, New York, Colorado, Washington, and Illinois assert statutory jurisdiction because qualified state residents may apply.",
        },
      },
      {
        "@type": "Question",
        "name": "How does Paylit prove compliance if investigated by a labor commissioner?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text":
            "Every Paylit scan produces an immutable, append-only Audit Snapshot sealed with a SHA-256 cryptographic Merkle hash chain. Employers can export print-optimized official Compliance Certificates detailing exact timestamped coverage for outside counsel and regulatory defense.",
        },
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* JSON-LD Schemas for Search Engines and AI Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="min-h-screen bg-white text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
