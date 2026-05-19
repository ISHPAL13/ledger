import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function ExportsPage() {
  const user = await requireUser();
  const [logs, clients] = await Promise.all([
    prisma.exportLog.findMany({
      where: { firmId: user.firmId },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.client.findMany({
      where: { firmId: user.firmId, status: "ACTIVE" },
      select: { id: true, businessName: true },
      orderBy: { businessName: "asc" }
    })
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <div className="text-3xl font-bold text-slate-950">Excel Downloads</div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Choose a client first, then download that client&apos;s invoices or GST-ready summary for a specific month or date range.
        </p>

        <div className="mt-6 space-y-5">
          <form action="/api/exports" method="get" className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-lg font-semibold text-slate-950">Client invoice export</div>
            <p className="mt-1 text-sm text-slate-500">Download one client&apos;s invoice data in Excel, optionally filtered by month, type, or status.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Client</label>
                <Select name="clientId" required defaultValue="">
                  <option value="" disabled>
                    Select client
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.businessName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Month</label>
                <Select name="month" defaultValue="">
                  <option value="">All months</option>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {new Date(2026, index, 1).toLocaleString("en-IN", { month: "long" })}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Year</label>
                <Select name="year" defaultValue={new Date().getFullYear()}>
                  {[2024, 2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Invoice type</label>
                <Select name="invoiceType" defaultValue="ALL">
                  <option value="ALL">All invoice types</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="SALES">Sales</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Status</label>
                <Select name="status" defaultValue="ALL">
                  <option value="ALL">All statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING_REVIEW">Pending review</option>
                  <option value="FAILED">Failed</option>
                </Select>
              </div>
            </div>

            <input type="hidden" name="mode" value="client-invoices" />
            <button className="mt-5 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
              Download Client Excel
            </button>
          </form>

          <form action="/api/exports" method="get" className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="text-lg font-semibold text-slate-950">Client GST summary</div>
            <p className="mt-1 text-sm text-slate-500">Download month-wise GST summary for one client, ready for CA review and filing packs.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Client</label>
                <Select name="clientId" required defaultValue="">
                  <option value="" disabled>
                    Select client
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.businessName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Month</label>
                <Select name="month" defaultValue="">
                  <option value="">All months</option>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      {new Date(2026, index, 1).toLocaleString("en-IN", { month: "long" })}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Year</label>
                <Select name="year" defaultValue={new Date().getFullYear()}>
                  {[2024, 2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <input type="hidden" name="mode" value="client-gst-summary" />
            <button className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
              Download GST Summary
            </button>
          </form>

          <form action="/api/exports" method="get" className="rounded-[28px] border border-slate-200 bg-white p-5">
            <div className="text-lg font-semibold text-slate-950">Firm-wide download</div>
            <p className="mt-1 text-sm text-slate-500">Use this only when you want one workbook across all clients.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">From date</label>
                <Input type="date" name="from" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">To date</label>
                <Input type="date" name="to" />
              </div>
            </div>
            <input type="hidden" name="mode" value="all-invoices" />
            <button className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700">
              Download All Clients
            </button>
          </form>
        </div>
      </Card>

      <Card>
        <div className="text-2xl font-bold text-slate-950">Recent download activity</div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-3">File name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-slate-500">
                    No export history yet. Download your first GST-ready Excel file.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100">
                    <td className="py-4 font-medium text-slate-950">{log.fileName}</td>
                    <td className="py-4 text-slate-600">{log.exportType.replaceAll("_", " ").toLowerCase()}</td>
                    <td className="py-4 text-slate-600">{new Date(log.createdAt).toLocaleString("en-IN")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
