"use server";

import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema/clients";
import { organizations } from "@/lib/db/schema/organizations";
import { publicIntakeSchema } from "@/lib/validators/intake";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/utils/rate-limit";
import { safeAction } from "@/lib/utils/safe-action";

export async function submitIntake(organizationSlug: string, data: unknown) {
  return safeAction(async () => {
    // Resolve organization from slug (public form — no auth required)
    if (!organizationSlug) {
      return { error: "Organization is required." };
    }

    const [org] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, organizationSlug))
      .limit(1);

    if (!org) {
      return { error: "Organization not found." };
    }

    const organizationId = org.id;

    // Rate limit: max 5 submissions per hour per IP
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { success } = await rateLimit(`intake:${organizationId}:${ip}`);
    if (!success) {
      return { error: "Too many submissions. Please try again later." };
    }

    const validated = publicIntakeSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { firstName, lastName, email, phone, referralSource } = validated.data;

    await db
      .insert(clients)
      .values({
        organizationId,
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
