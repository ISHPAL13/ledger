import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const ids = searchParams
    .getAll("id")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return Response.json({ error: "At least one invoice id is required" }, { status: 400 });
  }

  const invoices = await prisma.invoice.findMany({
    where: {
      firmId: user.firmId,
      id: { in: ids }
    },
    select: {
      id: true,
      status: true
    }
  });

  const statusById = Object.fromEntries(invoices.map((invoice) => [invoice.id, invoice.status]));
  const processedCount = invoices.filter((invoice) => invoice.status !== "PROCESSING").length;
  const failedCount = invoices.filter((invoice) => invoice.status === "FAILED").length;
  const completedCount = invoices.filter((invoice) => invoice.status === "COMPLETED").length;
  const pendingReviewCount = invoices.filter((invoice) => invoice.status === "PENDING_REVIEW").length;
  const done = processedCount === ids.length;

  return Response.json({
    total: ids.length,
    processedCount,
    failedCount,
    completedCount,
    pendingReviewCount,
    done,
    statuses: statusById
  });
}
