import { z } from "zod";

export const uploadKycDocumentSchema = z.object({
  documentType: z.string().min(1, "Document type is required").max(255),
  documentNumber: z.string().max(100).optional(),
  expiryDate: z.string().optional(),
});

export const verifyKycDocumentSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  notes: z.string().max(5000).optional(),
});

export const riskAssessmentSchema = z.object({
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  factors: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
});

export const conflictCheckSchema = z.object({
  searchQuery: z.string().min(2, "Search query too short"),
});

export const resolveConflictSchema = z.object({
  result: z.enum(["clear", "potential", "conflict_found"]),
  resolutionNotes: z.string().max(5000).optional(),
});

export type UploadKycDocumentInput = z.infer<typeof uploadKycDocumentSchema>;
export type RiskAssessmentInput = z.infer<typeof riskAssessmentSchema>;
export type ConflictCheckInput = z.infer<typeof conflictCheckSchema>;
