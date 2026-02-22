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
});

export const updateClientSchema = createClientSchema.partial();

export const createContactLogSchema = z.object({
  type: z.enum(["phone_call", "email", "in_person", "letter", "video_call"]),
  subject: z.string().min(1, "Subject is required").max(255),
  notes: z.string().max(5000).optional(),
  contactDate: z.string().min(1, "Date is required"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateContactLogInput = z.infer<typeof createContactLogSchema>;
