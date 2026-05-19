import { GoogleGenAI, Type } from "@google/genai";
import pdfParse from "pdf-parse";
import { invoiceExtractionSchema, extractionPrompt, type InvoiceExtractionResult } from "@/lib/extraction/schema";

const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return new GoogleGenAI({ apiKey });
}

function buildSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      vendor_name: { type: Type.STRING, nullable: true },
      buyer_name: { type: Type.STRING, nullable: true },
      supplier_gst_number: { type: Type.STRING, nullable: true },
      buyer_gst_number: { type: Type.STRING, nullable: true },
      invoice_number: { type: Type.STRING, nullable: true },
      invoice_date: { type: Type.STRING, nullable: true },
      due_date: { type: Type.STRING, nullable: true },
      hsn_code: { type: Type.STRING, nullable: true },
      item_description: { type: Type.STRING, nullable: true },
      quantity: { type: Type.NUMBER, nullable: true },
      unit_price: { type: Type.NUMBER, nullable: true },
      taxable_amount: { type: Type.NUMBER, nullable: true },
      cgst: { type: Type.NUMBER, nullable: true },
      sgst: { type: Type.NUMBER, nullable: true },
      igst: { type: Type.NUMBER, nullable: true },
      total_gst: { type: Type.NUMBER, nullable: true },
      round_off: { type: Type.NUMBER, nullable: true },
      grand_total: { type: Type.NUMBER, nullable: true },
      place_of_supply: { type: Type.STRING, nullable: true },
      reverse_charge: { type: Type.BOOLEAN, nullable: true },
      vehicle_number: { type: Type.STRING, nullable: true },
      lr_number: { type: Type.STRING, nullable: true },
      eway_bill_number: { type: Type.STRING, nullable: true },
      payment_terms: { type: Type.STRING, nullable: true },
      bank_details: { type: Type.STRING, nullable: true },
      confidence: {
        type: Type.OBJECT,
        additionalProperties: { type: Type.NUMBER }
      },
      raw_extracted_text: { type: Type.STRING, nullable: true }
    },
    required: [
      "vendor_name",
      "buyer_name",
      "supplier_gst_number",
      "buyer_gst_number",
      "invoice_number",
      "invoice_date",
      "due_date",
      "hsn_code",
      "item_description",
      "quantity",
      "unit_price",
      "taxable_amount",
      "cgst",
      "sgst",
      "igst",
      "total_gst",
      "round_off",
      "grand_total",
      "place_of_supply",
      "reverse_charge",
      "vehicle_number",
      "lr_number",
      "eway_bill_number",
      "payment_terms",
      "bank_details",
      "confidence",
      "raw_extracted_text"
    ]
  };
}

export async function extractTextFromPdf(buffer: Buffer) {
  const parsed = await pdfParse(buffer);
  return parsed.text?.trim() || "";
}

export async function extractInvoiceWithGemini(params: { pdfBuffer: Buffer; fallbackText?: string }) {
  const client = getClient();
  const pdfBase64 = params.pdfBuffer.toString("base64");

  const response = await client.models.generateContent({
    model,
    config: {
      responseMimeType: "application/json",
      responseSchema: buildSchema()
    },
    contents: [
      {
        role: "user",
        parts: [
          { text: extractionPrompt },
          ...(params.fallbackText
            ? [{ text: `Direct PDF text extraction:\n${params.fallbackText.slice(0, 120000)}` }]
            : []),
          {
            inlineData: {
              data: pdfBase64,
              mimeType: "application/pdf"
            }
          }
        ]
      }
    ]
  });

  const raw = response.text || "{}";
  return invoiceExtractionSchema.parse(JSON.parse(raw)) satisfies InvoiceExtractionResult;
}
