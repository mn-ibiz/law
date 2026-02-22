"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema/clients";
import { publicIntakeSchema } from "@/lib/validators/intake";
import { revalidatePath } from "next/cache";

export async function submitIntake(data: unknown) {
  const validated = publicIntakeSchema.safeParse(data);
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const { firstName, lastName, email, phone, referralSource } = validated.data;

  const result = await db
    .insert(clients)
    .values({
      type: "individual",
      status: "prospective",
      firstName,
      lastName,
      email,
      phone,
      referralSource: referralSource || undefined,
      notes: `Intake: ${validated.data.caseType} — ${validated.data.description}`,
    })
    .returning();

  revalidatePath("/clients");
  return { data: result[0] };
}
