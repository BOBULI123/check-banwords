import type { DetectionResult, HighlightSegment, RiskLevel, Violation } from "@/lib/types";

const riskLevels: RiskLevel[] = ["high", "medium", "low"];
const freeDetectionLimit = 3;

export function normalizeDetectionResult(value: unknown): DetectionResult {
  const source = isRecord(value) ? value : {};
  const violations = Array.isArray(source.violations)
    ? source.violations.map(normalizeViolation).filter((item): item is Violation => item !== null)
    : [];

  return {
    riskLevel: riskLevels.includes(source.riskLevel as RiskLevel)
      ? (source.riskLevel as RiskLevel)
      : "low",
    totalWords: typeof source.totalWords === "number" ? source.totalWords : 0,
    violationCount:
      typeof source.violationCount === "number" ? source.violationCount : violations.length,
    violations,
    optimizedText: typeof source.optimizedText === "string" ? source.optimizedText : "",
  };
}

export function buildHighlightedSegments(
  text: string,
  violations: Violation[],
): HighlightSegment[] {
  const sorted = violations
    .filter((item) => Number.isInteger(item.position) && item.position >= 0 && item.word.length > 0)
    .sort((a, b) => a.position - b.position);

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const violation of sorted) {
    const start = violation.position;
    const end = start + violation.word.length;

    if (start < cursor || start >= text.length) {
      continue;
    }

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), violation: null });
    }

    segments.push({
      text: text.slice(start, Math.min(end, text.length)),
      violation,
    });
    cursor = Math.min(end, text.length);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), violation: null });
  }

  return segments.length > 0 ? segments : [{ text, violation: null }];
}

export function alignViolationPositions(text: string, violations: Violation[]): Violation[] {
  const usedRanges: Array<{ start: number; end: number }> = [];

  return violations.map((violation) => {
    const position = findBestPosition(text, violation.word, violation.position, usedRanges);
    const nextViolation = { ...violation, position };

    if (position >= 0) {
      usedRanges.push({ start: position, end: position + violation.word.length });
    }

    return nextViolation;
  });
}

export function getRiskLabel(riskLevel: RiskLevel): "低" | "中" | "高" {
  const labels = {
    low: "低",
    medium: "中",
    high: "高",
  } satisfies Record<RiskLevel, "低" | "中" | "高">;

  return labels[riskLevel];
}

export function getRiskTone(riskLevel: RiskLevel): string {
  const tones = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-red-200 bg-red-50 text-red-700",
  } satisfies Record<RiskLevel, string>;

  return tones[riskLevel];
}

export function canUseFreeDetection(usedCount: number): boolean {
  return usedCount < freeDetectionLimit;
}

export function getFreeDetectionStatus(usedCount: number): string {
  const remaining = Math.max(freeDetectionLimit - usedCount, 0);

  if (remaining === 0) {
    return `今日免费次数已用完（${freeDetectionLimit}/${freeDetectionLimit}）`;
  }

  return `今日免费检测剩余 ${remaining} 次`;
}

function normalizeViolation(value: unknown): Violation | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.word !== "string" ||
    typeof value.type !== "string" ||
    typeof value.reason !== "string" ||
    typeof value.suggestion !== "string" ||
    typeof value.position !== "number"
  ) {
    return null;
  }

  return {
    word: value.word,
    type: value.type,
    reason: value.reason,
    suggestion: value.suggestion,
    position: value.position,
  };
}

function findBestPosition(
  text: string,
  word: string,
  modelPosition: number,
  usedRanges: Array<{ start: number; end: number }>,
): number {
  if (!word) {
    return modelPosition;
  }

  const candidates: number[] = [];
  let searchFrom = 0;

  while (searchFrom < text.length) {
    const index = text.indexOf(word, searchFrom);
    if (index === -1) {
      break;
    }

    const end = index + word.length;
    const overlaps = usedRanges.some((range) => index < range.end && end > range.start);

    if (!overlaps) {
      candidates.push(index);
    }

    searchFrom = index + Math.max(word.length, 1);
  }

  if (candidates.length === 0) {
    return modelPosition;
  }

  return candidates.reduce((best, current) =>
    Math.abs(current - modelPosition) < Math.abs(best - modelPosition) ? current : best,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
