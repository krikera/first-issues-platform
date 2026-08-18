/**
 * Date formatting utilities for user-friendly date displays
 */

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  if (diffInMonths > 0) return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  if (diffInWeeks > 0) return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  if (diffInDays > 0) return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  if (diffInHours > 0) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  if (diffInMinutes > 0) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  return "Just now";
}

export function formatAbsoluteDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateWithRelative(dateString: string): string {
  return `${formatAbsoluteDate(dateString)} (${formatRelativeTime(dateString)})`;
}

export function isRecentDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 7;
}

export function formatDateForTitle(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  });
}
