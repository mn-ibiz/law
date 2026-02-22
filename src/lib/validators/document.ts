import { z } from "zod";

export const uploadDocumentSchema = z.object({
  caseId: z.string().optional(),
  clientId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  category: z.enum(["pleading", "correspondence", "contract", "evidence", "court_order", "filing", "template", "other"]),
  description: z.string().optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.enum(["pleading", "correspondence", "contract", "evidence", "court_order", "filing", "template", "other"]),
  content: z.string().min(1, "Content is required"),
  placeholders: z.string().optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
