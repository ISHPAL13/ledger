"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { settingsSchema } from "@/lib/validators";

export async function updateSettingsAction(formData: FormData) {
  const user = await requireRole("ADMIN");
  const payload = settingsSchema.parse({
    ...Object.fromEntries(formData),
    autoApproveHighConfidenceInvoices: formData.get("autoApproveHighConfidenceInvoices") === "on"
  });

  await prisma.firm.update({
    where: { id: user.firmId },
    data: {
      name: payload.name,
      ownerName: payload.ownerName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
      gstNumber: payload.gstNumber,
      panNumber: payload.panNumber,
      defaultFinancialYear: payload.defaultFinancialYear,
      defaultExportFormat: payload.defaultExportFormat,
      lowConfidenceThreshold: payload.lowConfidenceThreshold,
      autoApproveHighConfidence: payload.autoApproveHighConfidenceInvoices
    }
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function createStaffAction(formData: FormData) {
  const user = await requireRole("ADMIN");
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();

  if (fullName.length < 2 || !email || password.length < 8) {
    throw new Error("Enter full name, work email, and an 8 character password");
  }

  await prisma.firmUser.create({
    data: {
      firmId: user.firmId,
      fullName,
      email,
      passwordHash: await hashPassword(password),
      role: "STAFF"
    }
  });

  revalidatePath("/settings");
}
