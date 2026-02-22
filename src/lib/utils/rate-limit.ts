/**
 * Simple in-memory sliding-window rate limiter.
 *
 * LIMITATION: This rate limiter stores state in-process memory. It only works
 * correctly for single-instance deployments. In a multi-instance / serverless
 * environment each instance maintains its own independent counters, so the
 * effective limit is multiplied by the number of instances. For production
 * multi-instance deployments, replace the in-memory Map with a shared store
 * such as Redis or a database-backed counter.
 */

const requests = new Map<string, number[]>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5; // max 5 per window

export function rateLimit(key: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = requests.get(key) ?? [];

  // Remove expired entries
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    requests.set(key, valid);
    return { success: false, remaining: 0 };
  }

  valid.push(now);
  requests.set(key, valid);
  return { success: true, remaining: MAX_REQUESTS - valid.length };
}

// Periodic cleanup to prevent memory leaks (runs every 10 minutes)
// Uses .unref() to avoid blocking Node.js process exit
if (typeof setInterval !== "undefined") {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of requests) {
      const valid = timestamps.filter((t) => now - t < WINDOW_MS);
      if (valid.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, valid);
      }
    }
  }, 10 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}
