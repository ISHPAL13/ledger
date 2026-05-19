import path from "path";

export function normalizePublicFileUrl(fileUrl: string) {
  if (!fileUrl) return fileUrl;
  const normalized = fileUrl.replaceAll("\\", "/");
  if (normalized.startsWith("/public/")) {
    return normalized.replace("/public/", "/");
  }
  if (normalized.startsWith("public/")) {
    return `/${normalized.replace(/^public\//, "")}`;
  }
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function resolveStoredFilePath(fileUrl: string) {
  const publicUrl = normalizePublicFileUrl(fileUrl).replace(/^\//, "");
  return path.join(process.cwd(), "public", publicUrl);
}
