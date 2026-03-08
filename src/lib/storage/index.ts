import { randomUUID } from "crypto";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";
import { env } from "@/lib/env";
import { r2Upload, r2GetSignedUrl, r2Delete } from "./r2";

// ---------------------------------------------------------------------------
// Storage key generation
// ---------------------------------------------------------------------------

export function generateStorageKey(
  organizationId: string,
  category: "documents" | "avatars" | "logos",
  ext: string
): string {
  const uuid = randomUUID();
  return `${organizationId}/${category}/${uuid}${ext}`;
}

// ---------------------------------------------------------------------------
// Storage abstraction — R2 in production, local filesystem in development
// ---------------------------------------------------------------------------

function isCloudStorageConfigured(): boolean {
  return !!(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME
  );
}

/**
 * Upload a file to storage.
 * Returns the storage key (not a URL).
 */
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  if (isCloudStorageConfigured()) {
    await r2Upload(key, body, contentType);
    return key;
  }

  // Local filesystem fallback for development
  const uploadsDir = join(process.cwd(), "public", "uploads");
  const filePath = join(uploadsDir, ...key.split("/"));
  const dir = filePath.substring(0, filePath.lastIndexOf("/"));
  await mkdir(dir, { recursive: true });
  await writeFile(filePath, body);
  return key;
}

/**
 * Get a signed URL for accessing a file.
 * In production: returns a time-limited signed URL.
 * In development: returns a local URL.
 */
export async function getFileUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  if (isCloudStorageConfigured()) {
    return r2GetSignedUrl(key, expiresIn);
  }

  // Local filesystem fallback — return direct path
  return `/uploads/${key}`;
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(key: string): Promise<void> {
  if (isCloudStorageConfigured()) {
    await r2Delete(key);
    return;
  }

  // Local filesystem fallback
  const filePath = join(process.cwd(), "public", "uploads", ...key.split("/"));
  try {
    await unlink(filePath);
  } catch {
    // File may not exist — ignore
  }
}

/**
 * Check if a string looks like a storage key (vs a full URL).
 * Storage keys follow the pattern: {orgId}/{category}/{uuid}.{ext}
 */
export function isStorageKey(value: string): boolean {
  return !value.startsWith("http://") && !value.startsWith("https://") && !value.startsWith("/");
}

/**
 * Resolve a file URL — if it's a storage key, get a signed URL; if it's a legacy URL, return as-is.
 */
export async function resolveFileUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (isStorageKey(value)) {
    return getFileUrl(value);
  }
  // Legacy URL — return as-is
  return value;
}

/**
 * Read a file from local storage (for migration purposes).
 */
export async function readLocalFile(relativePath: string): Promise<Buffer | null> {
  try {
    const filePath = join(process.cwd(), "public", relativePath);
    return await readFile(filePath);
  } catch {
    return null;
  }
}
