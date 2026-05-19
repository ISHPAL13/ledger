"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { clientSchema } from "@/lib/validators";

export async function createClientAction(formData: FormData) {
  const user = await requireUser();
  const payload = clientSchema.parse(Object.fromEntries(formData));

  await prisma.client.create({
    data: {
      firmId: user.firmId,
      ...payload
    }
  });

  revalidatePath("/clients");
}

export async function updateClientAction(clientId: string, formData: FormData) {
  const user = await requireUser();
  const payload = clientSchema.parse(Object.fromEntries(formData));

  const existing = await prisma.client.findFirst({
    where: { id: clientId, firmId: user.firmId },
    select: { id: true }
  });
  if (!existing) throw new Error("Client not found");

  await prisma.client.update({
    where: { id: clientId },
    data: payload
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
}
