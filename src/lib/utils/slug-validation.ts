import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema/organizations";
import { eq } from "drizzle-orm";

const RESERVED_SLUGS = new Set([
  "admin", "api", "app", "www", "mail", "support", "help",
  "billing", "status", "docs", "blog", "portal", "auth",
  "login", "register", "signup", "dashboard", "settings",
  "webhook", "webhooks", "stripe", "calendar", "intake",
  "default", "system", "platform", "_platform", "root", "cdn", "assets",
  "static", "public", "private", "internal", "test", "staging",
  "demo", "dev", "prod", "noreply", "postmaster", "abuse",
]);

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 50;

export interface SlugValidationResult {
  valid: boolean;
  error?: string;
}

export function validateSlugFormat(slug: string): SlugValidationResult {
  if (!slug) {
    return { valid: false, error: "Slug is required." };
  }

  const normalized = slug.toLowerCase().trim();

  if (normalized.length < MIN_LENGTH) {
    return { valid: false, error: `Slug must be at least ${MIN_LENGTH} characters.` };
  }

  if (normalized.length > MAX_LENGTH) {
    return { valid: false, error: `Slug must be at most ${MAX_LENGTH} characters.` };
  }

  if (!SLUG_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: "Slug can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.",
    };
  }

  if (RESERVED_SLUGS.has(normalized)) {
    return { valid: false, error: "This subdomain is reserved. Please choose a different one." };
  }

  return { valid: true };
}

export async function checkSlugAvailability(slug: string): Promise<SlugValidationResult> {
  const formatResult = validateSlugFormat(slug);
  if (!formatResult.valid) return formatResult;

  const [existing] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.slug, slug.toLowerCase().trim()))
    .limit(1);

  if (existing) {
    return { valid: false, error: "This subdomain is already taken." };
  }

  return { valid: true };
}
