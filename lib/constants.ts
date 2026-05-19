export const APP_NAME = "Talos Ledger";
export const APP_TAGLINE = "AI-powered GST invoice automation for CA firms.";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Clients" },
  { href: "/upload", label: "Upload" },
  { href: "/invoices", label: "Invoices" },
  { href: "/reports", label: "GST Reports" },
  { href: "/exports", label: "Downloads" },
  { href: "/settings", label: "Settings" }
];

export const INVOICE_TYPE_OPTIONS = [
  { value: "PURCHASE", label: "Purchase Invoice" },
  { value: "SALES", label: "Sales Invoice" },
  { value: "EXPENSE", label: "Expense Bill" },
  { value: "OTHER", label: "Other" }
] as const;

export const CLIENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" }
] as const;

export const INVOICE_STATUS_OPTIONS = [
  { value: "PROCESSING", label: "Processing" },
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" }
] as const;

export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];
