"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { dashboardNav, portalNav } from "./sidebar-nav";

interface MobileNavProps {
  role: string;
  permissions: Record<string, string[]>;
}

export function MobileNav({ role, permissions }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Use portal nav for client role, dashboard nav otherwise
  const isClient = role === "client";
  const navGroups = isClient
    ? [{ label: "Portal", items: portalNav }]
    : dashboardNav;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Law Firm Registry
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-57px)]">
            <nav className="space-y-1 p-3">
              {navGroups.map((group, groupIdx) => (
                <div key={group.label}>
                  {groupIdx > 0 && <Separator className="my-2" />}
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </p>
                  {group.items
                    .filter((item) => {
                      if (!item.resource) return true;
                      return permissions[item.resource]?.includes("read");
                    })
                    .map((item) => {
                      // Strip query params from href for active state comparison
                      const hrefPath = item.href.split("?")[0];
                      const isActive =
                        pathname === hrefPath ||
                        (hrefPath !== "/dashboard" &&
                          hrefPath !== "/portal" &&
                          pathname.startsWith(hrefPath + "/"));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                          {item.badge != null && item.badge > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-auto h-5 min-w-5 justify-center text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                </div>
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
