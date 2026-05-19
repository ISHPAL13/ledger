import { z } from "zod";

export const invoiceExtractionSchema = z.object({
  vendor_name: z.string().nullable(),
  buyer_name: z.string().nullable(),
  supplier_gst_number: z.string().nullable(),
  buyer_gst_number: z.string().nullable(),
  invoice_number: z.string().nullable(),
  invoice_date: z.string().nullable(),
  due_date: z.string().nullable(),
  hsn_code: z.string().nullable(),
  item_description: z.string().nullable(),
  quantity: z.number().nullable(),
  unit_price: z.number().nullable(),
  taxable_amount: z.number().nullable(),
  cgst: z.number().nullable(),
  sgst: z.number().nullable(),
  igst: z.number().nullable(),
  total_gst: z.number().nullable(),
  round_off: z.number().nullable(),
  grand_total: z.number().nullable(),
  place_of_supply: z.string().nullable(),
  reverse_charge: z.boolean().nullable(),
  vehicle_number: z.string().nullable(),
  lr_number: z.string().nullable(),
  eway_bill_number: z.string().nullable(),
  payment_terms: z.string().nullable(),
  bank_details: z.string().nullable(),
  confidence: z.record(z.number().min(0).max(1)).default({}),
  raw_extracted_text: z.string().nullable().default(null)
});

export type InvoiceExtractionResult = z.infer<typeof invoiceExtractionSchema>;

export const extractionPrompt = `You are an expert Indian GST invoice extraction assistant.

Extract structured invoice data from the invoice text.

Rules:
- Return only valid JSON.
- Do not guess values.
- Preserve GST numbers exactly.
- Dates should be YYYY-MM-DD if possible.
- Amounts should be numeric.
- Identify CGST, SGST, IGST correctly.
- Add confidence score from 0 to 1 for every field.
- If field missing, return null.

Fields:
vendor_name, buyer_name, supplier_gst_number, buyer_gst_number, invoice_number, invoice_date, due_date, hsn_code, item_description, quantity, unit_price, taxable_amount, cgst, sgst, igst, total_gst, round_off, grand_total, place_of_supply, reverse_charge, vehicle_number, lr_number, eway_bill_number, payment_terms, bank_details.`;
