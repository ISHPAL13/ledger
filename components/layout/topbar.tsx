import Link from "next/link";
import { Plus, Search, UploadCloud, AlertCircle, FileSpreadsheet, FileBarChart2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar({ userName }: { userName: string }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-sm uppercase tracking-[0.24em] text-slate-400">CA Workflow Platform</div>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Welcome back, {userName.split(" ")[0]}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Client-wise invoice workflow, AI extraction, GST summaries, and review queues in one ledger.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href="/clients" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </span>
        </Link>
        <Link href="/upload" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            Upload Invoice
          </span>
        </Link>
        <Link href="/invoices?status=PENDING_REVIEW" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Review Pending
          </span>
        </Link>
        <Link href="/exports" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Download Excel
          </span>
        </Link>
        <Link href="/reports" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          <span className="flex items-center gap-2">
            <FileBarChart2 className="h-4 w-4" />
            GST Summary
          </span>
        </Link>
      </div>
    </div>
  );
}
