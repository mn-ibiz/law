"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./user-nav";
import { MobileNav } from "./mobile-nav";
import { CommandSearch } from "@/components/shared/command-search";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <MobileNav />

      {/* Search trigger — the CommandSearch handles Cmd+K internally */}
      <SearchTrigger />

      <div className="ml-auto flex items-center gap-2">
        <UserNav />
      </div>

      <CommandSearch />
    </header>
  );
}

function SearchTrigger() {
  // Dispatch a keyboard event to open the command palette
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
      className="relative h-9 w-full max-w-sm justify-start text-sm text-muted-foreground md:w-64"
      onClick={handleClick}
    >
      <Search className="mr-2 h-4 w-4" />
      <span>Search...</span>
      <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        <span className="text-xs">&#8984;</span>K
      </kbd>
    </Button>
  );
}
