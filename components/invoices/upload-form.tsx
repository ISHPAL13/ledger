"use client";

import { useRef, useState } from "react";
import { Camera, FileImage, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadForm({
  clients,
  defaultClientId
}: {
  clients: { id: string; businessName: string }[];
  defaultClientId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setUploading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setMessage(`${result.count} file(s) uploaded. AI extraction started.`);
      formRef.current?.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      className="space-y-6"
      action={async (formData) => {
        await handleSubmit(formData);
      }}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Client</label>
          <select name="clientId" required defaultValue={defaultClientId} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4">
            <option value="">Select client...</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.businessName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Invoice Type</label>
          <select name="invoiceType" defaultValue="PURCHASE" className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4">
            <option value="PURCHASE">Purchase Invoice</option>
            <option value="SALES">Sales Invoice</option>
            <option value="EXPENSE">Expense Bill</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 md:p-10">
        <input ref={filesInputRef} name="files" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" multiple required className="hidden" />
        <input ref={cameraInputRef} name="files" type="file" accept="image/png,image/jpeg,image/webp" capture="environment" className="hidden" />
        <UploadCloud className="mx-auto h-14 w-14 text-slate-400" />
        <div className="mt-4 text-center text-2xl font-semibold text-slate-950">Upload invoice files or capture a fresh photo</div>
        <div className="mt-2 text-center text-sm text-slate-500">
          PDFs and invoice images are supported. On mobile, use the camera option to click a picture and send it straight for extraction.
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button type="button" variant="secondary" onClick={() => filesInputRef.current?.click()}>
            <FileImage className="mr-2 h-4 w-4" />
            Browse files
          </Button>
          <Button type="button" onClick={() => cameraInputRef.current?.click()}>
            <Camera className="mr-2 h-4 w-4" />
            Click picture
          </Button>
        </div>
        <div className="mt-4 text-center text-xs text-slate-500">
          Supported formats: PDF, PNG, JPG, JPEG, WEBP
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          Clients can upload bills, invoices, scanned GST documents, or camera photos client-wise for CA review.
        </div>
        <Button type="submit" disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {uploading ? "Uploading..." : "Upload & Extract"}
        </Button>
      </div>

      {message ? <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div> : null}
    </form>
  );
}
