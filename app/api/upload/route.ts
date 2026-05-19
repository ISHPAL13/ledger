import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { processInvoiceById, markInvoiceFailed } from "@/lib/extraction/process-invoice";
import { saveInvoiceFile } from "@/lib/storage/local";

const allowedMimeTypes = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);
const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const formData = await request.formData();
  const clientId = String(formData.get("clientId") || "");
  const invoiceType = String(formData.get("invoiceType") || "PURCHASE");
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);
  const maxUploadSize = Number(process.env.MAX_UPLOAD_SIZE_MB || 20) * 1024 * 1024;

  if (!clientId) return Response.json({ error: "Client is required" }, { status: 400 });
  if (files.length === 0) return Response.json({ error: "At least one invoice file is required" }, { status: 400 });

  const createdInvoices = [];

  for (const file of files) {
    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    const hasAllowedMimeType = !file.type || allowedMimeTypes.has(file.type);

    if (!hasAllowedExtension || !hasAllowedMimeType) {
      return Response.json({ error: "Only PDF, PNG, JPG, JPEG, and WEBP files are supported" }, { status: 400 });
    }
    if (file.size > maxUploadSize) {
      return Response.json({ error: `Files must be under ${process.env.MAX_UPLOAD_SIZE_MB || 20}MB` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await saveInvoiceFile({
      buffer,
      firmId: user.firmId,
      clientId,
      fileName: file.name || `${randomUUID()}.pdf`
    });

    const invoice = await prisma.invoice.create({
      data: {
        firmId: user.firmId,
        clientId,
        fileName: file.name,
        fileUrl: stored.publicUrl,
        invoiceType: invoiceType as any,
        status: "PROCESSING"
      }
    });

    createdInvoices.push(invoice);

    void processInvoiceById(invoice.id).catch(async (error) => {
      await markInvoiceFailed(invoice.id, error);
    });
  }

  return Response.json({ ok: true, count: createdInvoices.length });
}
