import { z } from "zod";

export const createAttorneySchema = z.object({
  userId: z.string().uuid("Select a user"),
  barNumber: z.string().min(1, "Bar number is required").max(100),
  jurisdiction: z.string().min(1, "Jurisdiction is required").max(255),
  title: z.enum(["partner", "senior_associate", "associate", "of_counsel", "paralegal"]),
  department: z.string().max(255).optional(),
  hourlyRate: z.number().min(0, "Rate must be positive").optional(),
  dateAdmitted: z.string().optional(),
  bio: z.string().max(5000).optional(),
  lskNumber: z.string().max(100).optional(),
  commissionerForOaths: z.boolean(),
  notaryPublic: z.boolean(),
  seniorCounsel: z.boolean(),
});

export const updateAttorneySchema = createAttorneySchema.partial().omit({ userId: true });

export const createLicenseSchema = z.object({
  jurisdiction: z.string().min(1, "Jurisdiction is required").max(255),
  licenseNumber: z.string().min(1, "License number is required").max(100),
  status: z.enum(["active", "inactive", "suspended", "retired", "struck_off", "deceased"]),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional(),
});

export type CreateAttorneyInput = z.infer<typeof createAttorneySchema>;
export type UpdateAttorneyInput = z.infer<typeof updateAttorneySchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
