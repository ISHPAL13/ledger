"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, FileImage, Loader2, UploadCloud } from "lucide-react";
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
  const [selectedCount, setSelectedCount] = useState(0);
  const [trackingIds, setTrackingIds] = useState<string[]>([]);
  const [extractionStatus, setExtractionStatus] = useState<{
    total: number;
    processedCount: number;
    failedCount: number;
    completedCount: number;
    pendingReviewCount: number;
    done: boolean;
  } | null>(null);

  function updateSelectedCount() {
    const fileCount = filesInputRef.current?.files?.length || 0;
    const cameraCount = cameraInputRef.current?.files?.length || 0;
    setSelectedCount(fileCount + cameraCount);
  }

  async function handleSubmit(formData: FormData) {
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File && entry.size > 0 && entry.name.trim().length > 0);
    if (files.length === 0) {
      setMessage("Select a PDF or click a picture before uploading.");
      return;
    }

    const normalizedFormData = new FormData();
    normalizedFormData.set("clientId", String(formData.get("clientId") || ""));
    normalizedFormData.set("invoiceType", String(formData.get("invoiceType") || "PURCHASE"));
    for (const file of files) {
      normalizedFormData.append("files", file);
    }

    setUploading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: normalizedFormData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setTrackingIds(Array.isArray(result.invoiceIds) ? result.invoiceIds : []);
      setExtractionStatus({
        total: result.count,
        processedCount: 0,
        failedCount: 0,
        completedCount: 0,
        pendingReviewCount: 0,
        done: false
      });
      setMessage(`${result.count} file(s) uploaded. Extraction started.`);
      formRef.current?.reset();
      setSelectedCount(0);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (trackingIds.length === 0) return;

    let cancelled = false;

    async function pollStatuses() {
      try {
        const query = trackingIds.map((id) => `id=${encodeURIComponent(id)}`).join("&");
        const response = await fetch(`/api/invoices/status?${query}`, {
          cache: "no-store"
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to fetch extraction status");
        if (cancelled) return;
        setExtractionStatus({
          total: result.total,
          processedCount: result.processedCount,
          failedCount: result.failedCount,
          completedCount: result.completedCount,
          pendingReviewCount: result.pendingReviewCount,
          done: result.done
        });
        if (result.done) {
          setTrackingIds([]);
        }
      } catch {
        if (!cancelled) {
          setMessage("Upload finished, but live extraction status could not be refreshed.");
        }
      }
    }

    void pollStatuses();
    const intervalId = window.setInterval(() => {
      void pollStatuses();
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [trackingIds]);

  const progress = extractionStatus
    ? Math.max(8, Math.round((extractionStatus.processedCount / Math.max(extractionStatus.total, 1)) * 100))
    : 0;
  const showExtractionPanel = extractionStatus !== null;

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
        <input
          ref={filesInputRef}
          name="files"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={updateSelectedCount}
        />
        <input
          ref={cameraInputRef}
          name="files"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          capture="environment"
          className="hidden"
          onChange={updateSelectedCount}
        />
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
        <div className="mt-2 text-center text-xs font-medium text-slate-600">
          {selectedCount > 0 ? `${selectedCount} file(s) selected` : "No file selected yet"}
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

      {showExtractionPanel ? (
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {extractionStatus?.done ? "Extraction complete" : "Extraction in progress"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {extractionStatus?.done
                  ? "You can see it in the "
                  : `Processed ${extractionStatus?.processedCount || 0} of ${extractionStatus?.total || 0} uploaded file(s).`}
                {extractionStatus?.done ? (
                  <Link href="/invoices" className="font-semibold text-brand-600 hover:text-brand-700">
                    Invoices
                  </Link>
                ) : null}
                {extractionStatus?.done ? "." : null}
              </div>
            </div>
            {extractionStatus?.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Loader2 className="h-5 w-5 animate-spin text-brand-600" />}
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${extractionStatus?.done ? "bg-emerald-500" : "bg-brand-600"}`}
              style={{ width: `${extractionStatus?.done ? 100 : progress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
            <span>Total: {extractionStatus?.total || 0}</span>
            <span>Ready: {(extractionStatus?.completedCount || 0) + (extractionStatus?.pendingReviewCount || 0)}</span>
            <span>Failed: {extractionStatus?.failedCount || 0}</span>
          </div>
        </div>
      ) : message ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div>
      ) : null}
    </form>
  );
}
