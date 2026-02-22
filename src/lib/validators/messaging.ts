import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid("Invalid recipient"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
  caseId: z.string().uuid().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
