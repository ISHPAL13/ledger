import { z } from "zod";

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const phoneRegex = /^(?:\+91)?[6-9]\d{9}$/;

const optionalTrimmed = () =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined);

export const signupSchema = z.object({
  firmName: z.string().trim().min(2),
  ownerName: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  phone: optionalTrimmed(),
  gstNumber: optionalTrimmed().refine((value) => !value || gstRegex.test(value), {
    message: "Enter a valid GST number"
  }),
  panNumber: optionalTrimmed().refine((value) => !value || panRegex.test(value), {
    message: "Enter a valid PAN number"
  })
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

export const clientSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required"),
  contactPersonName: optionalTrimmed(),
  email: optionalTrimmed().refine((value) => !value || z.string().email().safeParse(value).success, {
    message: "Enter a valid email"
  }),
  phone: optionalTrimmed().refine((value) => !value || phoneRegex.test(value.replace(/\s+/g, "")), {
    message: "Enter a valid Indian phone number"
  }),
  gstNumber: optionalTrimmed().refine((value) => !value || gstRegex.test(value), {
    message: "Enter a valid GST number"
  }),
  panNumber: optionalTrimmed().refine((value) => !value || panRegex.test(value), {
    message: "Enter a valid PAN number"
  }),
  businessAddress: optionalTrimmed(),
  city: optionalTrimmed(),
  state: optionalTrimmed(),
  pincode: optionalTrimmed(),
  businessType: optionalTrimmed(),
  notes: optionalTrimmed(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE")
});

export const invoiceReviewSchema = z.object({
  clientId: z.string().optional(),
  invoiceType: z.enum(["PURCHASE", "SALES", "EXPENSE", "OTHER"]),
  vendorName: optionalTrimmed(),
  buyerName: optionalTrimmed(),
  supplierGstNumber: optionalTrimmed(),
  buyerGstNumber: optionalTrimmed(),
  invoiceNumber: optionalTrimmed(),
  invoiceDate: optionalTrimmed(),
  dueDate: optionalTrimmed(),
  hsnCode: optionalTrimmed(),
  itemDescription: optionalTrimmed(),
  quantity: optionalTrimmed(),
  unitPrice: optionalTrimmed(),
  taxableAmount: optionalTrimmed(),
  cgst: optionalTrimmed(),
  sgst: optionalTrimmed(),
  igst: optionalTrimmed(),
  totalGst: optionalTrimmed(),
  roundOff: optionalTrimmed(),
  grandTotal: optionalTrimmed(),
  placeOfSupply: optionalTrimmed(),
  reverseCharge: z.enum(["true", "false"]).optional(),
  vehicleNumber: optionalTrimmed(),
  lrNumber: optionalTrimmed(),
  ewayBillNumber: optionalTrimmed(),
  paymentTerms: optionalTrimmed(),
  bankDetails: optionalTrimmed(),
  notes: optionalTrimmed(),
  status: z.enum(["PENDING_REVIEW", "COMPLETED", "FAILED"]).default("PENDING_REVIEW")
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2),
  ownerName: z.string().trim().min(2),
  phone: optionalTrimmed(),
  email: z.string().trim().email(),
  address: optionalTrimmed(),
  gstNumber: optionalTrimmed(),
  panNumber: optionalTrimmed(),
  defaultFinancialYear: z.string().trim().min(2),
  defaultExportFormat: z.enum(["xlsx", "csv"]),
  lowConfidenceThreshold: z.coerce.number().min(0).max(1),
  autoApproveHighConfidenceInvoices: z.coerce.boolean()
});

export function isValidGst(value?: string | null) {
  return value ? gstRegex.test(value) : true;
}
