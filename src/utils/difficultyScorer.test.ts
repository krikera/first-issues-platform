import { describe, it, expect } from "vitest";
import {
  getDifficultyResult,
  getDifficultyLabel,
  getDifficultyColor,
  getDifficultyEmoji,
} from "./difficultyScorer";

describe("difficultyScorer", () => {
  it("should classify a beginner-friendly good first issue as Easy", () => {
    const issue = {
      labels: ["good first issue", "documentation"],
      comments_count: 0,
      created_at: new Date().toISOString(),
      stars_count: 50,
      is_assigned: false,
      has_pull_requests: false,
    };

    const result = getDifficultyResult(issue);
    expect(result.score).toBeLessThanOrEqual(3.0);
    expect(result.label).toBe("Easy");
    expect(result.color).toBe("green");
    expect(result.emoji).toBe("🟢");
  });

  it("should classify complex architectural issues as Hard", () => {
    const issue = {
      labels: ["architecture", "breaking-change", "security"],
      comments_count: 15,
      created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      stars_count: 15000,
      is_assigned: true,
      has_pull_requests: true,
    };

    const result = getDifficultyResult(issue);
    expect(result.score).toBeGreaterThan(6.0);
    expect(result.label).toBe("Hard");
    expect(result.color).toBe("red");
    expect(result.emoji).toBe("🔴");
  });

  it("should clamp scores between 1.0 and 10.0", () => {
    const minIssue = {
      labels: ["good first issue", "beginner", "easy", "documentation", "docs"],
      comments_count: 0,
      created_at: new Date().toISOString(),
      is_assigned: false,
      has_pull_requests: false,
    };
    const maxIssue = {
      labels: ["breaking-change", "architecture", "security", "complex", "performance"],
      comments_count: 100,
      created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      stars_count: 50000,
      is_assigned: true,
      has_pull_requests: true,
    };

    expect(getDifficultyResult(minIssue).score).toBeGreaterThanOrEqual(1.0);
    expect(getDifficultyResult(maxIssue).score).toBeLessThanOrEqual(10.0);
  });

  it("should return appropriate labels, colors, and emojis for score boundaries", () => {
    expect(getDifficultyLabel(2.5)).toBe("Easy");
    expect(getDifficultyLabel(3.0)).toBe("Easy");
    expect(getDifficultyLabel(4.5)).toBe("Medium");
    expect(getDifficultyLabel(6.0)).toBe("Medium");
    expect(getDifficultyLabel(7.5)).toBe("Hard");

    expect(getDifficultyColor(3.0)).toBe("green");
    expect(getDifficultyColor(5.0)).toBe("yellow");
    expect(getDifficultyColor(8.0)).toBe("red");

    expect(getDifficultyEmoji(3.0)).toBe("🟢");
    expect(getDifficultyEmoji(5.0)).toBe("🟡");
    expect(getDifficultyEmoji(8.0)).toBe("🔴");
  });
});
