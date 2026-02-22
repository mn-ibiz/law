import { z } from "zod";

export const createTimeEntrySchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  description: z.string().min(1, "Description is required").max(5000),
  date: z.string().min(1, "Date is required"),
  hours: z.number().min(0.1, "Hours must be at least 0.1"),
  hourlyRate: z.number().optional(),
  isBillable: z.boolean(),
});

export const createExpenseSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  category: z.enum(["filing_fee", "travel", "courier", "printing", "expert_fee", "court_fee", "other"]),
  description: z.string().min(1, "Description is required").max(5000),
  amount: z.number().min(0.01, "Amount required"),
  date: z.string().min(1, "Date is required"),
  isBillable: z.boolean(),
});

export const createRequisitionSchema = z.object({
  caseId: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required").max(5000),
  amount: z.number().min(0.01, "Amount required"),
  justification: z.string().max(5000).optional(),
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>;
