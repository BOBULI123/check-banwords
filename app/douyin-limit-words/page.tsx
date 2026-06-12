import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/seo-landing-page";
import { getRequiredSeoPage, siteBaseUrl } from "@/lib/seo-pages";

const page = getRequiredSeoPage("douyin-limit-words");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: {
    canonical: `${siteBaseUrl}/${page.slug}`,
  },
};

export default function DouyinLimitWordsPage() {
  return <SeoLandingPage page={page} />;
}
