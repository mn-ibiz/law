import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey, type ApiKeyContext } from "./api-key-auth";
import { hasApiPermission } from "./require-api-permission";
import { rateLimit, rateLimitForPlan } from "@/lib/utils/rate-limit";

/**
 * Authenticates an API request via API key and enforces the required permission.
 * Also applies per-plan rate limiting.
 *
 * Returns the ApiKeyContext on success, or a NextResponse error to return immediately.
 *
 * Usage in API routes:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const authResult = await requireApiKeyAuth(request, "cases:read");
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { organizationId } = authResult;
 *   // ... proceed with org-scoped query
 * }
 * ```
 */
export async function requireApiKeyAuth(
  request: NextRequest,
  requiredPermission: string
): Promise<ApiKeyContext | NextResponse> {
  const authHeader = request.headers.get("authorization");
  const context = await authenticateApiKey(authHeader);

  if (!context) {
    return NextResponse.json(
      { error: "Invalid or missing API key" },
      { status: 401 }
    );
  }

  // Enforce permission
  if (!hasApiPermission(context, requiredPermission)) {
    return NextResponse.json(
      { error: `Forbidden: API key lacks required permission '${requiredPermission}'` },
      { status: 403 }
    );
  }

  // Apply per-plan rate limiting
  const planLimits = rateLimitForPlan(context.planSlug);
  const rl = await rateLimit(`api:${context.organizationId}`, planLimits);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.reset ?? Date.now() + 60000 - Date.now()) / 1000)) } }
    );
  }

  return context;
}
