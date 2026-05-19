"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  UploadCloud
} from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  Dashboard: LayoutDashboard,
  Clients: Building2,
  Upload: UploadCloud,
  Invoices: FileText,
  "GST Reports": BarChart3,
  Downloads: FileSpreadsheet,
  Settings: Settings
};

export function Sidebar({ firmName }: { firmName: string }) {
  const pathname = usePathname();

  return (
    <aside className="glass hidden w-72 flex-col border-r border-white/60 xl:flex">
      <div className="border-b border-slate-200/80 px-7 py-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-600 text-xl font-bold text-white">
            TL
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-950">Talos Ledger</div>
            <div className="text-sm text-slate-500">{firmName}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-5">
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.label as keyof typeof icons] || FileText;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-brand-600 text-white shadow-lg shadow-brand-100" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200/80 p-5">
        <form action="/api/auth/logout" method="post">
          <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
