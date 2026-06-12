import type { MetadataRoute } from "next";

import { seoPages, siteBaseUrl } from "@/lib/seo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteBaseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    ...seoPages.map((page) => ({
      url: `${siteBaseUrl}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return routes;
}
