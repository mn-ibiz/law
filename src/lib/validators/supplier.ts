import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  contactPerson: z.string().max(255).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  kraPin: z.string().max(100).optional(),
  bankName: z.string().max(255).optional(),
  bankAccountNumber: z.string().max(100).optional(),
  bankBranch: z.string().max(255).optional(),
  category: z.string().max(255).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const createSupplierInvoiceSchema = z.object({
  supplierId: z.string().uuid(),
  invoiceNumber: z.string().min(1, "Invoice number is required").max(100),
  amount: z.number().min(0.01),
  vatAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0.01),
  description: z.string().max(5000).optional(),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  fileUrl: z.string().max(2048).optional(),
});

export type CreateSupplierInvoiceInput = z.infer<typeof createSupplierInvoiceSchema>;
