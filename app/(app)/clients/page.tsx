import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AddClientModal } from "@/components/clients/add-client-modal";
import { CLIENT_STATUS_OPTIONS, INDIA_STATES } from "@/lib/constants";
import { requireUser } from "@/lib/auth/session";
import { getClients } from "@/lib/data";
import { currency, formatDate } from "@/lib/utils";

export default async function ClientsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const clients = await getClients(user.firmId, {
    q: String(params.q || ""),
    status: String(params.status || "ALL"),
    state: String(params.state || "ALL"),
    sort: String(params.sort || "latest")
  });

  return (
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-950">Clients</h2>
          <p className="mt-2 text-sm text-slate-500">
            {clients.filter((client) => client.status === "ACTIVE").length} active · {clients.filter((client) => client.status === "ARCHIVED").length} archived
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/upload" className="text-sm font-semibold text-brand-600">
            Go to uploads
          </Link>
          <AddClientModal />
        </div>
      </div>

      <form className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
        <Input name="q" defaultValue={String(params.q || "")} placeholder="Search by client name, GST number, or contact" />
        <Select name="status" defaultValue={String(params.status || "ALL")}>
          <option value="ALL">All status</option>
          {CLIENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select name="state" defaultValue={String(params.state || "ALL")}>
          <option value="ALL">All states</option>
          {INDIA_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </Select>
        <Select name="sort" defaultValue={String(params.sort || "latest")}>
          <option value="latest">Latest activity</option>
          <option value="invoiceValue">Invoice value</option>
        </Select>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-3">Business name</th>
              <th className="pb-3">GST number</th>
              <th className="pb-3">Contact</th>
              <th className="pb-3">Phone</th>
              <th className="pb-3">City / State</th>
              <th className="pb-3">Total invoices</th>
              <th className="pb-3">Invoice value</th>
              <th className="pb-3">Pending review</th>
              <th className="pb-3">Last upload</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-20 text-center text-slate-500">
                  No clients added yet. Add your first client to start processing invoices.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-t border-slate-100">
                  <td className="py-4 font-medium text-slate-950">
                    <Link href={`/clients/${client.id}`} className="hover:text-brand-600">
                      {client.businessName}
                    </Link>
                  </td>
                  <td className="py-4 text-slate-600">{client.gstNumber || "—"}</td>
                  <td className="py-4 text-slate-600">{client.contactPersonName || "—"}</td>
                  <td className="py-4 text-slate-600">{client.phone || "—"}</td>
                  <td className="py-4 text-slate-600">{[client.city, client.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="py-4 text-slate-600">{client.totalInvoices}</td>
                  <td className="py-4 text-slate-600">{currency(client.totalInvoiceValue)}</td>
                  <td className="py-4 text-slate-600">{client.pendingReviewCount}</td>
                  <td className="py-4 text-slate-600">{formatDate(client.lastUploadDate)}</td>
                  <td className="py-4">
                    <Badge value={client.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
