import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { markInvoiceFailed, processInvoiceById } from "@/lib/extraction/process-invoice";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.invoice.findFirst({
    where: { id, firmId: user.firmId },
    select: { id: true }
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.invoice.update({
    where: { id },
    data: { status: "PROCESSING", extractionError: null }
  });

  try {
    await processInvoiceById(id);
  } catch (error) {
    await markInvoiceFailed(id, error);
  }

  return Response.redirect(new URL(`/invoices/${id}`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"), 303);
}
