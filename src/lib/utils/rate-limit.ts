/**
 * Tenant-aware rate limiter with Upstash Redis backend.
 *
 * Uses @upstash/ratelimit with sliding window when UPSTASH_REDIS_REST_URL is
 * configured. Falls back to an in-memory Map for local development.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset?: number;
}

interface RateLimitOptions {
  maxRequests?: number;
  windowMs?: number;
}

// ---------------------------------------------------------------------------
// Redis client (singleton)
// ---------------------------------------------------------------------------

let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redisClient = new Redis({ url, token });
  return redisClient;
}

// ---------------------------------------------------------------------------
// Upstash rate limiters (cached by config key)
// ---------------------------------------------------------------------------

const limiters = new Map<string, Ratelimit>();

function getUpstashLimiter(maxRequests: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${maxRequests}:${windowMs}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    const windowSec = Math.max(1, Math.round(windowMs / 1000));
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSec} s`),
      prefix: "rl",
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

// ---------------------------------------------------------------------------
// In-memory fallback (for local dev without Redis)
// ---------------------------------------------------------------------------

const memoryStore = new Map<string, number[]>();

function inMemoryRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const timestamps = memoryStore.get(key) ?? [];
  const valid = timestamps.filter((t) => now - t < windowMs);

  if (valid.length >= maxRequests) {
    memoryStore.set(key, valid);
    return { success: false, remaining: 0 };
  }

  valid.push(now);
  memoryStore.set(key, valid);
  return { success: true, remaining: maxRequests - valid.length };
}

// Periodic cleanup for in-memory store.
// Uses DEFAULT_WINDOW_MS (1 hour) as the max TTL for all entries. Keys with
// shorter windows (e.g. per-plan 1-minute limits) may linger longer than
// needed but are correctly filtered at check time. This trades minor memory
// for simplicity — no need to track per-key window durations.
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    const defaultWindow = DEFAULT_WINDOW_MS;
    for (const [key, timestamps] of memoryStore) {
      const valid = timestamps.filter((t) => now - t < defaultWindow);
      if (valid.length === 0) {
        memoryStore.delete(key);
      } else {
        memoryStore.set(key, valid);
      }
    }
  }, 10 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const DEFAULT_MAX_REQUESTS = 5;
const DEFAULT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Rate limit a key. Uses Upstash Redis when configured, otherwise falls back
 * to in-memory. Accepts optional maxRequests and windowMs overrides.
 */
export async function rateLimit(
  key: string,
  opts?: RateLimitOptions
): Promise<RateLimitResult> {
  const maxRequests = opts?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const windowMs = opts?.windowMs ?? DEFAULT_WINDOW_MS;

  const upstash = getUpstashLimiter(maxRequests, windowMs);
  if (upstash) {
    const result = await upstash.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return inMemoryRateLimit(key, maxRequests, windowMs);
}

// ---------------------------------------------------------------------------
// Per-plan rate limit helper
// ---------------------------------------------------------------------------

const PLAN_LIMITS: Record<string, number> = {
  starter: 100,
  professional: 500,
  enterprise: 2000,
};

/**
 * Get rate limit config for a plan tier. Returns requests-per-minute.
 * Used for high-frequency API endpoints that need per-org throttling.
 */
export function rateLimitForPlan(planSlug: string | null): RateLimitOptions {
  const maxRequests = PLAN_LIMITS[planSlug ?? ""] ?? 100;
  return { maxRequests, windowMs: 60 * 1000 }; // 1 minute window
}
