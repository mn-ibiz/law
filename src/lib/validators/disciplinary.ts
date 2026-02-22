import { z } from "zod";

export const createDisciplinaryRecordSchema = z.object({
  date: z.string().min(1, "Date is required"),
  caseReference: z.string().min(1, "Case reference is required"),
  status: z.enum(["pending", "resolved", "dismissed"]),
  outcome: z.string().optional(),
  notes: z.string().optional(),
});

export const updateDisciplinaryRecordSchema = createDisciplinaryRecordSchema.partial();

export type CreateDisciplinaryInput = z.infer<typeof createDisciplinaryRecordSchema>;
