import { cn } from "@/lib/utils";

const variants = {
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-100",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  FAILED: "bg-red-50 text-red-700 border-red-100",
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200"
} as const;

export function Badge({
  value,
  className
}: {
  value: keyof typeof variants | string;
  className?: string;
}) {
  const variant = variants[value as keyof typeof variants] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", variant, className)}>
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
