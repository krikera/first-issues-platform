/**
 * Rate limiting middleware using sliding window algorithm
 * TODO: Note this rate limiter will reset frequently in Serverless environments (like Vercel).
 * A persistent store like Redis (e.g. Vercel KV) is needed for a true production rate limiter.
 */

const requestCounts = new Map<string, number[]>();

const DEFAULT_MAX_REQUESTS = 100;
const DEFAULT_WINDOW_SECONDS = 900; // 15 minutes

/**
 * Robustly extract and sanitize client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check Cloudflare header first if available
  const cfIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && isValidIp(cfIp)) return cfIp;

  // Check Vercel trusted edge header
  const vercelIp = request.headers.get("x-vercel-ip")?.trim();
  if (vercelIp && isValidIp(vercelIp)) return vercelIp;

  // Check X-Real-IP
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp && isValidIp(realIp)) return realIp;

  // Check X-Forwarded-For (use rightmost entry added by closest reverse proxy to prevent client spoofing)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim());
    for (let i = parts.length - 1; i >= 0; i--) {
      if (parts[i] && isValidIp(parts[i])) {
        return parts[i];
      }
    }
  }

  return "127.0.0.1";
}

function isValidIp(ip: string): boolean {
  // Validate IPv4
  const ipv4Match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    return ipv4Match.slice(1).every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  // Validate IPv6
  const ipv6Regex = /^([a-fA-F0-9:]+)$/;
  return ipv6Regex.test(ip) && ip.includes(":");
}

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
