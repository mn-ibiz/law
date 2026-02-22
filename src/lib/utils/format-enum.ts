/**
 * Converts an enum-style string (e.g. "in_progress") to a human-readable
 * format (e.g. "In progress"). Replaces all underscores with spaces and
 * capitalizes the first letter.
 */
export function formatEnum(str: string): string {
  if (!str) return "";
  const spaced = str.replaceAll("_", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
