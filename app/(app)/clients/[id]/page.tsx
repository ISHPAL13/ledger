import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { getClientProfile } from "@/lib/data";
import { currency, formatDate } from "@/lib/utils";

export default async function ClientProfilePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { tab = "invoices" } = await searchParams;

  try {
    const { client, totals } = await getClientProfile(user.firmId, id);

    return (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-slate-950">{client.businessName}</h2>
                <Badge value={client.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slate-500 md:grid-cols-2">
                <div>GST: {client.gstNumber || "—"}</div>
                <div>PAN: {client.panNumber || "—"}</div>
                <div>Contact: {client.contactPersonName || "—"}</div>
                <div>Email: {client.email || "—"}</div>
                <div>Phone: {client.phone || "—"}</div>
                <div>Address: {client.businessAddress || "—"}</div>
              </div>
            </div>
            <Link href={`/upload?clientId=${client.id}`} className="rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
              Upload invoice
            </Link>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><div className="text-sm text-slate-500">Total invoices</div><div className="mt-3 text-3xl font-bold">{client.invoices.length}</div></Card>
          <Card><div className="text-sm text-slate-500">Taxable amount</div><div className="mt-3 text-3xl font-bold">{currency(totals.taxableAmount)}</div></Card>
          <Card><div className="text-sm text-slate-500">Total GST</div><div className="mt-3 text-3xl font-bold">{currency(totals.totalGst)}</div></Card>
          <Card><div className="text-sm text-slate-500">Invoice value</div><div className="mt-3 text-3xl font-bold">{currency(totals.invoiceValue)}</div></Card>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["invoices", "Invoices"],
            ["upload", "Upload Invoice"],
            ["summary", "GST Summary"],
            ["details", "Client Details"]
          ].map(([value, label]) => (
            <Link
              key={value}
              href={`/clients/${client.id}?tab=${value}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === value ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {tab === "upload" ? (
          <Card>
            <div className="text-lg font-semibold text-slate-950">Upload invoices for {client.businessName}</div>
            <p className="mt-2 text-sm text-slate-500">Use the dedicated upload workspace to attach PDFs directly to this client.</p>
            <Link href={`/upload?clientId=${client.id}`} className="mt-4 inline-flex rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
              Open upload page
            </Link>
          </Card>
        ) : null}

        {tab === "summary" ? (
          <Card>
            <div className="text-lg font-semibold text-slate-950">Client GST summary</div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3">Month</th>
                    <th className="pb-3">Invoices</th>
                    <th className="pb-3">Taxable</th>
                    <th className="pb-3">CGST</th>
                    <th className="pb-3">SGST</th>
                    <th className="pb-3">IGST</th>
                    <th className="pb-3">Total GST</th>
                    <th className="pb-3">Invoice Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(
                    client.invoices.reduce<Record<string, { month: string; count: number; taxable: number; cgst: number; sgst: number; igst: number; totalGst: number; grand: number }>>((acc, invoice) => {
                      const month = invoice.invoiceDate ? invoice.invoiceDate.toLocaleString("en-IN", { month: "short", year: "numeric" }) : "Unspecified";
                      const row = acc[month] || { month, count: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalGst: 0, grand: 0 };
                      row.count += 1;
                      row.taxable += Number(invoice.taxableAmount || 0);
                      row.cgst += Number(invoice.cgst || 0);
                      row.sgst += Number(invoice.sgst || 0);
                      row.igst += Number(invoice.igst || 0);
                      row.totalGst += Number(invoice.totalGst || 0);
                      row.grand += Number(invoice.grandTotal || 0);
                      acc[month] = row;
                      return acc;
                    }, {})
                  ).map((row) => (
                    <tr key={row.month} className="border-t border-slate-100">
                      <td className="py-4 font-medium text-slate-950">{row.month}</td>
                      <td className="py-4 text-slate-600">{row.count}</td>
                      <td className="py-4 text-slate-600">{currency(row.taxable)}</td>
                      <td className="py-4 text-slate-600">{currency(row.cgst)}</td>
                      <td className="py-4 text-slate-600">{currency(row.sgst)}</td>
                      <td className="py-4 text-slate-600">{currency(row.igst)}</td>
                      <td className="py-4 text-slate-600">{currency(row.totalGst)}</td>
                      <td className="py-4 text-slate-600">{currency(row.grand)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {tab === "details" ? (
          <Card>
            <div className="text-lg font-semibold text-slate-950">Client details</div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><div className="text-sm text-slate-400">Business Name</div><div className="mt-1 font-medium">{client.businessName}</div></div>
              <div><div className="text-sm text-slate-400">Business Type</div><div className="mt-1 font-medium">{client.businessType || "—"}</div></div>
              <div><div className="text-sm text-slate-400">City</div><div className="mt-1 font-medium">{client.city || "—"}</div></div>
              <div><div className="text-sm text-slate-400">State</div><div className="mt-1 font-medium">{client.state || "—"}</div></div>
              <div><div className="text-sm text-slate-400">Pincode</div><div className="mt-1 font-medium">{client.pincode || "—"}</div></div>
              <div><div className="text-sm text-slate-400">Created</div><div className="mt-1 font-medium">{formatDate(client.createdAt)}</div></div>
            </div>
          </Card>
        ) : null}

        {tab === "invoices" ? (
          <Card>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-950">Invoices</div>
              <Link href={`/exports?clientId=${client.id}`} className="text-sm font-semibold text-brand-600">Export invoices</Link>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3">File</th>
                    <th className="pb-3">Invoice #</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">GST</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {client.invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t border-slate-100">
                      <td className="py-4 font-medium text-slate-950">
                        <Link href={`/invoices/${invoice.id}`}>{invoice.fileName}</Link>
                      </td>
                      <td className="py-4 text-slate-600">{invoice.invoiceNumber || "—"}</td>
                      <td className="py-4 text-slate-600">{invoice.invoiceType}</td>
                      <td className="py-4 text-slate-600">{invoice.vendorName || "—"}</td>
                      <td className="py-4 text-slate-600">{formatDate(invoice.invoiceDate)}</td>
                      <td className="py-4 text-slate-600">{currency(Number(invoice.totalGst || 0))}</td>
                      <td className="py-4 text-slate-600">{currency(Number(invoice.grandTotal || 0))}</td>
                      <td className="py-4"><Badge value={invoice.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}
      </div>
    );
  } catch {
    notFound();
  }
}
