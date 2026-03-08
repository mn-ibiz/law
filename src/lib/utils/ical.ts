import { createHmac } from "crypto";
import { env } from "@/lib/env";

export function generateIcalToken(userId: string, organizationId: string): string {
  const secret = env.ICAL_SECRET ?? env.AUTH_SECRET;
  return createHmac("sha256", secret).update(`${userId}:${organizationId}`).digest("hex");
}

export function verifyIcalToken(userId: string, organizationId: string, token: string): boolean {
  const expected = generateIcalToken(userId, organizationId);
  // Constant-time comparison
  if (expected.length !== token.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}
