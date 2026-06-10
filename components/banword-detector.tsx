"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Download,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  buildHighlightedSegments,
  canUseFreeDetection,
  getFreeDetectionStatus,
  getRiskLabel,
  getRiskTone,
  normalizeDetectionResult,
} from "@/lib/detect-utils";
import { cn } from "@/lib/utils";
import type { DetectionResult, PlatformId } from "@/lib/types";

const maxTextLength = 5000;
const detectRequestTimeoutMs = 120_000;

const platforms: Array<{ id: PlatformId; name: string; mark: string; tone: string }> = [
  { id: "taobao", name: "淘宝", mark: "淘", tone: "bg-orange-500" },
  { id: "pdd", name: "拼多多", mark: "拼", tone: "bg-red-500" },
  { id: "douyin", name: "抖音", mark: "抖", tone: "bg-zinc-900" },
  { id: "xiaohongshu", name: "小红书", mark: "薯", tone: "bg-rose-500" },
];

const sellingPoints = [
  {
    title: "覆盖10,000+违禁词库",
    icon: ShieldCheck,
    copy: "覆盖极限词、医疗宣称、虚假宣传和平台特殊规则。",
  },
  {
    title: "AI识别谐音/变体（如'最'→'蕞'）",
    icon: Sparkles,
    copy: "识别拼音、拆字、符号穿插等规避表达。",
  },
  {
    title: "一键替换建议，直接复制可用",
    icon: Wand2,
    copy: "保留原文语气，只替换高风险片段。",
  },
];

export function BanwordDetector() {
  const [text, setText] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>(["taobao"]);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [detectionCount, setDetectionCount] = useState(0);

  const isOverLimit = text.length > maxTextLength;
  const hasFreeQuota = canUseFreeDetection(detectionCount);
  const canDetect =
    text.trim().length > 0 &&
    !isOverLimit &&
    selectedPlatforms.length > 0 &&
    !isLoading;
  const highlightedSegments = useMemo(
    () => (result ? buildHighlightedSegments(text, result.violations) : []),
    [result, text],
  );

  function togglePlatform(platform: PlatformId) {
    setSelectedPlatforms((current) => {
      if (current.includes(platform)) {
        return current.length === 1 ? current : current.filter((item) => item !== platform);
      }

      return [...current, platform];
    });
  }

  async function detectBanwords() {
    if (!hasFreeQuota) {
      window.alert("今日免费检测次数已用完，订阅高级版享受无限次检测");
      return;
    }

    if (!canDetect) {
      setError(isOverLimit ? "文案过长，请分段检测" : "请先输入需要检测的文案");
      return;
    }

    setIsLoading(true);
    setError("");
    setCopied(false);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), detectRequestTimeoutMs);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          platforms: selectedPlatforms,
        }),
      });

      if (!response.ok) {
        throw new Error("request failed");
      }

      const data = normalizeDetectionResult(await response.json());
      setResult(data);
      setDetectionCount((current) => current + 1);
    } catch (caughtError) {
      const message =
        caughtError instanceof DOMException && caughtError.name === "AbortError"
          ? "检测耗时较长，请减少文案字数后重试"
          : "检测服务繁忙，请稍后重试";
      setError(message);
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  async function copyOptimizedText() {
    if (!result?.optimizedText) {
      return;
    }

    await navigator.clipboard.writeText(result.optimizedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8faf7] text-slate-950">
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(220,38,38,0.12),rgba(20,184,166,0.10)_44%,rgba(250,204,21,0.14))]" />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              {platforms.map((platform) => (
                <span
                  key={platform.id}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 place-items-center rounded-full text-xs text-white",
                      platform.tone,
                    )}
                  >
                    {platform.mark}
                  </span>
                  {platform.name}
                </span>
              ))}
            </div>
            <Badge className="bg-emerald-600 text-white">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              已帮助12,000+卖家规避违规
            </Badge>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="space-y-6">
              <div className="max-w-4xl space-y-4">
                <Badge variant="outline" className="border-red-200 bg-white/80 text-red-700">
                  AI合规审核助手
                </Badge>
                <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                  电商违禁词检测工具 - 一键排查违规风险
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-slate-600">
                  支持淘宝、拼多多、抖音、小红书，AI智能识别极限词、敏感词、虚假宣传用语
                </p>
              </div>

              <Card className="border-slate-200/80 bg-white/95 shadow-xl shadow-slate-200/70">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle>粘贴待检测文案</CardTitle>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isOverLimit ? "text-red-600" : "text-slate-500",
                      )}
                    >
                      {text.length}/{maxTextLength}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <Textarea
                    value={text}
                    maxLength={maxTextLength + 200}
                    disabled={isLoading}
                    placeholder="粘贴你的商品标题、详情页文案或广告语..."
                    className="max-h-[420px] resize-y"
                    onChange={(event) => {
                      setText(event.target.value);
                      if (event.target.value.length <= maxTextLength) {
                        setError("");
                      }
                    }}
                  />
                  {isOverLimit ? (
                    <p className="flex items-center gap-2 text-sm font-medium text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      文案过长，请分段检测
                    </p>
                  ) : null}

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">选择检测平台</p>
                    <div className="flex flex-wrap gap-2">
                      {platforms.map((platform) => {
                        const active = selectedPlatforms.includes(platform.id);
                        return (
                          <button
                            key={platform.id}
                            type="button"
                            disabled={isLoading}
                            className={cn(
                              "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition",
                              active
                                ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                            )}
                            onClick={() => togglePlatform(platform.id)}
                          >
                            <span
                              className={cn(
                                "grid h-6 w-6 place-items-center rounded-full text-xs text-white",
                                platform.tone,
                              )}
                            >
                              {platform.mark}
                            </span>
                            {platform.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    className="h-14 w-full text-lg shadow-lg shadow-red-200"
                    disabled={!canDetect}
                    size="lg"
                    onClick={detectBanwords}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        AI检测中，约30-90秒...
                      </>
                    ) : (
                      "立即检测违禁词"
                    )}
                  </Button>
                  <p
                    className={cn(
                      "text-center text-sm font-medium",
                      hasFreeQuota ? "text-slate-500" : "text-orange-600",
                    )}
                  >
                    {getFreeDetectionStatus(detectionCount)}
                  </p>

                  {isLoading ? (
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-1/2 animate-[progress_1.1s_ease-in-out_infinite] rounded-full bg-red-500" />
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:pt-44">
              {sellingPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <Card key={point.title} className="bg-white/90">
                    <CardContent className="flex gap-4 p-5">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-slate-950 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-950">{point.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{point.copy}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {result ? (
        <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="共检测字数" value={`${result.totalWords}字`} />
            <StatCard label="发现违禁词" value={`${result.violationCount}个`} />
            <StatCard
              label="风险等级"
              value={getRiskLabel(result.riskLevel)}
              className={getRiskTone(result.riskLevel)}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <CardTitle>原文高亮展示</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[220px] whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-base leading-8 text-slate-800">
                  {highlightedSegments.map((segment, index) =>
                    segment.violation ? (
                      <span
                        key={`${segment.text}-${index}`}
                        className="rounded bg-red-100 px-1 text-red-700"
                        title={`${segment.violation.type}：${segment.violation.reason}；建议替换为：${segment.violation.suggestion}`}
                      >
                        {segment.text}
                      </span>
                    ) : (
                      <span key={`${segment.text}-${index}`}>{segment.text}</span>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {result.violations.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>违规详情</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.violations.map((violation, index) => (
                      <div
                        key={`${violation.word}-${violation.position}-${index}`}
                        className="rounded-md border border-red-100 bg-red-50 p-3"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-red-600 text-white">{violation.type}</Badge>
                          <span className="font-semibold text-red-700">
                            {`「${violation.word}」`}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{violation.reason}</p>
                        <p className="mt-1 text-sm font-medium leading-6 text-emerald-700">
                          {`建议替换为：「${violation.suggestion}」`}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader>
                  <CardTitle>优化后文案</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="min-h-[220px] whitespace-pre-wrap rounded-md border border-emerald-200 bg-emerald-50 p-4 text-base leading-8 text-emerald-950">
                    {result.optimizedText || text}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <Button onClick={copyOptimizedText} variant="secondary">
                      <Clipboard className="mr-2 h-4 w-4" />
                      {copied ? "已复制" : "复制优化后文案"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.alert("订阅高级版解锁批量检测、图片OCR、店铺诊断，首月仅需29.9元")
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      导出检测报告（高级功能）
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
              <p className="text-lg font-bold text-slate-950">
                需要批量检测、图片OCR识别、店铺全量诊断？
              </p>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                高级版支持一次检测100条文案、自动扫描商品图片中的文字、导出PDF检测报告
              </p>
              <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => window.alert("订阅功能即将上线，请加微信咨询：你的微信号")}
              >
                订阅高级版 29.9元/月
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : null}
    </main>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardContent className="p-5">
        <p className="text-sm font-semibold opacity-80">{label}</p>
        <p className="mt-2 text-3xl font-black tracking-normal">{value}</p>
      </CardContent>
    </Card>
  );
}
