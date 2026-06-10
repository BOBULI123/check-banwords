export type PlatformId = "taobao" | "pdd" | "douyin" | "xiaohongshu";

export type RiskLevel = "high" | "medium" | "low";

export interface Violation {
  word: string;
  type: "极限词" | "医疗宣称" | "虚假宣传" | "敏感词" | "平台特殊" | string;
  reason: string;
  suggestion: string;
  position: number;
}

export interface DetectionResult {
  riskLevel: RiskLevel;
  totalWords: number;
  violationCount: number;
  violations: Violation[];
  optimizedText: string;
}

export interface DetectRequest {
  text: string;
  platforms: PlatformId[];
}

export interface HighlightSegment {
  text: string;
  violation: Violation | null;
}
