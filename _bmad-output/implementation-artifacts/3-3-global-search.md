# Story 3.3: Global Search Command Palette

Status: ready-for-dev

## Story

As a user,
I want Cmd+K search to find any entity instantly,
so that I navigate efficiently.

## Acceptance Criteria (ACs)

1. shadcn Command component (cmdk-based) triggered by Cmd+K (Mac) or Ctrl+K (Windows/Linux) keyboard shortcut
2. Search across multiple entity types: cases, clients, attorneys, documents, invoices
3. Results grouped by entity type with appropriate icons (Briefcase for cases, Users for clients, etc.)
4. Clicking a result navigates to the entity's detail page
5. Recent searches stored and displayed from localStorage
6. Full keyboard navigation support: arrow keys to move between results, Enter to select, Escape to close
7. Search button in the header that also opens the command palette

## Tasks / Subtasks

- [ ] Create `src/components/shared/command-search.tsx` — Main command palette component using shadcn Command (Dialog + Command) with search input, grouped results, keyboard navigation (AC1, AC6)
- [ ] Implement global keyboard shortcut listener: Cmd+K on Mac, Ctrl+K on Windows/Linux to open/close the command palette dialog (AC1)
- [ ] Create `src/lib/actions/search.ts` — Server action `globalSearch(query: string)` that searches across cases (caseNumber, title), clients (name, email), attorneys (name, barNumber, lskNumber), documents (title), invoices (invoiceNumber) using ILIKE pattern matching (AC2)
- [ ] Implement search query with ILIKE `%query%` against each entity type, returning top 5 results per type with id, display name, type, and subtitle (AC2)
- [ ] Render results grouped by entity type with section headers and Lucide icons: Briefcase (cases), Users (clients), UserCheck (attorneys), FileText (documents), CreditCard (invoices) (AC3)
- [ ] Implement navigation on result selection: cases -> /cases/[id], clients -> /clients/[id], attorneys -> /attorneys/[id], documents -> /documents/[id], invoices -> /billing/[id]; close dialog after navigation (AC4)
- [ ] Implement recent searches: store last 5 search queries in localStorage, display as a "Recent" section when palette opens with no query, clear recent searches option (AC5)
- [ ] Ensure full keyboard navigation: Up/Down arrows cycle through results, Enter navigates to selected result, Escape closes the palette, Tab support (AC6)
- [ ] Update `src/components/layout/header.tsx` — Add search trigger button in the header that opens the command palette when clicked, displays "Search... Cmd+K" text (AC7)
- [ ] Add debounced search input (300ms) to avoid excessive server calls while typing (AC2)
- [ ] Apply role-based filtering: clients should only see their own cases/documents/invoices in search results; attorneys see their assigned entities; admins see all (AC2)
- [ ] Handle empty search results with "No results found" message (AC3)
- [ ] Handle loading state while search is executing (spinner or skeleton in results area) (AC3)

## Dev Notes

### Architecture & Constraints
- shadcn Command component is built on top of cmdk (https://cmdk.paco.me/), a headless command menu
- The command palette opens as a Dialog (modal overlay) centered on screen
- Search is performed via a server action that queries the database; results are returned to the client component
- Use `useEffect` with a keyboard event listener on `document` for the Cmd+K shortcut
- Debounce the search input to reduce server calls
- The component is a Client Component (`"use client"`) because it manages dialog state and keyboard events

### Command Component Pattern
```typescript
"use client";
import { CommandDialog, CommandInput, CommandList, CommandEmpty,
  CommandGroup, CommandItem, CommandSeparator } from '@/components/ui/command';

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({});

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search cases, clients, attorneys..." value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {results.cases?.length > 0 && (
          <CommandGroup heading="Cases">
            {results.cases.map(item => (
              <CommandItem key={item.id} onSelect={() => navigate(item)}>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
                <span className="ml-auto text-muted-foreground text-sm">{item.subtitle}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {/* ... other groups */}
      </CommandList>
    </CommandDialog>
  );
}
```

### Search Query Pattern (Server Action)
```typescript
"use server";
export async function globalSearch(query: string) {
  if (!query || query.length < 2) return {};
  const pattern = `%${query}%`;

  const [cases, clients, attorneys, documents, invoices] = await Promise.all([
    db.select({ id: casesTable.id, title: casesTable.title, caseNumber: casesTable.caseNumber })
      .from(casesTable).where(or(ilike(casesTable.title, pattern), ilike(casesTable.caseNumber, pattern))).limit(5),
    // ... similar for other entities
  ]);

  return { cases, clients, attorneys, documents, invoices };
}
```

### Recent Searches (localStorage)
```typescript
const RECENT_KEY = 'recent-searches';
const MAX_RECENT = 5;

function addRecentSearch(query: string) {
  const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  const updated = [query, ...recent.filter((q: string) => q !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}
```

### Project Structure Notes

Files to create:
- `src/components/shared/command-search.tsx` — Command palette component
- `src/lib/actions/search.ts` — Global search server action

Files to modify:
- `src/components/layout/header.tsx` — Add search trigger button
- `src/app/(dashboard)/layout.tsx` — Include CommandSearch component
- `src/app/(portal)/layout.tsx` — Include CommandSearch component (if portal users get search)

### References

- [Source: a.md — Implementation Phases, Phase 2, step 12: Global search command palette]
- [Source: epics.md — Epic 3, Story 3.3]
- [Source: a.md — Module 4: Client Management — Conflict of Interest Check (search patterns)]
