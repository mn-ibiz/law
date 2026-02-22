import { z } from "zod";

export const createInvoiceSchema = z.object({
  caseId: z.string().uuid("Invalid case"),
  clientId: z.string().uuid("Invalid client"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().max(5000).optional(),
  lineItems: z.array(
    z.object({
      description: z.string().min(1, "Description is required").max(5000),
      quantity: z.number().min(0.01),
      unitPrice: z.number().min(0),
      amount: z.number(),
    })
  ).min(1, "At least one line item required"),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid("Invalid invoice"),
  amount: z.number().min(0.01, "Amount required"),
  paymentMethod: z.enum(["bank_transfer", "mpesa", "cash", "cheque", "credit_card", "other"]),
  referenceNumber: z.string().max(100).optional(),
  mpesaCode: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const createQuoteSchema = z.object({
  caseId: z.string().uuid().optional(),
  clientId: z.string().uuid("Invalid client"),
  validUntil: z.string().min(1, "Validity date required"),
  description: z.string().min(1, "Description required").max(5000),
  amount: z.number().min(0.01, "Amount required"),
  notes: z.string().max(5000).optional(),
});

export const createReceiptSchema = z.object({
  paymentId: z.string().uuid(),
  issuedTo: z.string().min(1).max(255),
  amount: z.number().positive(),
});

export const createCreditNoteSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().min(1).max(5000),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type CreateCreditNoteInput = z.infer<typeof createCreditNoteSchema>;
