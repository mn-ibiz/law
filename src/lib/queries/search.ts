import { db } from "@/lib/db";
import { cases } from "@/lib/db/schema/cases";
import { documents } from "@/lib/db/schema/documents";
import { sql, ilike, and, or, eq } from "drizzle-orm";

export interface FullTextSearchResult {
  id: string;
  type: "case" | "document";
  title: string;
  description: string | null;
  rank: number;
}

/**
 * Full-text search across cases and documents using ILIKE pattern matching.
 * Each search word must match either the title or description.
 */
export async function fullTextSearch(
  organizationId: string,
  query: string
): Promise<FullTextSearchResult[]> {
  if (!query || query.trim().length === 0) return [];

  // Sanitize: strip non-word characters, split into words
  const words = query
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return [];

  // Escape LIKE special characters and build patterns
  const patterns = words.map(
    (w) => `%${w.replace(/[%_\\]/g, "\\$&")}%`
  );

  // Each word must appear in title OR description
  const caseConditions = patterns.map((p) =>
    or(ilike(cases.title, p), ilike(cases.description, p))
  );

  const docConditions = patterns.map((p) =>
    or(ilike(documents.title, p), ilike(documents.description, p))
  );

  const [caseResults, docResults] = await Promise.all([
    db
      .select({
        id: cases.id,
        title: cases.title,
        description: cases.description,
        rank: sql<number>`1`.as("rank"),
      })
      .from(cases)
      .where(and(eq(cases.organizationId, organizationId), ...caseConditions))
      .orderBy(sql`${cases.updatedAt} DESC`)
      .limit(20),

    db
      .select({
        id: documents.id,
        title: documents.title,
        description: documents.description,
        rank: sql<number>`1`.as("rank"),
      })
      .from(documents)
      .where(and(eq(documents.organizationId, organizationId), ...docConditions))
      .orderBy(sql`${documents.updatedAt} DESC`)
      .limit(20),
  ]);

  const results: FullTextSearchResult[] = [
    ...caseResults.map((r) => ({
      ...r,
      type: "case" as const,
    })),
    ...docResults.map((r) => ({
      ...r,
      type: "document" as const,
    })),
  ];

  return results.slice(0, 30);
}
