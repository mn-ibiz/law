import { z } from "zod";

export const publicIntakeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(255),
  lastName: z.string().min(1, "Last name is required").max(255),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(20),
  caseType: z.string().min(1, "Case type is required").max(255),
  description: z.string().min(10, "Please provide more detail").max(5000),
  referralSource: z.string().max(255).optional(),
  consentDataProtection: z.boolean().refine((val) => val === true, {
    message: "You must consent to data processing",
  }),
  consentTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms of engagement",
  }),
});

export type PublicIntakeInput = z.infer<typeof publicIntakeSchema>;
