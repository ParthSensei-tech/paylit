import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://paylit.compliance";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/companies",
          "/companies/*",
          "/candidate-check",
          "/regulatory-alerts",
          "/report/*",
          "/#pricing",
          "/#faq",
          "/dashboard",
          "/dashboard/audit-logs",
          "/dashboard/monitors",
          "/dashboard/settings",
        ],
        disallow: ["/api/*"],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Applebot", "GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended"],
        allow: [
          "/",
          "/companies",
          "/companies/*",
          "/candidate-check",
          "/regulatory-alerts",
          "/report/*",
          "/#pricing",
          "/#faq",
          "/dashboard",
          "/dashboard/audit-logs",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
