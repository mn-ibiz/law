import { requireRole } from "@/lib/auth/get-session";
import { fullTextSearch } from "@/lib/queries/search";
import { SearchResults } from "@/components/search/search-results";
import { Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Search across cases and documents",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await requireRole("admin", "attorney");
  const params = await searchParams;
  const query = params.q ?? "";
  const results = query ? await fullTextSearch(query) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Search Results</h1>
          <p className="text-sm text-muted-foreground">
            {query
              ? `Showing results for "${query}"`
              : "Enter a search query to find cases and documents."}
          </p>
        </div>
      </div>

      <SearchResults results={results} query={query} />
    </div>
  );
}
