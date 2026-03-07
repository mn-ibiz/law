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
  receiptUrl: z.string().max(2048).optional(),
});

export const createTrustAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(255),
  clientId: z.string().uuid("Invalid client"),
  caseId: z.string().uuid("Invalid case").optional().or(z.literal("")),
  accountType: z.enum(["client", "general"]),
  initialBalance: z.number().min(0, "Balance cannot be negative").default(0),
  bankName: z.string().max(255).optional(),
  branchName: z.string().max(255).optional(),
});

export const updateTrustAccountSchema = z.object({
  accountName: z.string().min(1, "Account name is required").max(255),
  type: z.enum(["client", "general"]),
  bankName: z.string().max(255).optional(),
  branchName: z.string().max(255).optional(),
});

export type CreateTrustTransactionInput = z.infer<typeof createTrustTransactionSchema>;
export type CreatePettyCashInput = z.infer<typeof createPettyCashSchema>;
export type CreateTrustAccountInput = z.infer<typeof createTrustAccountSchema>;
export type UpdateTrustAccountInput = z.infer<typeof updateTrustAccountSchema>;
