import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export interface FullTextSearchResult {
  id: string;
  type: "case" | "document";
  title: string;
  description: string | null;
  rank: number;
}

/**
 * Full-text search across cases and documents using PostgreSQL tsvector / GIN indexes.
 * Words are joined with & (AND) and suffixed with :* for prefix matching.
 */
export async function fullTextSearch(
  query: string
): Promise<FullTextSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  // Sanitize: strip non-word characters, split into words, suffix with :* for prefix match
  const sanitized = query
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w + ":*")
    .join(" & ");

  if (!sanitized) return [];

  const [caseResults, docResults] = await Promise.all([
    db.execute<{
      id: string;
      title: string;
      description: string | null;
      rank: number;
    }>(sql`
      SELECT
        id,
        title,
        description,
        ts_rank(search_vector, to_tsquery('english', ${sanitized})) as rank
      FROM cases
      WHERE search_vector @@ to_tsquery('english', ${sanitized})
      ORDER BY rank DESC
      LIMIT 20
    `),

    db.execute<{
      id: string;
      title: string;
      description: string | null;
      rank: number;
    }>(sql`
      SELECT
        id,
        title,
        description,
        ts_rank(search_vector, to_tsquery('english', ${sanitized})) as rank
      FROM documents
      WHERE search_vector @@ to_tsquery('english', ${sanitized})
      ORDER BY rank DESC
      LIMIT 20
    `),
  ]);

  const results: FullTextSearchResult[] = [
    ...(caseResults.rows ?? []).map((r) => ({
      ...r,
      type: "case" as const,
    })),
    ...(docResults.rows ?? []).map((r) => ({
      ...r,
      type: "document" as const,
    })),
  ];

  // Sort combined results by rank descending
  results.sort((a, b) => b.rank - a.rank);

  return results.slice(0, 30);
}
