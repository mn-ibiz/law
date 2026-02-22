import { z } from "zod";

export const practiceAreaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export type PracticeAreaInput = z.infer<typeof practiceAreaSchema>;

export const billingRateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ratePerHour: z.number().min(0),
  currency: z.string().default("KES"),
  isDefault: z.boolean().default(false),
});

export type BillingRateInput = z.infer<typeof billingRateSchema>;

export const firmSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string().optional(),
  description: z.string().optional(),
});

export type FirmSettingInput = z.infer<typeof firmSettingSchema>;

export const customFieldSchema = z.object({
  entityType: z.string().min(1),
  fieldName: z.string().min(1),
  fieldType: z.enum(["text", "number", "date", "select", "boolean"]),
  fieldOptions: z.string().optional(),
  isRequired: z.boolean().default(false),
  order: z.string().optional(),
});

export type CustomFieldInput = z.infer<typeof customFieldSchema>;

export const tagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  entityType: z.string().optional(),
});

export type TagInput = z.infer<typeof tagSchema>;

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  variables: z.string().optional(),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

export const smsTemplateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  body: z.string().min(1, "Body is required"),
  variables: z.string().optional(),
});

export type SmsTemplateInput = z.infer<typeof smsTemplateSchema>;
