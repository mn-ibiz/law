"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { dashboardNav } from "./sidebar-nav";
import { BranchSelector } from "./branch-selector";

interface SidebarProps {
  role: string;
  userName: string;
  permissions: Record<string, string[]>;
}

export function Sidebar({ role, userName, permissions }: SidebarProps) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-2"
        )}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Scale className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              LFR
            </span>
          )}
        </Link>
      </div>

      {/* Branch Selector (admin only) */}
      {role === "admin" && !collapsed && (
        <div className="border-b border-sidebar-border px-3 py-2.5">
          <BranchSelector />
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 overflow-hidden py-3">
        <nav className="space-y-1 px-2">
          {dashboardNav.map((group, groupIdx) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.resource) return true;
              return permissions[item.resource]?.includes("read");
            });
            if (visibleItems.length === 0) return null;
            return (
            <div key={group.label}>
              {groupIdx > 0 && (
                <div className="my-3 px-2">
                  <div className="h-px bg-sidebar-border" />
                </div>
              )}
              {!collapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                  {group.label}
                </p>
              )}
              {visibleItems
                .map((item) => {
                  const baseHref = item.href.split("?")[0];
                  const isActive =
                    pathname === baseHref ||
                    (baseHref !== "/dashboard" &&
                      pathname.startsWith(baseHref + "/"));
                  const Icon = item.icon;

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {item.badge != null && item.badge > 0 && (
                            <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full bg-sidebar-primary px-1.5 text-[10px] font-semibold text-sidebar-primary-foreground">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent
                          side="right"
                          sideOffset={8}
                          className="font-medium"
                        >
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
            </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile + Collapse */}
      <div className="border-t border-sidebar-border p-2">
        {!collapsed && (
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-primary">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                {userName}
              </p>
              <p className="truncate text-[10px] text-sidebar-foreground/50">
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "px-0"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
