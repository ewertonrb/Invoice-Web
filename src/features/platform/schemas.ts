import { z } from "zod";

export const platformCompanySchema = z.object({
  name: z.string().trim().min(1).max(150),
  abn: z.string().trim().min(1).max(20),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(255).optional(),
  contractorInvoiceGstEnabled: z.boolean(),
  active: z.boolean(),
  ownerFirstName: z.string().trim().min(1).max(100),
  ownerLastName: z.string().trim().min(1).max(100),
  ownerEmail: z.string().trim().email().max(150),
  temporaryPassword: z.string().min(12).max(200).optional(),
});

export type PlatformCompanyInput = z.input<typeof platformCompanySchema>;
