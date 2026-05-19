"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, signupSchema } from "@/lib/validators";

export async function signupAction(_: unknown, formData: FormData) {
  const payload = signupSchema.safeParse(Object.fromEntries(formData));
  if (!payload.success) {
    return { error: payload.error.issues[0]?.message || "Invalid form submission" };
  }

  const existingFirm = await prisma.firm.findUnique({ where: { email: payload.data.email } });
  if (existingFirm) return { error: "An account with this email already exists" };

  const firm = await prisma.firm.create({
    data: {
      name: payload.data.firmName,
      ownerName: payload.data.ownerName,
      email: payload.data.email,
      phone: payload.data.phone,
      gstNumber: payload.data.gstNumber,
      panNumber: payload.data.panNumber,
      users: {
        create: {
          fullName: payload.data.ownerName,
          email: payload.data.email,
          passwordHash: await hashPassword(payload.data.password),
          role: "ADMIN"
        }
      }
    },
    include: { users: true }
  });

  await createSession(firm.users[0].id, firm.id);
  redirect("/dashboard");
}

export async function loginAction(_: unknown, formData: FormData) {
  const payload = loginSchema.safeParse(Object.fromEntries(formData));
  if (!payload.success) {
    return { error: payload.error.issues[0]?.message || "Invalid login" };
  }

  const user = await prisma.firmUser.findFirst({
    where: { email: payload.data.email, isActive: true },
    include: { firm: true }
  });

  if (!user || !(await verifyPassword(payload.data.password, user.passwordHash))) {
    return { error: "Incorrect email or password" };
  }

  await createSession(user.id, user.firmId);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
