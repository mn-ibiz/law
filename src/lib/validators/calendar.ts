import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  type: z.enum(["court_hearing", "meeting", "deadline", "reminder", "consultation", "deposition", "other"]),
  caseId: z.string().optional(),
  location: z.string().max(255).optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  allDay: z.boolean(),
  isCourtDate: z.boolean(),
});

export const createDeadlineSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  caseId: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueDate: z.string().min(1, "Due date is required"),
  isStatutory: z.boolean(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(5000).optional(),
  caseId: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  dueDate: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
