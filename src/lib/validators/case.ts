import { z } from "zod";

export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  clientId: z.string().uuid("Invalid client"),
  caseType: z.string().min(1, "Case type is required").max(255),
  practiceArea: z.string().max(255).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  billingType: z.enum(["hourly", "flat_fee", "contingency", "retainer", "pro_bono"]),
  hourlyRate: z.number().min(0).optional(),
  flatFeeAmount: z.number().min(0).optional(),
  contingencyPercentage: z.number().min(0).max(100).optional(),
  courtName: z.string().max(255).optional(),
  courtCaseNumber: z.string().max(100).optional(),
  judge: z.string().max(255).optional(),
  opposingCounsel: z.string().max(255).optional(),
  opposingParty: z.string().max(255).optional(),
  statuteOfLimitations: z.string().optional(),
  dateFiled: z.string().optional(),
  estimatedValue: z.number().optional(),
  description: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: z.enum(["open", "in_progress", "hearing", "resolved", "closed", "archived"]).optional(),
});

export const createCaseNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").max(5000),
  isPrivate: z.boolean(),
});

export const addCasePartySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  role: z.enum(["client", "opposing_party", "opposing_counsel", "witness", "expert", "judge", "other"]),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
});

export const assignCaseSchema = z.object({
  userId: z.string().uuid("Invalid user"),
  role: z.enum(["lead", "assigned", "supervising", "of_counsel"]),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type CreateCaseNoteInput = z.infer<typeof createCaseNoteSchema>;
export type AddCasePartyInput = z.infer<typeof addCasePartySchema>;
export type AssignCaseInput = z.infer<typeof assignCaseSchema>;
