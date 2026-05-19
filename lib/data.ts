import { InvoiceStatus, InvoiceType, Prisma } from "@prisma/client";
import { startOfMonth, subMonths, format } from "date-fns";
import { prisma } from "@/lib/db/prisma";

export async function getFirmScopedShell(firmId: string) {
  const firm = await prisma.firm.findUniqueOrThrow({
    where: { id: firmId },
    include: {
      users: {
        select: { id: true, fullName: true, email: true, role: true, isActive: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });
  return firm;
}

export async function getDashboardData(firmId: string) {
  const [clients, invoices] = await Promise.all([
    prisma.client.findMany({
      where: { firmId },
      include: {
        invoices: {
          select: {
            id: true,
            status: true,
            grandTotal: true,
            createdAt: true
          }
        }
      }
    }),
    prisma.invoice.findMany({
      where: { firmId },
      include: {
        client: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const monthStart = startOfMonth(new Date());
  const totals = invoices.reduce(
    (acc, invoice) => {
      const taxable = Number(invoice.taxableAmount || 0);
      const gst = Number(invoice.totalGst || 0);
      const grand = Number(invoice.grandTotal || 0);
      acc.taxableAmount += taxable;
      acc.totalGst += gst;
      acc.invoiceValue += grand;
      if (invoice.createdAt >= monthStart) acc.invoicesThisMonth += 1;
      if (invoice.status === "PENDING_REVIEW") acc.pending += 1;
      if (invoice.status === "COMPLETED") acc.completed += 1;
      if (invoice.status === "FAILED") acc.failed += 1;
      return acc;
    },
    {
      taxableAmount: 0,
      totalGst: 0,
      invoiceValue: 0,
      invoicesThisMonth: 0,
      pending: 0,
      completed: 0,
      failed: 0
    }
  );

  const topClientsByCount = clients
    .map((client) => ({
      id: client.id,
      businessName: client.businessName,
      count: client.invoices.length,
      value: client.invoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0),
      pending: client.invoices.filter((invoice) => invoice.status === "PENDING_REVIEW").length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topClientsByValue = [...topClientsByCount].sort((a, b) => b.value - a.value).slice(0, 5);

  const recentUploads = invoices.slice(0, 8);
  const failedExtractions = invoices.filter((invoice) => invoice.status === "FAILED").slice(0, 5);

  const chartData = Array.from({ length: 6 }, (_, index) => {
    const month = subMonths(new Date(), 5 - index);
    const key = format(month, "MMM yy");
    const monthInvoices = invoices.filter(
      (invoice) =>
        invoice.invoiceDate &&
        format(invoice.invoiceDate, "MMM yy") === key &&
        invoice.status !== "FAILED"
    );
    return {
      month: key,
      invoiceValue: monthInvoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0),
      gstValue: monthInvoices.reduce((sum, invoice) => sum + Number(invoice.totalGst || 0), 0)
    };
  });

  return {
    summary: {
      totalClients: clients.length,
      activeClients: clients.filter((client) => client.status === "ACTIVE").length,
      totalInvoices: invoices.length,
      ...totals
    },
    recentUploads,
    topClientsByCount,
    topClientsByValue,
    failedExtractions,
    chartData
  };
}

export async function getClients(firmId: string, filters?: {
  q?: string;
  status?: string;
  state?: string;
  sort?: string;
}) {
  const where: Prisma.ClientWhereInput = {
    firmId,
    ...(filters?.status && filters.status !== "ALL" ? { status: filters.status as any } : {}),
    ...(filters?.state && filters.state !== "ALL" ? { state: filters.state } : {}),
    ...(filters?.q
      ? {
          OR: [
            { businessName: { contains: filters.q, mode: "insensitive" } },
            { gstNumber: { contains: filters.q, mode: "insensitive" } },
            { contactPersonName: { contains: filters.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const clients = await prisma.client.findMany({
    where,
    include: {
      invoices: {
        select: {
          id: true,
          status: true,
          grandTotal: true,
          createdAt: true
        }
      }
    }
  });

  const rows = clients.map((client) => ({
    ...client,
    totalInvoices: client.invoices.length,
    totalInvoiceValue: client.invoices.reduce((sum, invoice) => sum + Number(invoice.grandTotal || 0), 0),
    pendingReviewCount: client.invoices.filter((invoice) => invoice.status === "PENDING_REVIEW").length,
    lastUploadDate: client.invoices.sort((a, b) => +b.createdAt - +a.createdAt)[0]?.createdAt || null
  }));

  if (filters?.sort === "invoiceValue") {
    rows.sort((a, b) => b.totalInvoiceValue - a.totalInvoiceValue);
  } else {
    rows.sort(
      (a, b) => +(b.lastUploadDate || new Date(0)) - +(a.lastUploadDate || new Date(0))
    );
  }

  return rows;
}

export async function getClientProfile(firmId: string, clientId: string) {
  const client = await prisma.client.findFirstOrThrow({
    where: { id: clientId, firmId },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  const totals = client.invoices.reduce(
    (acc, invoice) => {
      acc.taxableAmount += Number(invoice.taxableAmount || 0);
      acc.cgst += Number(invoice.cgst || 0);
      acc.sgst += Number(invoice.sgst || 0);
      acc.igst += Number(invoice.igst || 0);
      acc.totalGst += Number(invoice.totalGst || 0);
      acc.invoiceValue += Number(invoice.grandTotal || 0);
      if (invoice.status === "PENDING_REVIEW") acc.pending += 1;
      if (invoice.status === "COMPLETED") acc.completed += 1;
      if (invoice.status === "FAILED") acc.failed += 1;
      return acc;
    },
    { taxableAmount: 0, cgst: 0, sgst: 0, igst: 0, totalGst: 0, invoiceValue: 0, pending: 0, completed: 0, failed: 0 }
  );

  return { client, totals };
}

export async function getInvoices(firmId: string, filters?: {
  q?: string;
  clientId?: string;
  invoiceType?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  const where: Prisma.InvoiceWhereInput = {
    firmId,
    ...(filters?.clientId && filters.clientId !== "ALL" ? { clientId: filters.clientId } : {}),
    ...(filters?.invoiceType && filters.invoiceType !== "ALL" ? { invoiceType: filters.invoiceType as InvoiceType } : {}),
    ...(filters?.status && filters.status !== "ALL" ? { status: filters.status as InvoiceStatus } : {}),
    ...(filters?.from || filters?.to
      ? {
          invoiceDate: {
            ...(filters.from ? { gte: new Date(filters.from) } : {}),
            ...(filters.to ? { lte: new Date(filters.to) } : {})
          }
        }
      : {}),
    ...(filters?.q
      ? {
          OR: [
            { vendorName: { contains: filters.q, mode: "insensitive" } },
            { invoiceNumber: { contains: filters.q, mode: "insensitive" } },
            { supplierGstNumber: { contains: filters.q, mode: "insensitive" } },
            { fileName: { contains: filters.q, mode: "insensitive" } },
            { client: { businessName: { contains: filters.q, mode: "insensitive" } } }
          ]
        }
      : {})
  };

  return prisma.invoice.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getInvoiceDetail(firmId: string, invoiceId: string) {
  return prisma.invoice.findFirstOrThrow({
    where: { id: invoiceId, firmId },
    include: {
      client: true
    }
  });
}

export async function getReportData(firmId: string, filters?: {
  clientId?: string;
  invoiceType?: string;
  from?: string;
  to?: string;
  status?: string;
}) {
  const invoices = await getInvoices(firmId, {
    clientId: filters?.clientId,
    invoiceType: filters?.invoiceType,
    from: filters?.from,
    to: filters?.to,
    status: filters?.status || "COMPLETED"
  });

  const completed = invoices.filter((invoice) => invoice.status === "COMPLETED");

  const totals = completed.reduce(
    (acc, invoice) => {
      acc.taxable += Number(invoice.taxableAmount || 0);
      acc.cgst += Number(invoice.cgst || 0);
      acc.sgst += Number(invoice.sgst || 0);
      acc.igst += Number(invoice.igst || 0);
      acc.totalGst += Number(invoice.totalGst || 0);
      acc.invoiceValue += Number(invoice.grandTotal || 0);
      return acc;
    },
    { taxable: 0, cgst: 0, sgst: 0, igst: 0, totalGst: 0, invoiceValue: 0 }
  );

  const summarize = (key: (invoice: typeof completed[number]) => string) =>
    Object.values(
      completed.reduce<Record<string, {
        label: string;
        invoices: number;
        taxable: number;
        cgst: number;
        sgst: number;
        igst: number;
        totalGst: number;
        invoiceValue: number;
      }>>((acc, invoice) => {
        const label = key(invoice) || "Unspecified";
        const current = acc[label] || {
          label,
          invoices: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalGst: 0,
          invoiceValue: 0
        };
        current.invoices += 1;
        current.taxable += Number(invoice.taxableAmount || 0);
        current.cgst += Number(invoice.cgst || 0);
        current.sgst += Number(invoice.sgst || 0);
        current.igst += Number(invoice.igst || 0);
        current.totalGst += Number(invoice.totalGst || 0);
        current.invoiceValue += Number(invoice.grandTotal || 0);
        acc[label] = current;
        return acc;
      }, {})
    );

  return {
    invoices: completed,
    totals,
    invoiceTypeSummary: summarize((invoice) => invoice.invoiceType),
    clientSummary: summarize((invoice) => invoice.client?.businessName || "Unassigned"),
    vendorSummary: summarize((invoice) => invoice.vendorName || "Unspecified"),
    hsnSummary: summarize((invoice) => invoice.hsnCode || "Unspecified"),
    monthSummary: summarize((invoice) => (invoice.invoiceDate ? format(invoice.invoiceDate, "MMM yyyy") : "Unspecified"))
  };
}
