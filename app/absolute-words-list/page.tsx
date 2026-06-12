import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/seo-landing-page";
import { getRequiredSeoPage, siteBaseUrl } from "@/lib/seo-pages";

const page = getRequiredSeoPage("absolute-words-list");

export const metadata: Metadata = {
  title: page.title,
  description: page.description,
  keywords: page.keywords,
  alternates: {
    canonical: `${siteBaseUrl}/${page.slug}`,
  },
};

export default function AbsoluteWordsListPage() {
  return <SeoLandingPage page={page} />;
}
