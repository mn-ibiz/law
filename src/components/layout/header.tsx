"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";
import { CommandSearch } from "@/components/shared/command-search";

interface HeaderProps {
  role: string;
  permissions: Record<string, string[]>;
  /** Server component slot rendered between search and user nav (e.g. NotificationBellWrapper) */
  actions?: React.ReactNode;
}

export function Header({ role, permissions, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-md md:px-6">
      <MobileNav role={role} permissions={permissions} />

      {/* Search trigger */}
      <SearchTrigger />

      <div className="ml-auto flex items-center gap-2">
        {actions}
        <UserNav />
      </div>

      <CommandSearch />
    </header>
  );
}

function SearchTrigger() {
  function handleClick() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      })
    );
  }

  return (
    <Button
      variant="outline"
      className="relative h-9 w-full max-w-sm justify-start rounded-lg border-border/50 bg-muted/50 text-sm text-muted-foreground shadow-sm hover:bg-muted md:w-64"
      onClick={handleClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span>Search...</span>
      <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </Button>
  );
}
