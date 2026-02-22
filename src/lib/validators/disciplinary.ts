import { z } from "zod";

export const createDisciplinaryRecordSchema = z.object({
  date: z.string().min(1, "Date is required"),
  caseReference: z.string().min(1, "Case reference is required").max(100),
  status: z.enum(["pending", "resolved", "dismissed"]),
  outcome: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateDisciplinaryRecordSchema = createDisciplinaryRecordSchema.partial();

export type CreateDisciplinaryInput = z.infer<typeof createDisciplinaryRecordSchema>;
