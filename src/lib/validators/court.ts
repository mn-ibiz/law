import { z } from "zod";

export const createCourtSchema = z.object({
  name: z.string().min(1, "Court name is required"),
  level: z.string().min(1, "Court level is required"),
  jurisdiction: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export const createFilingSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  courtId: z.string().uuid("Invalid court").optional(),
  courtStationId: z.string().optional(),
  filingType: z.string().min(1, "Filing type is required"),
  filingNumber: z.string().optional(),
  filingDate: z.string().optional(),
  notes: z.string().optional(),
});

export const updateFilingStatusSchema = z.object({
  status: z.enum(["pending", "filed", "accepted", "rejected", "served"]),
});

export const createBringUpSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  assignedTo: z.string().uuid("Invalid user").optional(),
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type CreateFilingInput = z.infer<typeof createFilingSchema>;
export type CreateBringUpInput = z.infer<typeof createBringUpSchema>;
