"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Briefcase } from "lucide-react";

interface SearchResult {
  id: string;
  type: "case" | "document";
  title: string;
  description: string | null;
  rank: number;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
}

export function SearchResults({ results, query }: SearchResultsProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  }

  const caseResults = results.filter((r) => r.type === "case");
  const docResults = results.filter((r) => r.type === "document");

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search cases and documents..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {query && results.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-lg font-medium">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try different keywords or check your spelling.
          </p>
        </div>
      )}

      {caseResults.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Briefcase className="h-5 w-5" />
            Cases ({caseResults.length})
          </h2>
          <div className="space-y-2">
            {caseResults.map((result) => (
              <Link key={result.id} href={`/cases/${result.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-start gap-3 p-4">
                    <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{result.title}</p>
                      {result.description && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">Case</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {docResults.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5" />
            Documents ({docResults.length})
          </h2>
          <div className="space-y-2">
            {docResults.map((result) => (
              <Link key={result.id} href={`/documents?highlight=${result.id}`}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-start gap-3 p-4">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{result.title}</p>
                      {result.description && (
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {result.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Document</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
