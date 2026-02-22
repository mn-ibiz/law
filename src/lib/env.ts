import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  AUTH_SECRET: z
    .string()
    .min(16, "AUTH_SECRET must be at least 16 characters")
    .refine(
      (s) =>
        s !== "placeholder" &&
        s !== "changeme" &&
        s !== "secret" &&
        !s.includes("change-me") &&
        s.length >= 32,
      {
        message:
          "AUTH_SECRET must not be a placeholder value and must be at least 32 characters",
      }
    ),
  AUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Environment validation failed:\n${formatted}`);
  }
  return result.data;
}

export const env = validateEnv();
