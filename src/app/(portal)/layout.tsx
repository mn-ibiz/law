import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { Header } from "@/components/layout/header";
import { requireRole } from "@/lib/auth/get-session";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("client");

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
