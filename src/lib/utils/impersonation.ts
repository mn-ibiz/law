import { createHmac } from "crypto";
import { env } from "@/lib/env";

export interface ImpersonationPayload {
  superAdminId: string;
  superAdminName: string;
  targetOrgId: string;
  targetOrgName: string;
  targetOrgSlug: string;
  targetUserId: string;
  startedAt: string;
}

const IMPERSONATION_MAX_AGE = 60 * 60; // 1 hour

export function signImpersonationCookie(payload: ImpersonationPayload): string {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64");
  const sig = createHmac("sha256", env.AUTH_SECRET).update(data).digest("hex");
  return `${data}.${sig}`;
}

export function verifyImpersonationCookie(raw: string): ImpersonationPayload | null {
  const dotIdx = raw.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const data = raw.slice(0, dotIdx);
  const sig = raw.slice(dotIdx + 1);
  const expected = createHmac("sha256", env.AUTH_SECRET).update(data).digest("hex");
  // Constant-time comparison
  if (sig.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) {
    mismatch |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64").toString()) as ImpersonationPayload;
    // Validate required fields
    if (!payload.superAdminId || !payload.targetOrgId || !payload.startedAt) return null;
    // Check expiry
    const elapsed = Date.now() - new Date(payload.startedAt).getTime();
    if (elapsed > IMPERSONATION_MAX_AGE * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
