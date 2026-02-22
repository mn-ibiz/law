import { z } from "zod";

export const practiceAreaSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(5000).optional(),
});

export type PracticeAreaInput = z.infer<typeof practiceAreaSchema>;

export const billingRateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(5000).optional(),
  ratePerHour: z.number().min(0),
  currency: z.string().default("KES"),
  isDefault: z.boolean().default(false),
});

export type BillingRateInput = z.infer<typeof billingRateSchema>;

export const firmSettingSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string().max(5000).optional(),
  description: z.string().max(5000).optional(),
});

export type FirmSettingInput = z.infer<typeof firmSettingSchema>;

export const customFieldSchema = z.object({
  entityType: z.string().min(1).max(255),
  fieldName: z.string().min(1).max(255),
  fieldType: z.enum(["text", "number", "date", "select", "boolean"]),
  fieldOptions: z.string().optional(),
  isRequired: z.boolean().default(false),
  order: z.number().int().optional(),
});

export type CustomFieldInput = z.infer<typeof customFieldSchema>;

export const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  color: z.string().max(50).optional(),
  entityType: z.string().max(255).optional(),
});

export type TagInput = z.infer<typeof tagSchema>;

export const emailTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  subject: z.string().min(1, "Subject is required").max(255),
  body: z.string().min(1, "Body is required").max(5000),
  variables: z.string().max(5000).optional(),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

export const smsTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  body: z.string().min(1, "Body is required").max(5000),
  variables: z.string().max(5000).optional(),
});

export type SmsTemplateInput = z.infer<typeof smsTemplateSchema>;
