import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBellWrapper } from "@/components/notifications/notification-bell-wrapper";
import { requireRole } from "@/lib/auth/get-session";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("client");

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <PortalSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header
            actions={
              <Suspense>
                <NotificationBellWrapper />
              </Suspense>
            }
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
