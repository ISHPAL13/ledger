import * as XLSX from "xlsx";
import { ExportType } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { getInvoices, getReportData } from "@/lib/data";
import { prisma } from "@/lib/db/prisma";
import { endOfMonth, format, startOfMonth } from "date-fns";

function getDateRange(url: URL) {
  const month = url.searchParams.get("month");
  const year = url.searchParams.get("year");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (from || to) {
    return {
      from: from || undefined,
      to: to || undefined
    };
  }

  if (month && year) {
    const date = new Date(Number(year), Number(month) - 1, 1);
    return {
      from: format(startOfMonth(date), "yyyy-MM-dd"),
      to: format(endOfMonth(date), "yyyy-MM-dd")
    };
  }

  return {};
}

function buildFileName(prefix: string, clientName?: string | null) {
  const monthYear = format(new Date(), "MMM_yyyy").toUpperCase();
  const cleanClient = clientName
    ? clientName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")
    : null;
  return cleanClient ? `${cleanClient}_${prefix}_${monthYear}.xlsx` : `${prefix}_${monthYear}.xlsx`;
}

function excelBufferFromJson(name: string, rows: Record<string, unknown>[]) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "all-invoices";
  const dateRange = getDateRange(url);
  const clientId = url.searchParams.get("clientId") || "ALL";
  const client =
    clientId !== "ALL"
      ? await prisma.client.findFirst({
          where: { id: clientId, firmId: user.firmId },
          select: { businessName: true }
        })
      : null;

  if (mode === "gst-summary" || mode === "client-gst-summary") {
    const report = await getReportData(user.firmId, {
      clientId,
      from: dateRange.from,
      to: dateRange.to
    });

    const rows = report.invoices.map((invoice) => ({
      "Client name": invoice.client?.businessName || "Unassigned",
      "Client GST number": invoice.client?.gstNumber || "",
      "Invoice type": invoice.invoiceType,
      "Vendor name": invoice.vendorName || "",
      "Invoice number": invoice.invoiceNumber || "",
      "Invoice date": invoice.invoiceDate ? format(invoice.invoiceDate, "yyyy-MM-dd") : "",
      "HSN code": invoice.hsnCode || "",
      "Taxable amount": Number(invoice.taxableAmount || 0),
      CGST: Number(invoice.cgst || 0),
      SGST: Number(invoice.sgst || 0),
      IGST: Number(invoice.igst || 0),
      "Total GST": Number(invoice.totalGst || 0),
      "Grand total": Number(invoice.grandTotal || 0),
      Status: invoice.status
    }));

    const fileName = buildFileName("gst_summary", client?.businessName);
    await prisma.exportLog.create({
      data: {
        firmId: user.firmId,
        requestedBy: user.id,
        exportType: ExportType.GST_SUMMARY,
        fileName,
        filtersJson: Object.fromEntries(url.searchParams)
      }
    });

    return new Response(excelBufferFromJson("GST Summary", rows), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`
      }
    });
  }

  const invoices = await getInvoices(user.firmId, {
    clientId,
    status: url.searchParams.get("status") || (mode === "pending-review" ? "PENDING_REVIEW" : "ALL"),
    invoiceType:
      url.searchParams.get("invoiceType") ||
      (mode === "purchase" ? "PURCHASE" : mode === "sales" ? "SALES" : "ALL"),
    from: dateRange.from,
    to: dateRange.to
  });

  const rows = invoices.map((invoice) => ({
    "Client name": invoice.client?.businessName || "Unassigned",
    "Client GST number": invoice.client?.gstNumber || "",
    "Invoice type": invoice.invoiceType,
    "Vendor name": invoice.vendorName || "",
    "Invoice number": invoice.invoiceNumber || "",
    "Invoice date": invoice.invoiceDate ? format(invoice.invoiceDate, "yyyy-MM-dd") : "",
    "HSN code": invoice.hsnCode || "",
    "Taxable amount": Number(invoice.taxableAmount || 0),
    CGST: Number(invoice.cgst || 0),
    SGST: Number(invoice.sgst || 0),
    IGST: Number(invoice.igst || 0),
    "Total GST": Number(invoice.totalGst || 0),
    "Grand total": Number(invoice.grandTotal || 0),
    Status: invoice.status
  }));

  const fileName =
    mode === "client-invoices" || (client && clientId !== "ALL")
      ? buildFileName("invoice_export", client?.businessName)
      : buildFileName("talosledger_export");

  await prisma.exportLog.create({
    data: {
      firmId: user.firmId,
      requestedBy: user.id,
      exportType:
        mode === "pending-review"
          ? ExportType.PENDING_REVIEW
          : mode === "purchase"
            ? ExportType.PURCHASE
            : mode === "sales"
              ? ExportType.SALES
              : mode === "client-invoices"
                ? ExportType.CLIENT_WISE
              : ExportType.ALL_INVOICES,
      fileName,
      filtersJson: Object.fromEntries(url.searchParams)
    }
  });

  return new Response(excelBufferFromJson("Invoices", rows), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`
    }
  });
}
