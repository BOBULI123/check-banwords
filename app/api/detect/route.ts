import OpenAI from "openai";
import { NextResponse } from "next/server";

import { alignViolationPositions, normalizeDetectionResult } from "@/lib/detect-utils";
import type { DetectRequest, PlatformId } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `你是一位电商平台合规审核专家，熟悉中国各大电商平台（淘宝、拼多多、抖音、小红书）的违禁词规则。
     
     请对以下商品文案进行违禁词检测，规则包括：
     1. 极限词：最、第一、顶级、唯一、首选、绝对、国家级、世界级、极品、极致、完美、100%等
     2. 医疗宣称：治疗、治愈、疗效、药妆、医用、处方、抗炎、抑菌（非消字号产品）、减肥（非保健食品）等
     3. 虚假宣传：假一赔万、永不褪色、永久有效、祖传秘方、纯天然无副作用等
     4. 敏感政治词汇、色情暗示、暴力相关
     5. 变体识别：如用拼音、谐音字、拆分字、特殊符号规避的（如'蕞'、'朂'、'zui'、'最*好'）
     6. 平台特殊规则：
        - 淘宝：禁用"淘宝首发""聚划算独家"等平台独占性词汇
        - 拼多多：禁用"全网最低价""亏本甩卖"等价格误导词汇
        - 抖音：禁用"直播间专属""仅限今天"等无法验证的时效承诺
        - 小红书：禁用"医美级""院线同款"等无依据的等级对比
     
     返回JSON格式，必须包含：
     {
       "riskLevel": "high/medium/low",
       "totalWords": 数字,
       "violationCount": 数字,
       "violations": [
         {
           "word": "违禁词原文",
           "type": "极限词/医疗宣称/虚假宣传/敏感词/平台特殊",
           "reason": "为什么违规",
           "suggestion": "建议替换为",
           "position": 在原文中的起始位置
         }
       ],
       "optimizedText": "替换所有违禁词后的合规文案"
     }
     
     注意：
     - 必须返回合法的JSON，不要添加markdown代码块标记
     - 如果文案没有违禁词，violations为空数组，riskLevel为low
     - optimizedText必须保留原文所有非违禁内容，只替换违禁词部分
     - 检测要严格但合理，不要过度拦截正常词汇`;

const platformNames: Record<PlatformId, string> = {
  taobao: "淘宝",
  pdd: "拼多多",
  douyin: "抖音",
  xiaohongshu: "小红书",
};

const openAiRequestTimeoutMs = 120_000;
const defaultAiBaseUrl = "https://api.openai.com/v1";
const defaultAiModel = "gpt-4o-mini";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<DetectRequest>;
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const platforms = Array.isArray(body.platforms)
      ? body.platforms.filter(
          (item): item is PlatformId => typeof item === "string" && item in platformNames,
        )
      : [];

    if (!text || text.length > 5000 || platforms.length === 0) {
      return NextResponse.json(
        { error: "请求参数不合法，请检查文案和平台选择" },
        { status: 400 },
      );
    }

    const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
    const baseURL = process.env.AI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? defaultAiBaseUrl;
    const model = process.env.AI_MODEL ?? defaultAiModel;

    if (!apiKey) {
      return NextResponse.json({ error: "检测服务繁忙，请稍后重试" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey,
      baseURL,
      maxRetries: 0,
      timeout: openAiRequestTimeoutMs,
    });

    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `目标平台：${platforms.map((item) => platformNames[item]).join("、")}

待检测文案：
${text}`,
        },
      ],
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "检测服务繁忙，请稍后重试" }, { status: 502 });
    }

    const parsed = parseOpenAiJson(content);
    if (!parsed) {
      return NextResponse.json({ error: "检测服务繁忙，请稍后重试" }, { status: 502 });
    }

    const result = normalizeDetectionResult(parsed);

    return NextResponse.json({
      ...result,
      totalWords: text.length,
      violationCount: result.violations.length,
      violations: alignViolationPositions(text, result.violations),
    });
  } catch {
    return NextResponse.json({ error: "检测服务繁忙，请稍后重试" }, { status: 500 });
  }
}

function parseOpenAiJson(content: string): unknown | null {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
