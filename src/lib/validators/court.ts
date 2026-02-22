import { z } from "zod";

export const createCourtSchema = z.object({
  name: z.string().min(1, "Court name is required").max(255),
  level: z.string().min(1, "Court level is required").max(255),
  jurisdiction: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export const createFilingSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  courtId: z.string().uuid("Invalid court").optional(),
  courtStationId: z.string().uuid().optional(),
  filingType: z.string().min(1, "Filing type is required").max(255),
  filingNumber: z.string().max(100).optional(),
  filingDate: z.string().optional(),
  notes: z.string().max(5000).optional(),
});

export const updateFilingStatusSchema = z.object({
  status: z.enum(["pending", "filed", "accepted", "rejected", "served"]),
});

export const createBringUpSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  assignedTo: z.string().uuid("Invalid user").optional(),
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required").max(5000),
  notes: z.string().max(5000).optional(),
});

export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type CreateFilingInput = z.infer<typeof createFilingSchema>;
export type CreateBringUpInput = z.infer<typeof createBringUpSchema>;
