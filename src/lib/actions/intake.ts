"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema/clients";
import { publicIntakeSchema } from "@/lib/validators/intake";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/utils/rate-limit";
import { safeAction } from "@/lib/utils/safe-action";

export async function submitIntake(data: unknown) {
  return safeAction(async () => {
    // Rate limit: max 5 submissions per hour per IP
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = rateLimit(`intake:${ip}`);
    if (!success) {
      return { error: "Too many submissions. Please try again later." };
    }

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
    return { success: true };
  });
}
