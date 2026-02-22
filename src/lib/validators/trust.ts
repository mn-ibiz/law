import { z } from "zod";

export const createTrustTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account"),
  type: z.enum(["deposit", "withdrawal", "transfer", "interest", "fee"]),
  amount: z.number().min(0.01, "Amount required"),
  description: z.string().min(1, "Description is required").max(5000),
  referenceNumber: z.string().max(100).optional(),
});

export const createPettyCashSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().min(0.01, "Amount required"),
  description: z.string().min(1, "Description is required").max(5000),
  category: z.string().max(255).optional(),
});

export type CreateTrustTransactionInput = z.infer<typeof createTrustTransactionSchema>;
export type CreatePettyCashInput = z.infer<typeof createPettyCashSchema>;
