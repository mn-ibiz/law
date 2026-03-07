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
  documentUrl: z.string().max(2048).optional(),
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

export const createServiceOfDocumentSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  documentTitle: z.string().min(1, "Document title is required").max(500),
  servedTo: z.string().min(1, "Party served is required").max(500),
  method: z.enum(["personal", "substituted", "email", "registered_mail", "court_process_server", "other"]),
  serviceDate: z.string().optional(),
  proofOfServiceUrl: z.string().max(2048).optional(),
  notes: z.string().max(5000).optional(),
});

export const createCauseListSchema = z.object({
  courtId: z.string().uuid("Invalid court").optional(),
  date: z.string().min(1, "Date is required"),
  judge: z.string().max(255).optional(),
  courtRoom: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
});

export const createCauseListEntrySchema = z.object({
  causeListId: z.string().uuid("Invalid cause list"),
  caseId: z.string().uuid().optional(),
  caseNumber: z.string().max(100).optional(),
  parties: z.string().max(500).optional(),
  matter: z.string().max(500).optional(),
  time: z.string().max(20).optional(),
  order: z.number().int().min(0).optional(),
  outcome: z.string().max(5000).optional(),
});

export const createCourtRuleSchema = z.object({
  courtId: z.string().uuid().optional(),
  name: z.string().min(1, "Rule name is required").max(255),
  description: z.string().max(5000).optional(),
  triggerEvent: z.enum(["hearing_date", "filing_date"]),
  offsetDays: z.number().int(),
  deadlineTitle: z.string().min(1, "Deadline title is required").max(255),
  priority: z.enum(["low", "medium", "high", "critical"]),
  isStatutory: z.boolean(),
});

export const updateFilingSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  courtId: z.string().uuid("Invalid court").optional(),
  courtStationId: z.string().uuid().optional(),
  filingType: z.string().min(1, "Filing type is required").max(255),
  filingNumber: z.string().max(100).optional(),
  filingDate: z.string().optional(),
  documentUrl: z.string().max(2048).optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(["pending", "filed", "accepted", "rejected", "served"]),
});

export const updateCourtRuleSchema = z.object({
  courtId: z.string().uuid().optional(),
  name: z.string().min(1, "Rule name is required").max(255),
  description: z.string().max(5000).optional(),
  triggerEvent: z.enum(["hearing_date", "filing_date"]),
  offsetDays: z.number().int(),
  deadlineTitle: z.string().min(1, "Deadline title is required").max(255),
  priority: z.enum(["low", "medium", "high", "critical"]),
  isStatutory: z.boolean(),
});

export const updateCauseListSchema = z.object({
  courtId: z.string().uuid("Invalid court").optional(),
  date: z.string().min(1, "Date is required"),
  judge: z.string().max(255).optional(),
  courtRoom: z.string().max(255).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateCauseListEntrySchema = z.object({
  caseId: z.string().uuid().optional(),
  caseNumber: z.string().max(100).optional(),
  parties: z.string().max(500).optional(),
  matter: z.string().max(500).optional(),
  time: z.string().max(20).optional(),
  order: z.number().int().min(0).optional(),
  outcome: z.string().max(5000).optional(),
});

export const updateBringUpSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  assignedTo: z.string().uuid("Invalid user").optional(),
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(1, "Reason is required").max(5000),
  notes: z.string().max(5000).optional(),
});

export const updateCourtSchema = createCourtSchema;

export type CreateCourtInput = z.infer<typeof createCourtSchema>;
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>;
export type CreateFilingInput = z.infer<typeof createFilingSchema>;
export type UpdateFilingInput = z.infer<typeof updateFilingSchema>;
export type CreateServiceOfDocumentInput = z.infer<typeof createServiceOfDocumentSchema>;
export type CreateBringUpInput = z.infer<typeof createBringUpSchema>;
export type UpdateBringUpInput = z.infer<typeof updateBringUpSchema>;
export type CreateCauseListInput = z.infer<typeof createCauseListSchema>;
export type UpdateCauseListInput = z.infer<typeof updateCauseListSchema>;
export type CreateCauseListEntryInput = z.infer<typeof createCauseListEntrySchema>;
export type UpdateCauseListEntryInput = z.infer<typeof updateCauseListEntrySchema>;
export type CreateCourtRuleInput = z.infer<typeof createCourtRuleSchema>;
export type UpdateCourtRuleInput = z.infer<typeof updateCourtRuleSchema>;
