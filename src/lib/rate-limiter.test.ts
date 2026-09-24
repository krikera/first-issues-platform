import { describe, it, expect } from "vitest";
import {
  getClientIp,
  isRateLimited,
  getRemainingRequests,
} from "./rate-limiter";

describe("rate-limiter", () => {
  describe("getClientIp", () => {
    it("should extract IP from Cloudflare header when present", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "cf-connecting-ip": "203.0.113.195" },
      });
      expect(getClientIp(req)).toBe("203.0.113.195");
    });

    it("should extract IP from Vercel header when present", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "x-vercel-ip": "198.51.100.42" },
      });
      expect(getClientIp(req)).toBe("198.51.100.42");
    });

    it("should extract IP from x-real-ip header when present", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "x-real-ip": "192.0.2.1" },
      });
      expect(getClientIp(req)).toBe("192.0.2.1");
    });

    it("should extract rightmost valid IP from x-forwarded-for header to prevent spoofing", () => {
      const req = new Request("http://localhost:3000", {
        headers: { "x-forwarded-for": "10.0.0.1, 192.168.1.1, 203.0.113.50" },
      });
      expect(getClientIp(req)).toBe("203.0.113.50");
    });

    it("should fallback to 127.0.0.1 if no valid IP header is provided", () => {
      const req = new Request("http://localhost:3000");
      expect(getClientIp(req)).toBe("127.0.0.1");
    });
  });

  describe("isRateLimited & getRemainingRequests", () => {
    it("should allow requests under the limit and track remaining count", () => {
      const testIp = `test-ip-${Date.now()}-1`;
      const maxReqs = 3;
      const windowSecs = 60;

      expect(isRateLimited(testIp, maxReqs, windowSecs)).toBe(false);
      expect(getRemainingRequests(testIp, maxReqs, windowSecs)).toBe(2);

      expect(isRateLimited(testIp, maxReqs, windowSecs)).toBe(false);
      expect(getRemainingRequests(testIp, maxReqs, windowSecs)).toBe(1);

      expect(isRateLimited(testIp, maxReqs, windowSecs)).toBe(false);
      expect(getRemainingRequests(testIp, maxReqs, windowSecs)).toBe(0);

      // 4th request exceeds max
      expect(isRateLimited(testIp, maxReqs, windowSecs)).toBe(true);
      expect(getRemainingRequests(testIp, maxReqs, windowSecs)).toBe(0);
    });
  });
});
