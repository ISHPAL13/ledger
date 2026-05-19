import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth/session";
import { getReportData } from "@/lib/data";
import { prisma } from "@/lib/db/prisma";
import { currency } from "@/lib/utils";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const [clients, report] = await Promise.all([
    prisma.client.findMany({ where: { firmId: user.firmId }, select: { id: true, businessName: true }, orderBy: { businessName: "asc" } }),
    getReportData(user.firmId, {
      clientId: String(params.clientId || "ALL"),
      invoiceType: String(params.invoiceType || "ALL"),
      from: params.from ? String(params.from) : undefined,
      to: params.to ? String(params.to) : undefined
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">GST Reports</h2>
          <p className="mt-2 text-sm text-slate-500">Overall GST summary, client-wise analysis, vendor-wise totals, and HSN breakdowns.</p>
        </div>
        <Link href={`/api/exports?mode=gst-summary&clientId=${String(params.clientId || "ALL")}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
          Export GST Summary
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><div className="text-sm text-slate-500">Approved Invoices</div><div className="mt-3 text-3xl font-bold">{report.invoices.length}</div></Card>
        <Card><div className="text-sm text-slate-500">Total Taxable Value</div><div className="mt-3 text-3xl font-bold">{currency(report.totals.taxable)}</div></Card>
        <Card><div className="text-sm text-slate-500">Total GST</div><div className="mt-3 text-3xl font-bold">{currency(report.totals.totalGst)}</div></Card>
        <Card><div className="text-sm text-slate-500">Total Invoice Value</div><div className="mt-3 text-3xl font-bold">{currency(report.totals.invoiceValue)}</div></Card>
      </div>

      <Card>
        <form className="grid gap-3 lg:grid-cols-[220px_220px_180px_180px_180px]">
          <Select name="clientId" defaultValue={String(params.clientId || "ALL")}>
            <option value="ALL">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.businessName}</option>
            ))}
          </Select>
          <Select name="invoiceType" defaultValue={String(params.invoiceType || "ALL")}>
            <option value="ALL">All types</option>
            <option value="PURCHASE">Purchase invoice</option>
            <option value="SALES">Sales invoice</option>
            <option value="EXPENSE">Expense bill</option>
            <option value="OTHER">Other</option>
          </Select>
          <Input type="date" name="from" defaultValue={String(params.from || "")} />
          <Input type="date" name="to" defaultValue={String(params.to || "")} />
        </form>
      </Card>

      {[
        { title: "Invoice Type Summary", rows: report.invoiceTypeSummary },
        { title: "Client-wise GST Summary", rows: report.clientSummary },
        { title: "Month-wise GST Summary", rows: report.monthSummary },
        { title: "Vendor-wise GST Summary", rows: report.vendorSummary },
        { title: "HSN-wise Summary", rows: report.hsnSummary }
      ].map(({ title, rows }) => (
        <Card key={title}>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-950">{title}</div>
            <Link href="/exports" className="text-sm font-semibold text-brand-600">Export</Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Invoices</th>
                  <th className="pb-3">Taxable Value</th>
                  <th className="pb-3">CGST</th>
                  <th className="pb-3">SGST</th>
                  <th className="pb-3">IGST</th>
                  <th className="pb-3">Total GST</th>
                  <th className="pb-3">Invoice Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-slate-100">
                    <td className="py-4 font-medium text-slate-950">{row.label}</td>
                    <td className="py-4 text-slate-600">{row.invoices}</td>
                    <td className="py-4 text-slate-600">{currency(row.taxable)}</td>
                    <td className="py-4 text-slate-600">{currency(row.cgst)}</td>
                    <td className="py-4 text-slate-600">{currency(row.sgst)}</td>
                    <td className="py-4 text-slate-600">{currency(row.igst)}</td>
                    <td className="py-4 text-slate-600">{currency(row.totalGst)}</td>
                    <td className="py-4 font-semibold text-slate-950">{currency(row.invoiceValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
