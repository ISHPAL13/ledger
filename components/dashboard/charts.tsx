"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { currency } from "@/lib/utils";

type ChartPoint = {
  month: string;
  invoiceValue: number;
  gstValue: number;
};

export function DashboardCharts({ data }: { data: ChartPoint[] }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <div className="mb-4 text-lg font-semibold text-slate-950">Month-wise Invoice Value</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="invoiceValue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => currency(Number(value))} />
              <Area type="monotone" dataKey="invoiceValue" stroke="#2563eb" fill="url(#invoiceValue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <div className="mb-4 text-lg font-semibold text-slate-950">Month-wise GST Value</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gstValue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => currency(Number(value))} />
              <Area type="monotone" dataKey="gstValue" stroke="#16a34a" fill="url(#gstValue)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
