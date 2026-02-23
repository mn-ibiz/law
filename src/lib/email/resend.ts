import { Resend } from "resend";
import { env } from "@/lib/env";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }
  return resendClient;
}
