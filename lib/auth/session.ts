import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/auth";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "talos-ledger-session";
const SECRET = process.env.SESSION_SECRET || "replace-me";

type SessionPayload = {
  userId: string;
  firmId: string;
  expiresAt: number;
};

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function encode(payload: SessionPayload) {
  const serialized = JSON.stringify(payload);
  const base64 = Buffer.from(serialized, "utf8").toString("base64url");
  return `${base64}.${sign(base64)}`;
}

function decode(value: string): SessionPayload | null {
  const [base64, signature] = value.split(".");
  if (!base64 || !signature) return null;
  const expected = sign(base64);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(base64, "base64url").toString("utf8")) as SessionPayload;
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, firmId: string) {
  const payload: SessionPayload = {
    userId,
    firmId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encode(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const payload = decode(raw);
  if (!payload) return null;

  const user = await prisma.firmUser.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      firmId: true
    }
  });

  if (!user || user.firmId !== payload.firmId) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: SessionUser["role"]) {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}
