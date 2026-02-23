import { env } from "@/lib/env";

let atClient: {
  SMS: {
    send: (options: {
      to: string[];
      message: string;
      from?: string;
    }) => Promise<unknown>;
  };
} | null = null;

export function getATClient() {
  if (!env.AT_API_KEY || !env.AT_USERNAME) return null;
  if (!atClient) {
    // Dynamic import to avoid issues when AT is not configured
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AfricasTalking = require("africastalking");
    atClient = AfricasTalking({
      apiKey: env.AT_API_KEY,
      username: env.AT_USERNAME,
    });
  }
  return atClient;
}
