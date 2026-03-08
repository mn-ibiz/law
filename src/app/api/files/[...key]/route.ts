import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getFileUrl } from "@/lib/storage";

// Valid storage key pattern: {uuid}/{category}/{uuid}.{ext}
const VALID_KEY_PATTERN = /^[0-9a-f-]+\/(documents|avatars|logos)\/[0-9a-f-]+\.[a-z0-9]+$/;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: keySegments } = await params;
  const key = keySegments.join("/");

  // Reject path traversal and malformed keys
  if (keySegments.some((s) => s === ".." || s === ".") || !VALID_KEY_PATTERN.test(key)) {
    return NextResponse.json({ error: "Invalid file key" }, { status: 400 });
  }

  // Validate that the storage key belongs to the requesting user's organization
  const keyOrgId = keySegments[0];
  if (keyOrgId !== session.user.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const signedUrl = await getFileUrl(key, 3600);

  // If ?redirect=true, redirect to the signed URL (for <a href> downloads)
  if (request.nextUrl.searchParams.get("redirect") === "true") {
    return NextResponse.redirect(signedUrl);
  }

  // Default: return JSON with URL (for programmatic access)
  return NextResponse.json({ url: signedUrl });
}
