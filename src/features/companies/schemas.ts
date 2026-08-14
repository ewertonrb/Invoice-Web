import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const companySchema = z.object({
  name: z.string().trim().min(1, "Company name is required.").max(150, "Use at most 150 characters."),
  abn: z.string().trim().min(1, "ABN is required.").max(20, "Use at most 20 characters."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address.").max(150, "Use at most 150 characters."),
  phone: optionalText(30),
  address: optionalText(255),
  active: z.boolean(),
  contractorInvoiceGstEnabled: z.boolean(),
});

export const companyUpdateSchema = companySchema.extend({
  active: z.boolean().optional(),
});

export const companyResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  abn: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  active: z.boolean(),
  contractorInvoiceGstEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CompanyInput = z.input<typeof companySchema>;
export type CompanyUpdateInput = z.input<typeof companyUpdateSchema>;
export type Company = z.infer<typeof companyResponseSchema>;
