import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeoPage } from "@/lib/seo-pages";
import { seoPages } from "@/lib/seo-pages";

interface SeoLandingPageProps {
  page: SeoPage;
}

export function SeoLandingPage({ page }: SeoLandingPageProps) {
  const relatedPages = seoPages.filter((item) => item.slug !== page.slug).slice(0, 4);

  return (
    <main className="min-h-screen bg-[#f8faf7] text-slate-950">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="font-semibold text-red-700 hover:text-red-800">
            违禁词检测工具
          </Link>
          <span>/</span>
          <span>{page.h1}</span>
        </nav>

        <header className="space-y-5">
          <Badge variant="outline" className="w-fit border-red-200 bg-white text-red-700">
            电商合规内容库
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-normal sm:text-5xl">
              {page.h1}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              {page.description}
            </p>
          </div>
        </header>

        <article className="grid gap-5">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>合规解读</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-base leading-8 text-slate-700">
              {page.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{page.checklistTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 text-base leading-7 text-slate-700">
                {page.checklist.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{page.examplesTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {page.examples.map((example) => (
                <div key={example.risky} className="rounded-lg border border-slate-200 p-4">
                  <div className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-red-700">风险写法</p>
                      <p className="mt-1 text-slate-700">{example.risky}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-700">建议写法</p>
                      <p className="mt-1 text-slate-700">{example.safer}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{example.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>常见问题</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {page.faq.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-lg border border-slate-200 bg-white p-4"
                >
                  <summary className="cursor-pointer list-none text-base font-semibold leading-7 text-slate-900">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </CardContent>
          </Card>
        </article>

        <aside className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">相关规则页面</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {relatedPages.map((item) => (
              <Link
                key={item.slug}
                className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-200 hover:text-red-700"
                href={`/${item.slug}`}
              >
                {item.h1}
              </Link>
            ))}
          </div>
        </aside>

        <section className="rounded-lg border border-red-100 bg-red-50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-950">免费检测你的文案</h2>
            <p className="text-sm leading-6 text-slate-600">
              粘贴商品标题、详情页、直播话术或种草笔记，快速识别极限词、敏感词和虚假宣传风险。
            </p>
          </div>
          <Button asChild className="mt-5 bg-red-600 hover:bg-red-700 sm:mt-0">
            <Link href="/">免费检测你的文案</Link>
          </Button>
        </section>

        <p className="text-xs leading-6 text-slate-500">
          本页为电商文案合规写作参考，不替代法律意见或平台最终审核结果。具体发布请结合商品资质、最新平台规则和监管要求判断。
        </p>
      </section>
    </main>
  );
}
