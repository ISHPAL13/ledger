import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/session";
import { getFirmScopedShell } from "@/lib/data";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const firm = await getFirmScopedShell(user.firmId);

  return (
    <div className="min-h-screen xl:flex">
      <Sidebar firmName={firm.name} />
      <main className="flex-1 p-4 lg:p-6 xl:p-8">
        <div className="mx-auto max-w-[1500px]">
          <Topbar userName={user.fullName} />
          {children}
        </div>
      </main>
    </div>
  );
}
