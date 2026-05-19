import { Card } from "@/components/ui/card";
import { UploadForm } from "@/components/invoices/upload-form";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function UploadPage({
  searchParams
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const user = await requireUser();
  const { clientId } = await searchParams;
  const clients = await prisma.client.findMany({
    where: { firmId: user.firmId, status: "ACTIVE" },
    select: { id: true, businessName: true },
    orderBy: { businessName: "asc" }
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-slate-950">Upload client invoices</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Select a client, choose invoice type, then upload PDFs. Talos Ledger stores them securely, creates invoice records, and starts Gemini extraction automatically.
          </p>
        </div>
      </Card>
      <Card>
        <UploadForm clients={clients} defaultClientId={clientId} />
      </Card>
    </div>
  );
}
