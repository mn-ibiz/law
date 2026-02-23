import { z } from "zod";

export const uploadDocumentSchema = z.object({
  caseId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  title: z.string().min(1, "Title is required").max(255),
  category: z.enum(["pleading", "correspondence", "contract", "evidence", "court_order", "filing", "template", "other"]),
  description: z.string().max(5000).optional(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  category: z.enum(["pleading", "correspondence", "contract", "evidence", "court_order", "filing", "template", "other"]),
  content: z.string().min(1, "Content is required"),
  description: z.string().max(5000).optional(),
  placeholders: z.string().optional(),
});

export const createDocumentRecordSchema = z.object({
  title: z.string().min(1).max(255),
  caseId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  category: z.enum(["pleading", "correspondence", "contract", "evidence", "court_order", "filing", "template", "other"]),
  description: z.string().max(5000).optional(),
  fileUrl: z.string().min(1).max(2000),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().optional(),
  mimeType: z.string().max(100).optional(),
});

export const createDocumentVersionSchema = z.object({
  documentId: z.string().uuid(),
  versionNumber: z.number().int().positive(),
  fileUrl: z.string().url().max(2000),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().positive().optional(),
  changeNotes: z.string().max(5000).optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type CreateDocumentRecordInput = z.infer<typeof createDocumentRecordSchema>;
export type CreateDocumentVersionInput = z.infer<typeof createDocumentVersionSchema>;
