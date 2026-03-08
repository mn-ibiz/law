import { NextRequest, NextResponse } from "next/server";
import { checkSlugAvailability } from "@/lib/utils/slug-validation";
import { rateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ valid: false, error: "Slug parameter is required." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rl = await rateLimit(`check-slug:${ip}`);
  if (!rl.success) {
    return NextResponse.json({ valid: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const result = await checkSlugAvailability(slug);
  return NextResponse.json(result);
}
