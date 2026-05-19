import { ClassValue, clsx } from "clsx";
import { format, parse } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value?: number | string | null) {
  const parsed = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number.isFinite(parsed) ? parsed : 0);
}

export function number(value?: number | string | null) {
  const parsed = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(Number.isFinite(parsed) ? parsed : 0);
}

export function formatDate(value?: Date | string | null, fallback = "—") {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return format(date, "dd MMM yyyy");
}

export function toInputDate(value?: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

export function parseInputDate(value?: string | null) {
  if (!value) return null;
  try {
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function percent(value?: number | null) {
  const numeric = Math.round((value ?? 0) * 100);
  return `${numeric}%`;
}
