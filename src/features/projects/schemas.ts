import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required.").max(100, "Use at most 100 characters."),
});

export const projectResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  companyId: z.number().int().positive(),
  companyName: z.string(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const projectListResponseSchema = z.array(projectResponseSchema);

export type ProjectInput = z.input<typeof projectSchema>;
export type Project = z.infer<typeof projectResponseSchema>;
