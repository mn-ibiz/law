import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  kraPin: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranch: z.string().optional(),
  category: z.string().optional(),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;

export const createSupplierInvoiceSchema = z.object({
  supplierId: z.string().uuid(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.number().min(0.01),
  vatAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0.01),
  description: z.string().optional(),
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
});

export type CreateSupplierInvoiceInput = z.infer<typeof createSupplierInvoiceSchema>;
