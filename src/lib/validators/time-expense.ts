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
  receiptUrl: z.string().url().nullish(),
});

export const createRequisitionSchema = z.object({
  caseId: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required").max(5000),
  amount: z.number().min(0.01, "Amount required"),
  justification: z.string().max(5000).optional(),
});

export const batchTimeEntrySchema = z.object({
  entries: z.array(z.object({
    caseId: z.string().uuid("Invalid case"),
    date: z.string().min(1, "Date is required"),
    hours: z.number().min(0).max(24),
    description: z.string().max(5000).optional(),
    isBillable: z.boolean().optional(),
  })).min(1, "At least one entry is required").max(100),
});

export const updateTimeEntrySchema = z.object({
  id: z.string().uuid("Invalid ID"),
  caseId: z.string().uuid("Invalid case"),
  description: z.string().min(1, "Description is required").max(5000),
  date: z.string().min(1, "Date is required"),
  hours: z.number().min(0.1, "Hours must be at least 0.1"),
  hourlyRate: z.number().optional(),
  isBillable: z.boolean(),
});

export const updateExpenseSchema = z.object({
  id: z.string().uuid("Invalid ID"),
  caseId: z.string().uuid("Invalid case"),
  category: z.enum(["filing_fee", "travel", "courier", "printing", "expert_fee", "court_fee", "other"]),
  description: z.string().min(1, "Description is required").max(5000),
  amount: z.number().min(0.01, "Amount required"),
  date: z.string().min(1, "Date is required"),
  isBillable: z.boolean(),
  receiptUrl: z.string().url().nullish(),
});

export const updateRequisitionSchema = z.object({
  caseId: z.string().uuid().optional(),
  description: z.string().min(1, "Description is required").max(5000),
  amount: z.number().min(0.01, "Amount required"),
  justification: z.string().max(5000).optional(),
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateRequisitionInput = z.infer<typeof createRequisitionSchema>;
export type UpdateRequisitionInput = z.infer<typeof updateRequisitionSchema>;
export type BatchTimeEntryInput = z.infer<typeof batchTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
