import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elwynnkeep.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/armory`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/register`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
