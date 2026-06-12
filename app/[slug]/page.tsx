import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSeoPage, seoPages, siteBaseUrl } from "@/lib/seo-pages";

interface SeoPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return seoPages.map((page) => ({
    slug: page.slug,
  }));
}

export function generateMetadata({ params }: SeoPageProps): Metadata {
  const page = getSeoPage(params.slug);

  if (!page) {
    return {};
  }

  return {
    title: `${page.title}_违禁词检测`,
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: `${siteBaseUrl}/${page.slug}`,
    },
  };
}

export default function SeoContentPage({ params }: SeoPageProps) {
  const page = getSeoPage(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f8faf7] text-slate-950">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-5">
          <Link className="text-sm font-semibold text-red-700 hover:text-red-800" href="/">
            返回违禁词检测工具
          </Link>
          <Badge variant="outline" className="border-red-200 bg-white text-red-700">
            电商合规指南
          </Badge>
          <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal sm:text-5xl">
            {page.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">{page.description}</p>
        </div>

        <div className="grid gap-5">
          {page.sections.map((section) => (
            <Card key={section.heading} className="bg-white">
              <CardHeader>
                <CardTitle>{section.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base leading-8 text-slate-700">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-red-100 bg-red-50">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">立即检测你的商品文案</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                粘贴标题、详情页或直播话术，AI 自动识别极限词、敏感词和虚假宣传风险。
              </p>
            </div>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-red-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              href="/"
            >
              打开检测工具
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
