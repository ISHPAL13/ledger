import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { normalizePublicFileUrl } from "@/lib/storage/paths";
import { slugify } from "@/lib/utils";

const uploadRoot = process.env.UPLOAD_DIR || "./public/uploads";

const allowedExtensions = new Set([".pdf", ".png", ".jpg", ".jpeg", ".webp"]);

export async function saveInvoiceFile(params: {
  buffer: Buffer;
  firmId: string;
  clientId?: string | null;
  fileName: string;
}) {
  const ext = path.extname(params.fileName).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    throw new Error("Only PDF, PNG, JPG, JPEG, and WEBP files are supported");
  }

  const dir = path.join(uploadRoot, params.firmId, params.clientId || "unassigned");
  await mkdir(dir, { recursive: true });
  const timestamp = Date.now();
  const cleanBase = slugify(path.basename(params.fileName, ext)) || "invoice";
  const finalName = `${timestamp}-${cleanBase}${ext}`;
  const destination = path.join(dir, finalName);

  await writeFile(destination, params.buffer);

  const relativePath = path.resolve(destination)
    .replace(path.resolve("./public"), "")
    .replaceAll("\\", "/");

  return {
    filePath: destination,
    publicUrl: normalizePublicFileUrl(relativePath.startsWith("/") ? relativePath : `/${relativePath}`)
  };
}
