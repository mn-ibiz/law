import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotificationBellWrapper } from "@/components/notifications/notification-bell-wrapper";
import { requireAuth } from "@/lib/auth/get-session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <Sidebar />
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
