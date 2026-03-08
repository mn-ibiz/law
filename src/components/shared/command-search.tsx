"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Users,
  UserCheck,
  FileText,
  CreditCard,
  Search,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { globalSearch, type SearchResult } from "@/lib/actions/search";
import { useOrgConfig } from "@/components/providers/tenant-config-provider";

const MAX_RECENT = 5;

const typeIcons: Record<string, typeof Briefcase> = {
  case: Briefcase,
  client: Users,
  attorney: UserCheck,
  document: FileText,
  invoice: CreditCard,
};

const typeLabels: Record<string, string> = {
  case: "Cases",
  client: "Clients",
  attorney: "Attorneys",
  document: "Documents",
  invoice: "Invoices",
};

function getRecentSearches(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(key: string, query: string) {
  const recent = getRecentSearches(key);
  const updated = [query, ...recent.filter((q) => q !== query)].slice(
    0,
    MAX_RECENT
  );
  localStorage.setItem(key, JSON.stringify(updated));
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const { organizationId } = useOrgConfig();
  const recentKey = `${organizationId}:recent-searches`;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches(recentKey));
    }
  }, [open, recentKey]);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await globalSearch(q);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  function handleSelect(result: SearchResult) {
    addRecentSearch(recentKey, query);
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function handleRecentSelect(q: string) {
    setQuery(q);
  }

  function handleSearchAll() {
    if (query.trim()) {
      addRecentSearch(recentKey, query);
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>(
    (acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item);
      return acc;
    },
    {}
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search cases, clients, attorneys..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {!loading &&
          query.length < 2 &&
          recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((q) => (
                <CommandItem
                  key={q}
                  onSelect={() => handleRecentSelect(q)}
                  value={`recent-${q}`}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{q}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

        {!loading &&
          Object.entries(grouped).map(([type, items], idx) => {
            const Icon = typeIcons[type] ?? Search;
            return (
              <div key={type}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup heading={typeLabels[type] ?? type}>
                  {items.map((item) => (
                    <CommandItem
                      key={`${item.type}-${item.id}`}
                      onSelect={() => handleSelect(item)}
                      value={`${item.type}-${item.title}-${item.subtitle}`}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            );
          })}

        {!loading && query.length >= 2 && (
          <>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                onSelect={handleSearchAll}
                value={`search-all-${query}`}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                <span>Search all for &quot;{query}&quot;</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
