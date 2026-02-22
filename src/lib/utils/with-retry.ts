/**
 * Retry an async operation on Postgres unique constraint violation (23505).
 * Used for sequential number generation where concurrent inserts can collide.
 */
export async function withUniqueRetry<T>(
  fn: (attempt: number) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn(attempt);
    } catch (error: unknown) {
      const isUniqueViolation =
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "23505";
      if (!isUniqueViolation || attempt === maxRetries) {
        throw error;
      }
      // Retry on unique constraint violation
    }
  }
  throw new Error("Unreachable");
}
