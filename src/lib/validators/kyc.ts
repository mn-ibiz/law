import { z } from "zod";

export const uploadKycDocumentSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const verifyKycDocumentSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  notes: z.string().optional(),
});

export const riskAssessmentSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  factors: z.string().optional(),
  notes: z.string().optional(),
});

export const conflictCheckSchema = z.object({
  searchQuery: z.string().min(2, "Search query too short"),
});

export const resolveConflictSchema = z.object({
  result: z.enum(["clear", "potential", "conflict_found"]),
  resolutionNotes: z.string().optional(),
});

export type UploadKycDocumentInput = z.infer<typeof uploadKycDocumentSchema>;
export type RiskAssessmentInput = z.infer<typeof riskAssessmentSchema>;
export type ConflictCheckInput = z.infer<typeof conflictCheckSchema>;
