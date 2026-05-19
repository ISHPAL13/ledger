import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { INVOICE_STATUS_OPTIONS, INVOICE_TYPE_OPTIONS } from "@/lib/constants";
import { requireUser } from "@/lib/auth/session";
import { getInvoices } from "@/lib/data";
import { prisma } from "@/lib/db/prisma";
import { currency, formatDate } from "@/lib/utils";

export default async function InvoicesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const [clients, invoices] = await Promise.all([
    prisma.client.findMany({
      where: { firmId: user.firmId },
      select: { id: true, businessName: true },
      orderBy: { businessName: "asc" }
    }),
    getInvoices(user.firmId, {
      q: String(params.q || ""),
      clientId: String(params.clientId || "ALL"),
      invoiceType: String(params.invoiceType || "ALL"),
      status: String(params.status || "ALL"),
      from: params.from ? String(params.from) : undefined,
      to: params.to ? String(params.to) : undefined
    })
  ]);

  const totals = invoices.reduce(
    (acc, invoice) => {
      acc.value += Number(invoice.grandTotal || 0);
      acc.gst += Number(invoice.totalGst || 0);
      return acc;
    },
    { value: 0, gst: 0 }
  );

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Invoices</h2>
          <p className="mt-2 text-sm text-slate-500">
            {invoices.length} invoices · Invoice Value: {currency(totals.value)} · GST: {currency(totals.gst)}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/exports" className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
            Export
          </Link>
          <Link href="/upload" className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
            Upload Invoice
          </Link>
        </div>
      </div>

      <form className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_180px_180px_180px_180px_180px]">
        <Input name="q" defaultValue={String(params.q || "")} placeholder="Search vendor, invoice #, GST, client..." />
        <Select name="status" defaultValue={String(params.status || "ALL")}>
          <option value="ALL">All status</option>
          {INVOICE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
        <Select name="invoiceType" defaultValue={String(params.invoiceType || "ALL")}>
          <option value="ALL">All types</option>
          {INVOICE_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
        <Select name="clientId" defaultValue={String(params.clientId || "ALL")}>
          <option value="ALL">All clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.businessName}</option>
          ))}
        </Select>
        <Input name="from" type="date" defaultValue={String(params.from || "")} />
        <Input name="to" type="date" defaultValue={String(params.to || "")} />
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Client</th>
              <th className="pb-3">File / Invoice #</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Vendor</th>
              <th className="pb-3">Supplier GST</th>
              <th className="pb-3">Invoice Date</th>
              <th className="pb-3">Taxable Amt</th>
              <th className="pb-3">Total GST</th>
              <th className="pb-3">Invoice Value</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-20 text-center text-slate-500">
                  No invoices uploaded yet. Upload invoice PDFs to extract GST-ready data.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t border-slate-100">
                  <td className="py-4 text-slate-600">{invoice.client?.businessName || "Unassigned"}</td>
                  <td className="py-4">
                    <Link href={`/invoices/${invoice.id}`} className="font-medium text-slate-950 hover:text-brand-600">
                      {invoice.fileName}
                    </Link>
                    <div className="mt-1 text-xs text-slate-400">{invoice.invoiceNumber || "—"}</div>
                  </td>
                  <td className="py-4 text-slate-600">{invoice.invoiceType}</td>
                  <td className="py-4 text-slate-600">{invoice.vendorName || "—"}</td>
                  <td className="py-4 text-slate-600">{invoice.supplierGstNumber || "—"}</td>
                  <td className="py-4 text-slate-600">{formatDate(invoice.invoiceDate)}</td>
                  <td className="py-4 text-slate-600">{currency(Number(invoice.taxableAmount || 0))}</td>
                  <td className="py-4 text-slate-600">{currency(Number(invoice.totalGst || 0))}</td>
                  <td className="py-4 font-semibold text-slate-950">{currency(Number(invoice.grandTotal || 0))}</td>
                  <td className="py-4"><Badge value={invoice.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
