import { readFile } from "fs/promises";
import path from "path";
import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/db/prisma";
import { extractInvoiceWithGemini, extractTextFromPdf } from "@/lib/extraction/gemini";

function getMimeType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      throw new Error("Unsupported invoice file type");
  }
}

function toDecimal(value?: number | null) {
  return value === null || value === undefined ? null : new Decimal(value);
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function processInvoiceById(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId }
  });

  if (!invoice) throw new Error("Invoice not found");

  const absolutePath = path.join(process.cwd(), "public", invoice.fileUrl.replace(/^\//, ""));
  const buffer = await readFile(absolutePath);
  const mimeType = getMimeType(invoice.fileName || invoice.fileUrl);
  const extractedText = mimeType === "application/pdf" ? await extractTextFromPdf(buffer) : "";
  const extraction = await extractInvoiceWithGemini({
    buffer,
    mimeType,
    fallbackText: extractedText
  });

  const confidenceValues = Object.values(extraction.confidence || {});
  const avgConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
      : 0;

  const firm = await prisma.firm.findUnique({
    where: { id: invoice.firmId },
    select: { lowConfidenceThreshold: true, autoApproveHighConfidence: true }
  });

  const status =
    firm?.autoApproveHighConfidence && avgConfidence >= (firm.lowConfidenceThreshold || 0.5)
      ? "COMPLETED"
      : "PENDING_REVIEW";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      vendorName: extraction.vendor_name,
      buyerName: extraction.buyer_name,
      supplierGstNumber: extraction.supplier_gst_number,
      buyerGstNumber: extraction.buyer_gst_number,
      invoiceNumber: extraction.invoice_number,
      invoiceDate: parseDate(extraction.invoice_date),
      dueDate: parseDate(extraction.due_date),
      hsnCode: extraction.hsn_code,
      itemDescription: extraction.item_description,
      quantity: toDecimal(extraction.quantity),
      unitPrice: toDecimal(extraction.unit_price),
      taxableAmount: toDecimal(extraction.taxable_amount),
      cgst: toDecimal(extraction.cgst),
      sgst: toDecimal(extraction.sgst),
      igst: toDecimal(extraction.igst),
      totalGst: toDecimal(extraction.total_gst),
      roundOff: toDecimal(extraction.round_off),
      grandTotal: toDecimal(extraction.grand_total),
      placeOfSupply: extraction.place_of_supply,
      reverseCharge: extraction.reverse_charge,
      vehicleNumber: extraction.vehicle_number,
      lrNumber: extraction.lr_number,
      ewayBillNumber: extraction.eway_bill_number,
      paymentTerms: extraction.payment_terms,
      bankDetails: extraction.bank_details,
      confidenceJson: extraction.confidence,
      rawExtractedText: extraction.raw_extracted_text || extractedText,
      extractionError: null,
      processingLogs: {
        avgConfidence,
        extractedAt: new Date().toISOString(),
        usedDirectText: Boolean(extractedText)
      }
    }
  });
}

export async function markInvoiceFailed(invoiceId: string, error: unknown) {
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: "FAILED",
      extractionError: error instanceof Error ? error.message : "Unknown extraction failure",
      processingLogs: {
        failedAt: new Date().toISOString()
      }
    }
  });
}
