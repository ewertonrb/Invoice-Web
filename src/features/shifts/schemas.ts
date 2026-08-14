import { z } from "zod";

export const shiftModes = ["INDIVIDUAL", "PUBLIC"] as const;
export const shiftStatuses = ["OPEN", "FULL", "CANCELLED", "EXPIRED"] as const;
export const assignmentStatuses = ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED"] as const;

const assignmentSchema = z.object({ id: z.number(), workerProfileId: z.number(), workerName: z.string(), status: z.enum(assignmentStatuses), declineReason: z.string().nullable(), respondedAt: z.string().nullable() });
export const shiftSchema = z.object({
  id: z.number(), companyId: z.number(), projectPositionId: z.number(), projectId: z.number(), projectName: z.string(), positionName: z.string(),
  mode: z.enum(shiftModes), status: z.enum(shiftStatuses), shiftDate: z.string(), startTime: z.string(), endTime: z.string(), capacity: z.number(), acceptedCount: z.number(), remainingSlots: z.number(),
  location: z.string().nullable(), notes: z.string().nullable(), myAssignmentStatus: z.enum(assignmentStatuses).nullable(), assignments: z.array(assignmentSchema), createdAt: z.string(), updatedAt: z.string(),
});
export const shiftListSchema = z.array(shiftSchema);
export const shiftInputSchema = z.object({ mode: z.enum(shiftModes), projectPositionId: z.coerce.number().int().positive("Select a position."), workerProfileId: z.number().int().positive().nullable(), shiftDate: z.string().min(1, "Select a date."), startTime: z.string().min(1, "Enter a start time."), endTime: z.string().min(1, "Enter an end time."), capacity: z.coerce.number().int().min(1, "Capacity must be at least 1."), location: z.string().max(255).nullable(), notes: z.string().max(1000).nullable() }).superRefine((value, ctx) => {
  if (value.endTime <= value.startTime) ctx.addIssue({ code: "custom", path: ["endTime"], message: "End time must be after start time." });
  if (value.mode === "INDIVIDUAL" && !value.workerProfileId) ctx.addIssue({ code: "custom", path: ["workerProfileId"], message: "Select a worker for an individual shift." });
  if (value.mode === "PUBLIC" && value.workerProfileId) ctx.addIssue({ code: "custom", path: ["workerProfileId"], message: "Public shifts cannot target a worker." });
});
export type Shift = z.infer<typeof shiftSchema>;
export type ShiftInput = z.input<typeof shiftInputSchema>;
