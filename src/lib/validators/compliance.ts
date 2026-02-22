import { z } from "zod";

export const createCertificateSchema = z.object({
  certificateNumber: z.string().min(1, "Certificate number is required"),
  year: z.number().min(2000).max(2100),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.enum(["active", "inactive", "suspended", "retired"]),
});

export const updateCertificateSchema = createCertificateSchema.partial();

export const createCpdRecordSchema = z.object({
  eventName: z.string().min(1, "Event name is required"),
  date: z.string().min(1, "Date is required"),
  provider: z.string().min(1, "Provider is required"),
  unitsEarned: z.number().min(0.5, "Minimum 0.5 units").max(5, "Maximum 5 units"),
  isLskProgram: z.boolean().default(false),
});

export type CreateCertificateInput = z.infer<typeof createCertificateSchema>;
export type CreateCpdRecordInput = z.infer<typeof createCpdRecordSchema>;
