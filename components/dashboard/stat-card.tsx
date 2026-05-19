import { Card } from "@/components/ui/card";
import { cn, currency } from "@/lib/utils";

export function StatCard({
  title,
  value,
  helper,
  accent = "blue"
}: {
  title: string;
  value: string | number;
  helper?: string;
  accent?: "blue" | "green" | "amber" | "red";
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</div>
          {helper ? <div className="mt-2 text-sm text-slate-500">{helper}</div> : null}
        </div>
        <div
          className={cn(
            "h-14 w-14 rounded-3xl",
            accent === "blue" && "bg-blue-100",
            accent === "green" && "bg-emerald-100",
            accent === "amber" && "bg-amber-100",
            accent === "red" && "bg-red-100"
          )}
        />
      </div>
    </Card>
  );
}

export function CurrencyStatCard(props: Omit<Parameters<typeof StatCard>[0], "value"> & { value?: number }) {
  return <StatCard {...props} value={currency(props.value)} />;
}
