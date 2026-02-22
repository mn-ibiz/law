import { z } from "zod";

export const createCaseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  clientId: z.string().uuid("Invalid client"),
  caseType: z.string().min(1, "Case type is required"),
  practiceArea: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  billingType: z.enum(["hourly", "flat_fee", "contingency", "retainer", "pro_bono"]),
  hourlyRate: z.number().optional(),
  flatFeeAmount: z.number().optional(),
  contingencyPercentage: z.number().optional(),
  courtName: z.string().optional(),
  courtCaseNumber: z.string().optional(),
  judge: z.string().optional(),
  opposingCounsel: z.string().optional(),
  opposingParty: z.string().optional(),
  statuteOfLimitations: z.string().optional(),
  dateFiled: z.string().optional(),
  estimatedValue: z.number().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCaseSchema = createCaseSchema.partial().extend({
  status: z.enum(["open", "in_progress", "hearing", "resolved", "closed", "archived"]).optional(),
});

export const createCaseNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  isPrivate: z.boolean(),
});

export const addCasePartySchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["client", "opposing_party", "opposing_counsel", "witness", "expert", "judge", "other"]),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
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
