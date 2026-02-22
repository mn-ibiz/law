import { z } from "zod";

export const publicIntakeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  caseType: z.string().min(1, "Case type is required"),
  description: z.string().min(10, "Please provide more detail"),
  referralSource: z.string().optional(),
  consentDataProtection: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing",
  }),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of engagement",
  }),
});

export type PublicIntakeInput = z.infer<typeof publicIntakeSchema>;
