"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { invoiceReviewSchema } from "@/lib/validators";
import { parseInputDate } from "@/lib/utils";

const decimal = (value?: string) => (value ? new Decimal(value) : null);

export async function saveInvoiceReviewAction(invoiceId: string, formData: FormData) {
  const user = await requireUser();
  const payload = invoiceReviewSchema.parse(Object.fromEntries(formData));

  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, firmId: user.firmId },
    select: { id: true }
  });
  if (!existing) throw new Error("Invoice not found");

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      clientId: payload.clientId || null,
      invoiceType: payload.invoiceType,
      vendorName: payload.vendorName,
      buyerName: payload.buyerName,
      supplierGstNumber: payload.supplierGstNumber,
      buyerGstNumber: payload.buyerGstNumber,
      invoiceNumber: payload.invoiceNumber,
      invoiceDate: parseInputDate(payload.invoiceDate),
      dueDate: parseInputDate(payload.dueDate),
      hsnCode: payload.hsnCode,
      itemDescription: payload.itemDescription,
      quantity: decimal(payload.quantity),
      unitPrice: decimal(payload.unitPrice),
      taxableAmount: decimal(payload.taxableAmount),
      cgst: decimal(payload.cgst),
      sgst: decimal(payload.sgst),
      igst: decimal(payload.igst),
      totalGst: decimal(payload.totalGst),
      roundOff: decimal(payload.roundOff),
      grandTotal: decimal(payload.grandTotal),
      placeOfSupply: payload.placeOfSupply,
      reverseCharge: payload.reverseCharge ? payload.reverseCharge === "true" : null,
      vehicleNumber: payload.vehicleNumber,
      lrNumber: payload.lrNumber,
      ewayBillNumber: payload.ewayBillNumber,
      paymentTerms: payload.paymentTerms,
      bankDetails: payload.bankDetails,
      notes: payload.notes,
      status: payload.status
    }
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInvoiceAction(invoiceId: string) {
  const user = await requireUser();

  const existing = await prisma.invoice.findFirst({
    where: { id: invoiceId, firmId: user.firmId },
    select: { id: true }
  });
  if (!existing) throw new Error("Invoice not found");

  await prisma.invoice.delete({
    where: { id: invoiceId }
  });

  revalidatePath("/invoices");
  redirect("/invoices");
}
