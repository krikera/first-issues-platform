/**
 * Frontend difficulty scorer
 */

export interface DifficultyResult {
  score: number;
  label: string;
  color: string;
  emoji: string;
}

function calculateDifficulty(issue: {
  labels: string[];
  comments_count?: number;
  created_at: string;
  stars_count?: number;
  is_assigned?: boolean;
  has_pull_requests?: boolean;
}): number {
  let score = 5.0;

  const labels = issue.labels.map((l) => l.toLowerCase());

  if (labels.some((l) => l.includes("good") && l.includes("first"))) score -= 2.0;
  if (labels.some((l) => l.includes("beginner") || l.includes("easy"))) score -= 1.0;
  if (labels.includes("documentation") || labels.includes("docs")) score -= 0.5;
  if (labels.includes("bug")) score += 1.0;
  if (labels.includes("enhancement") || labels.includes("feature")) score += 1.0;
  if (labels.includes("performance") || labels.includes("refactor")) score += 1.5;
  if (labels.includes("security")) score += 1.5;
  if (labels.includes("architecture") || labels.includes("complex")) score += 2.0;
  if (labels.includes("breaking-change") || labels.includes("breaking change")) score += 2.5;

  const commentCount = issue.comments_count || 0;
  if (commentCount === 0) score -= 1.0;
  else if (commentCount > 10) score += 1.0;

  const createdAt = new Date(issue.created_at);
  const now = new Date();
  const daysOld = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysOld < 7) score -= 0.5;
  else if (daysOld > 30) score += 1.0;

  const stars = issue.stars_count || 0;
  if (stars >= 1000 && stars < 10000) score += 0.5;
  else if (stars >= 10000) score += 1.0;

  if (issue.is_assigned === false) score -= 0.5;
  else if (issue.is_assigned === true) score += 0.5;

  if (issue.has_pull_requests === false) score -= 0.5;
  else if (issue.has_pull_requests === true) score += 0.5;

  return Math.max(1.0, Math.min(10.0, score));
}

export function getDifficultyLabel(score: number): string {
  if (score <= 3.0) return "Easy";
  if (score <= 6.0) return "Medium";
  return "Hard";
}

export function getDifficultyColor(score: number): string {
  if (score <= 3.0) return "green";
  if (score <= 6.0) return "yellow";
  return "red";
}

export function getDifficultyEmoji(score: number): string {
  if (score <= 3.0) return "🟢";
  if (score <= 6.0) return "🟡";
  return "🔴";
}

export function getDifficultyResult(issue: {
  labels: string[];
  comments_count?: number;
  created_at: string;
  stars_count?: number;
  is_assigned?: boolean;
  has_pull_requests?: boolean;
}): DifficultyResult {
  const score = calculateDifficulty(issue);
  return {
    score,
    label: getDifficultyLabel(score),
    color: getDifficultyColor(score),
    emoji: getDifficultyEmoji(score),
  };
}
