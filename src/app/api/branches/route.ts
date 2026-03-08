import { db } from "@/lib/db";
import { branches } from "@/lib/db/schema/branches";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json([], { status: 401 });
  }

  const result = await db
    .select({ id: branches.id, name: branches.name, isMain: branches.isMain })
    .from(branches)
    .where(and(eq(branches.organizationId, session.user.organizationId), eq(branches.isActive, true)));

  return NextResponse.json(result);
}
