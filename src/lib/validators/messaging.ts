import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid("Invalid recipient"),
  subject: z.string().min(1, "Subject is required").max(255),
  body: z.string().min(1, "Message body is required").max(5000),
  caseId: z.string().uuid().optional(),
  attachmentUrl: z.string().max(2048).optional(),
  attachmentName: z.string().max(255).optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
