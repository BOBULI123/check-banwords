import { describe, expect, it } from "vitest";

import {
  alignViolationPositions,
  buildHighlightedSegments,
  canUseFreeDetection,
  getFreeDetectionStatus,
  getRiskLabel,
  normalizeDetectionResult,
} from "@/lib/detect-utils";
import type { DetectionResult } from "@/lib/types";

describe("detect utils", () => {
  it("normalizes malformed detection fields into a safe result", () => {
    const result = normalizeDetectionResult({
      riskLevel: "severe",
      totalWords: "not-a-number",
      violationCount: "2",
      violations: [
        {
          word: "最好",
          type: "极限词",
          reason: "含有绝对化表达",
          suggestion: "很不错",
          position: 3,
        },
      ],
      optimizedText: 123,
    });

    expect(result.riskLevel).toBe("low");
    expect(result.totalWords).toBe(0);
    expect(result.violationCount).toBe(1);
    expect(result.optimizedText).toBe("");
  });

  it("builds non-overlapping highlight segments from violation positions", () => {
    const source = "这款产品最好用，100%满意";
    const detection: DetectionResult = {
      riskLevel: "medium",
      totalWords: source.length,
      violationCount: 2,
      violations: [
        {
          word: "100%",
          type: "虚假宣传",
          reason: "绝对化承诺",
          suggestion: "多数用户反馈满意",
          position: 8,
        },
        {
          word: "最好",
          type: "极限词",
          reason: "绝对化极限词",
          suggestion: "很不错",
          position: 4,
        },
      ],
      optimizedText: "这款产品很不错用，多数用户反馈满意满意",
    };

    expect(buildHighlightedSegments(source, detection.violations)).toEqual([
      { text: "这款产品", violation: null },
      { text: "最好", violation: detection.violations[1] },
      { text: "用，", violation: null },
      { text: "100%", violation: detection.violations[0] },
      { text: "满意", violation: null },
    ]);
  });

  it("maps risk levels to Chinese display labels", () => {
    expect(getRiskLabel("low")).toBe("低");
    expect(getRiskLabel("medium")).toBe("中");
    expect(getRiskLabel("high")).toBe("高");
  });

  it("tracks the free detection quota", () => {
    expect(canUseFreeDetection(0)).toBe(true);
    expect(canUseFreeDetection(2)).toBe(true);
    expect(canUseFreeDetection(3)).toBe(false);
    expect(getFreeDetectionStatus(2)).toBe("今日免费检测剩余 1 次");
    expect(getFreeDetectionStatus(3)).toBe("今日免费次数已用完（3/3）");
  });

  it("realigns inaccurate model positions from the original text", () => {
    const text = "这款面膜是全网最低价，效果最好，能治愈痘痘，假一赔万！";
    const violations = [
      {
        word: "全网最低价",
        type: "虚假宣传",
        reason: "价格误导",
        suggestion: "低价格",
        position: 9,
      },
      {
        word: "最好",
        type: "极限词",
        reason: "绝对化表达",
        suggestion: "优质",
        position: 18,
      },
    ];

    expect(alignViolationPositions(text, violations).map((item) => item.position)).toEqual([5, 13]);
  });
});
