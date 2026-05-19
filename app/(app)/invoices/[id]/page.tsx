import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteInvoiceAction, saveInvoiceReviewAction } from "@/lib/actions/invoices";
import { requireUser } from "@/lib/auth/session";
import { getInvoiceDetail } from "@/lib/data";
import { prisma } from "@/lib/db/prisma";
import { currency, percent, toInputDate } from "@/lib/utils";
import { isValidGst } from "@/lib/validators";

function confidenceFor(confidenceJson: unknown, field: string) {
  if (!confidenceJson || typeof confidenceJson !== "object") return null;
  const value = (confidenceJson as Record<string, number>)[field];
  return typeof value === "number" ? value : null;
}

function ConfidenceHint({ value }: { value: number | null }) {
  if (value === null) return null;
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${value < 0.5 ? "bg-red-100 text-red-700" : value < 0.75 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
      {percent(value)}
    </span>
  );
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const [invoice, clients, firm] = await Promise.all([
    getInvoiceDetail(user.firmId, id),
    prisma.client.findMany({ where: { firmId: user.firmId }, select: { id: true, businessName: true }, orderBy: { businessName: "asc" } }),
    prisma.firm.findUniqueOrThrow({ where: { id: user.firmId }, select: { lowConfidenceThreshold: true } })
  ]);

  const totalMismatch =
    Math.abs(Number(invoice.taxableAmount || 0) + Number(invoice.totalGst || 0) + Number(invoice.roundOff || 0) - Number(invoice.grandTotal || 0)) > 1;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="h-fit">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-950">PDF preview</div>
            <div className="mt-1 text-sm text-slate-500">{invoice.fileName}</div>
          </div>
          <Badge value={invoice.status} />
        </div>
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
          <iframe src={invoice.fileUrl} className="h-[900px] w-full bg-white" title={invoice.fileName} />
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-bold text-slate-950">Invoice review & approval</div>
              <div className="mt-2 text-sm text-slate-500">Review extracted fields, validate GST details, then approve for reporting and export.</div>
            </div>
            <div className="flex gap-2">
              <form action={`/api/invoices/${invoice.id}/retry`} method="post">
                <Button type="submit" variant="secondary">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retry extraction
                </Button>
              </form>
              <form action={deleteInvoiceAction.bind(null, invoice.id)}>
                <Button type="submit" variant="danger">
                  Delete invoice
                </Button>
              </form>
            </div>
          </div>

          {(totalMismatch || !isValidGst(invoice.supplierGstNumber) || !isValidGst(invoice.buyerGstNumber)) ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  {totalMismatch ? "Grand total does not match taxable amount + GST + round off. " : ""}
                  {!isValidGst(invoice.supplierGstNumber) ? "Supplier GST looks invalid. " : ""}
                  {!isValidGst(invoice.buyerGstNumber) ? "Buyer GST looks invalid." : ""}
                </div>
              </div>
            </div>
          ) : null}

          <form action={saveInvoiceReviewAction.bind(null, invoice.id)} className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Client</label>
                <Select name="clientId" defaultValue={invoice.clientId || ""}>
                  <option value="">Unassigned</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.businessName}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Invoice Type</label>
                <Select name="invoiceType" defaultValue={invoice.invoiceType}>
                  <option value="PURCHASE">Purchase Invoice</option>
                  <option value="SALES">Sales Invoice</option>
                  <option value="EXPENSE">Expense Bill</option>
                  <option value="OTHER">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["vendorName", "Vendor name", invoice.vendorName, "vendor_name"],
                ["buyerName", "Buyer name", invoice.buyerName, "buyer_name"],
                ["supplierGstNumber", "Supplier GST number", invoice.supplierGstNumber, "supplier_gst_number"],
                ["buyerGstNumber", "Buyer GST number", invoice.buyerGstNumber, "buyer_gst_number"],
                ["invoiceNumber", "Invoice number", invoice.invoiceNumber, "invoice_number"],
                ["hsnCode", "HSN / SAC code", invoice.hsnCode, "hsn_code"],
                ["vehicleNumber", "Vehicle number", invoice.vehicleNumber, "vehicle_number"],
                ["ewayBillNumber", "E-way bill number", invoice.ewayBillNumber, "eway_bill_number"]
              ].map(([name, label, defaultValue, key]) => {
                const score = confidenceFor(invoice.confidenceJson, String(key));
                return (
                  <div key={name}>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">{label}</label>
                      <ConfidenceHint value={score} />
                    </div>
                    <Input
                      name={String(name)}
                      defaultValue={(defaultValue as string) || ""}
                      className={score !== null && score < firm.lowConfidenceThreshold ? "border-red-300 bg-red-50/50" : ""}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Invoice date</label>
                <Input name="invoiceDate" type="date" defaultValue={toInputDate(invoice.invoiceDate)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Due date</label>
                <Input name="dueDate" type="date" defaultValue={toInputDate(invoice.dueDate)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["quantity", "Quantity", invoice.quantity?.toString()],
                ["unitPrice", "Unit price", invoice.unitPrice?.toString()],
                ["taxableAmount", "Taxable amount", invoice.taxableAmount?.toString()],
                ["cgst", "CGST", invoice.cgst?.toString()],
                ["sgst", "SGST", invoice.sgst?.toString()],
                ["igst", "IGST", invoice.igst?.toString()],
                ["totalGst", "Total GST", invoice.totalGst?.toString()],
                ["roundOff", "Round off", invoice.roundOff?.toString()],
                ["grandTotal", "Grand total", invoice.grandTotal?.toString()]
              ].map(([name, label, defaultValue]) => (
                <div key={name}>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
                  <Input name={name} defaultValue={defaultValue || ""} />
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Place of supply</label>
                <Input name="placeOfSupply" defaultValue={invoice.placeOfSupply || ""} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Reverse charge</label>
                <Select name="reverseCharge" defaultValue={invoice.reverseCharge === null ? "" : invoice.reverseCharge ? "true" : "false"}>
                  <option value="">Unknown</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Item description</label>
              <Textarea name="itemDescription" defaultValue={invoice.itemDescription || ""} className="min-h-24" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Payment terms</label>
                <Textarea name="paymentTerms" defaultValue={invoice.paymentTerms || ""} className="min-h-20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Bank details</label>
                <Textarea name="bankDetails" defaultValue={invoice.bankDetails || ""} className="min-h-20" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Notes</label>
              <Textarea name="notes" defaultValue={invoice.notes || ""} placeholder="Review notes, discrepancy comments, or filing remarks" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-700">Invoice total</div>
                <div className="mt-1 text-xl font-bold text-slate-950">{currency(Number(invoice.grandTotal || 0))}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select name="status" defaultValue={invoice.status === "FAILED" ? "PENDING_REVIEW" : invoice.status}>
                  <option value="PENDING_REVIEW">Mark Pending Review</option>
                  <option value="COMPLETED">Approve Invoice</option>
                  <option value="FAILED">Mark Failed</option>
                </Select>
                <Button type="submit">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Review
                </Button>
              </div>
            </div>
          </form>
        </Card>

        <Card>
          <div className="text-lg font-semibold text-slate-950">Extraction details</div>
          <div className="mt-4 grid gap-4 text-sm text-slate-600 md:grid-cols-2">
            <div>
              <div className="text-slate-400">Raw extracted text</div>
              <div className="mt-1 line-clamp-6 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs">{invoice.rawExtractedText || "No raw text stored yet."}</div>
            </div>
            <div>
              <div className="text-slate-400">Confidence JSON</div>
              <pre className="mt-1 max-h-64 overflow-auto rounded-2xl bg-slate-50 p-4 text-xs">{JSON.stringify(invoice.confidenceJson || {}, null, 2)}</pre>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
