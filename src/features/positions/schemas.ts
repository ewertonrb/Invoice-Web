import { z } from "zod";

export const positionSchema = z.object({
  projectId: z.coerce.number().int().positive("Select a project."),
  positionName: z.string().trim().min(1, "Position name is required.").max(100, "Use at most 100 characters."),
});
export const positionResponseSchema = z.object({
  id: z.number().int().positive(), positionName: z.string(), projectId: z.number().int().positive(), projectName: z.string(),
  companyId: z.number().int().positive(), companyName: z.string(), active: z.boolean(), createdAt: z.string(), updatedAt: z.string(),
});
export const positionListResponseSchema = z.array(positionResponseSchema);
export type PositionInput = z.input<typeof positionSchema>;
export type Position = z.infer<typeof positionResponseSchema>;
