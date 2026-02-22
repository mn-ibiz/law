import { z } from "zod";

export const createClientSchema = z.object({
  type: z.enum(["individual", "organization"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  taxId: z.string().optional(),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
  kraPin: z.string().optional(),
  county: z.string().optional(),
  poBox: z.string().optional(),
  physicalAddress: z.string().optional(),
  nextOfKin: z.string().optional(),
  employer: z.string().optional(),
  dateOfBirth: z.string().optional(),
  referralSource: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const createContactLogSchema = z.object({
  type: z.enum(["phone_call", "email", "in_person", "letter", "video_call"]),
  subject: z.string().min(1, "Subject is required"),
  notes: z.string().optional(),
  contactDate: z.string().min(1, "Date is required"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateContactLogInput = z.infer<typeof createContactLogSchema>;
