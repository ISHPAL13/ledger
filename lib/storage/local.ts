import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { slugify } from "@/lib/utils";

const uploadRoot = process.env.UPLOAD_DIR || "./public/uploads";

export async function savePdfFile(params: {
  buffer: Buffer;
  firmId: string;
  clientId?: string | null;
  fileName: string;
}) {
  const ext = path.extname(params.fileName).toLowerCase();
  if (ext !== ".pdf") {
    throw new Error("Only PDF files are supported");
  }

  const dir = path.join(uploadRoot, params.firmId, params.clientId || "unassigned");
  await mkdir(dir, { recursive: true });
  const timestamp = Date.now();
  const cleanBase = slugify(path.basename(params.fileName, ext)) || "invoice";
  const finalName = `${timestamp}-${cleanBase}.pdf`;
  const destination = path.join(dir, finalName);

  await writeFile(destination, params.buffer);

  const relativePath = destination
    .replace(path.resolve("./public"), "")
    .replaceAll("\\", "/");

  return {
    filePath: destination,
    publicUrl: relativePath.startsWith("/") ? relativePath : `/${relativePath}`
  };
}
