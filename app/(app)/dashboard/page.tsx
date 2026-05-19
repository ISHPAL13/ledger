import Link from "next/link";
import { Eye, FileWarning } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/components/dashboard/charts";
import { CurrencyStatCard, StatCard } from "@/components/dashboard/stat-card";
import { requireUser } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/data";
import { currency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.firmId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Clients" value={data.summary.totalClients} helper="managed under this firm" />
        <StatCard title="Active Clients" value={data.summary.activeClients} helper="available for new uploads" accent="green" />
        <StatCard title="Total Invoices" value={data.summary.totalInvoices} helper="across all clients" />
        <StatCard title="Invoices This Month" value={data.summary.invoicesThisMonth} helper="current month activity" accent="amber" />
        <StatCard title="Pending Review" value={data.summary.pending} helper="awaiting CA approval" accent="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Completed Invoices" value={data.summary.completed} helper="approved by team" accent="green" />
        <StatCard title="Failed Invoices" value={data.summary.failed} helper="needs retry or cleanup" accent="red" />
        <CurrencyStatCard title="Total Taxable Amount" value={data.summary.taxableAmount} helper="base taxable value" />
        <CurrencyStatCard title="Total GST" value={data.summary.totalGst} helper="CGST + SGST + IGST" accent="green" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CurrencyStatCard title="Total Invoice Value" value={data.summary.invoiceValue} helper="grand total across invoices" />
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-950">Recent uploads</div>
              <div className="text-sm text-slate-500">Latest client-wise document activity</div>
            </div>
            <Link href="/invoices" className="text-sm font-semibold text-brand-600">
              View all
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">File</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.recentUploads.map((invoice) => (
                  <tr key={invoice.id} className="border-t border-slate-100">
                    <td className="py-4 font-medium text-slate-900">{invoice.fileName}</td>
                    <td className="py-4 text-slate-600">{invoice.client?.businessName || "Unassigned"}</td>
                    <td className="py-4 text-slate-600">{currency(Number(invoice.grandTotal || 0))}</td>
                    <td className="py-4">
                      <Badge value={invoice.status} />
                    </td>
                    <td className="py-4 text-slate-600">{formatDate(invoice.createdAt)}</td>
                    <td className="py-4">
                      <Link href={`/invoices/${invoice.id}`} className="inline-flex items-center gap-2 text-brand-600">
                        <Eye className="h-4 w-4" />
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <DashboardCharts data={data.chartData} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-950">Clients with pending review</div>
            <Link href="/clients" className="text-sm font-semibold text-brand-600">
              View clients
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.topClientsByCount.filter((client) => client.pending > 0).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No pending invoices. All invoices are approved.
              </div>
            ) : (
              data.topClientsByCount
                .filter((client) => client.pending > 0)
                .map((client) => (
                  <div key={client.id} className="rounded-2xl border border-slate-100 p-4">
                    <div className="font-semibold text-slate-950">{client.businessName}</div>
                    <div className="mt-1 text-sm text-slate-500">{client.pending} invoices pending review</div>
                  </div>
                ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-950">Top clients by invoice value</div>
            <Link href="/reports" className="text-sm font-semibold text-brand-600">
              GST reports
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.topClientsByValue.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No clients with invoices yet. Add clients and upload invoices.
              </div>
            ) : (
              data.topClientsByValue.map((client) => (
                <div key={client.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                  <div>
                    <div className="font-semibold text-slate-950">{client.businessName}</div>
                    <div className="text-sm text-slate-500">{client.count} invoices</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-slate-950">{currency(client.value)}</div>
                    <div className="text-xs text-slate-400">invoice value</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-red-600">
              <FileWarning className="h-5 w-5" />
              Failed extractions
            </div>
            <Link href="/invoices?status=FAILED" className="text-sm font-semibold text-brand-600">
              View failed
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {data.failedExtractions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No failed extractions right now.
              </div>
            ) : (
              data.failedExtractions.map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-slate-950">{invoice.fileName}</div>
                      <div className="mt-1 text-sm text-slate-500">{invoice.client?.businessName || "Unassigned"}</div>
                      <div className="mt-2 text-xs text-red-600">{invoice.extractionError || "Retry with OCR fallback"}</div>
                    </div>
                    <form action={`/api/invoices/${invoice.id}/retry`} method="post">
                      <button className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600">Retry</button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
