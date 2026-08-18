/**
 * In-memory cache service
 * TODO: Note this cache will reset frequently in Serverless environments (like Vercel).
 * A persistent store like Redis is needed for a true production serverless cache.
 */

import crypto from "crypto";

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private cacheDuration: number;
  private maxCacheSize: number;

  constructor() {
    this.cacheDuration = parseInt(process.env.CACHE_DURATION || "300", 10);
    this.maxCacheSize = parseInt(
      process.env.MAX_MEMORY_CACHE_SIZE || "1000",
      10
    );
  }

  private generateCacheKey(
    endpoint: string,
    params?: Record<string, unknown>
  ): string {
    const paramString = params ? JSON.stringify(params, Object.keys(params).sort()) : "";
    const hash = crypto.createHash("md5").update(paramString).digest("hex");
    return `first_issues:${endpoint}:${hash}`;
  }

  get(
    endpoint: string,
    params?: Record<string, unknown>
  ): unknown | null {
    const cacheKey = this.generateCacheKey(endpoint, params);
    const entry = this.memoryCache.get(cacheKey);

    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl * 1000) {
      this.memoryCache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  set(
    endpoint: string,
    data: unknown,
    params?: Record<string, unknown>,
    ttl?: number
  ): boolean {
    const cacheKey = this.generateCacheKey(endpoint, params);
    const effectiveTtl = ttl || this.cacheDuration;

    // Cleanup expired entries
    this.cleanupExpired();

    // Enforce max size
    if (this.memoryCache.size >= this.maxCacheSize) {
      const entriesToRemove = Math.max(1, Math.floor(this.maxCacheSize / 10));
      const sortedKeys = [...this.memoryCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, entriesToRemove)
        .map(([key]) => key);

      for (const key of sortedKeys) {
        this.memoryCache.delete(key);
      }
    }

    this.memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: effectiveTtl,
    });

    return true;
  }

  delete(
    endpoint: string,
    params?: Record<string, unknown>
  ): boolean {
    const cacheKey = this.generateCacheKey(endpoint, params);
    return this.memoryCache.delete(cacheKey);
  }

  clearAll(): boolean {
    this.memoryCache.clear();
    return true;
  }

  getInfo() {
    return {
      memorySize: this.memoryCache.size,
      cacheDuration: this.cacheDuration,
    };
  }

  healthCheck() {
    return {
      timestamp: new Date().toISOString(),
      memory: { status: "ok", size: this.memoryCache.size },
    };
  }

  private cleanupExpired(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.memoryCache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

// Global singleton
const globalForCache = globalThis as unknown as {
  cacheService: CacheService | undefined;
};

export const cacheService =
  globalForCache.cacheService ?? new CacheService();

if (process.env.NODE_ENV !== "production")
  globalForCache.cacheService = cacheService;
