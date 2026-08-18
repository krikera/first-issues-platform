/**
 * Rate limiting middleware using sliding window algorithm
 * TODO: Note this rate limiter will reset frequently in Serverless environments (like Vercel).
 * A persistent store like Redis (e.g. Vercel KV) is needed for a true production rate limiter.
 */

const requestCounts = new Map<string, number[]>();

const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_SECONDS = 900; // 15 minutes

export function isRateLimited(
  clientIp: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS
): boolean {
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;

  // Get or initialize timestamps for this IP
  let timestamps = requestCounts.get(clientIp) || [];

  // Remove entries outside the window
  timestamps = timestamps.filter((ts) => ts > cutoff);

  // Check if rate limited
  if (timestamps.length >= maxRequests) {
    requestCounts.set(clientIp, timestamps);
    return true;
  }

  // Add current request
  timestamps.push(now);
  requestCounts.set(clientIp, timestamps);

  // Periodic cleanup of stale IPs
  if (requestCounts.size > 10000) {
    for (const [ip, ts] of requestCounts.entries()) {
      const filtered = ts.filter((t) => t > cutoff);
      if (filtered.length === 0) {
        requestCounts.delete(ip);
      } else {
        requestCounts.set(ip, filtered);
      }
    }
  }

  return false;
}

export function getRemainingRequests(
  clientIp: string,
  maxRequests: number = DEFAULT_MAX_REQUESTS,
  windowSeconds: number = DEFAULT_WINDOW_SECONDS
): number {
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;
  const timestamps = (requestCounts.get(clientIp) || []).filter(
    (ts) => ts > cutoff
  );
  return Math.max(0, maxRequests - timestamps.length);
}
