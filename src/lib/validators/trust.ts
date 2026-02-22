import { z } from "zod";

export const createTrustTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account"),
  type: z.enum(["deposit", "withdrawal", "transfer", "interest", "fee"]),
  amount: z.number().min(0.01, "Amount required"),
  description: z.string().min(1, "Description is required"),
  referenceNumber: z.string().optional(),
});

export const createPettyCashSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  amount: z.number().min(0.01, "Amount required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
});

export type CreateTrustTransactionInput = z.infer<typeof createTrustTransactionSchema>;
export type CreatePettyCashInput = z.infer<typeof createPettyCashSchema>;
