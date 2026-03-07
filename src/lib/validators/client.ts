import { z } from "zod";

export const createClientSchema = z.object({
  type: z.enum(["individual", "organization"]),
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(20),
  companyName: z.string().max(255).optional(),
  industry: z.string().max(255).optional(),
  taxId: z.string().max(100).optional(),
  nationalId: z.string().max(100).optional(),
  passportNumber: z.string().max(100).optional(),
  kraPin: z.string().max(100).optional(),
  county: z.string().max(255).optional(),
  poBox: z.string().max(100).optional(),
  physicalAddress: z.string().max(500).optional(),
  nextOfKin: z.string().max(255).optional(),
  employer: z.string().max(255).optional(),
  dateOfBirth: z.string().optional(),
  referralSource: z.string().max(255).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(255).optional(),
  state: z.string().max(255).optional(),
  zipCode: z.string().max(20).optional(),
  notes: z.string().max(5000).optional(),
  isPep: z.boolean().optional(),
  pepDetails: z.string().max(5000).optional(),
  leadSource: z.enum(["referral", "website", "walk_in", "advertising", "social_media", "event", "other"]).optional(),
  leadScore: z.number().int().min(0).max(100).optional(),
  followUpDate: z.string().optional(),
  lostReason: z.string().max(5000).optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();

export const createContactLogSchema = z.object({
  type: z.enum(["phone_call", "email", "in_person", "letter", "video_call"]),
  subject: z.string().min(1, "Subject is required").max(255),
  notes: z.string().max(5000).optional(),
  contactDate: z.string().min(1, "Date is required"),
});

export const createKycDocumentSchema = z.object({
  documentType: z.enum(["national_id", "passport", "kra_pin", "drivers_license", "company_registration", "tax_compliance", "other"]),
  documentNumber: z.string().max(100).optional(),
  expiryDate: z.string().optional(),
});

export const updateKycDocumentSchema = z.object({
  documentType: z.enum(["national_id", "passport", "kra_pin", "drivers_license", "company_registration", "tax_compliance", "other"]).optional(),
  documentNumber: z.string().max(100).optional(),
  status: z.enum(["pending", "in_progress", "verified", "rejected", "expired"]).optional(),
  expiryDate: z.string().optional(),
});

export const createRiskAssessmentSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  factors: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateContactLogInput = z.infer<typeof createContactLogSchema>;
export type CreateKycDocumentInput = z.infer<typeof createKycDocumentSchema>;
export type CreateRiskAssessmentInput = z.infer<typeof createRiskAssessmentSchema>;
