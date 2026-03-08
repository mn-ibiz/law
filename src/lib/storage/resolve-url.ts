/**
 * Client-side utility for resolving file URLs from storage keys.
 *
 * Storage keys (e.g., "{orgId}/documents/{uuid}.pdf") need to go through
 * the signed URL proxy endpoint. Legacy full URLs are returned as-is.
 */

/**
 * Check if a value is a storage key (not a full URL or absolute path).
 */
function isStorageKey(value: string): boolean {
  return (
    !value.startsWith("http://") &&
    !value.startsWith("https://") &&
    !value.startsWith("/")
  );
}

/**
 * Resolve a file reference to a usable URL.
 * - Storage keys → `/api/files/{key}` (redirects to signed URL)
 * - Legacy URLs → returned as-is
 * - null/undefined → null
 */
export function resolveFileHref(value: string | null | undefined): string | null {
  if (!value) return null;
  if (isStorageKey(value)) {
    return `/api/files/${value}`;
  }
  return value;
}

/**
 * Fetch a signed URL for a storage key.
 * Returns the signed URL string for use in downloads or image rendering.
 */
export async function fetchSignedUrl(storageKey: string): Promise<string> {
  const res = await fetch(`/api/files/${storageKey}`);
  if (!res.ok) throw new Error("Failed to get file URL");
  const data = await res.json();
  return data.url;
}
