import { z } from "zod";

export const notificationSchema = z.object({ id: z.number(), type: z.enum(["SHIFT_ASSIGNED", "SHIFT_AVAILABLE", "SHIFT_ACCEPTED", "SHIFT_DECLINED", "SHIFT_CANCELLED"]), title: z.string(), message: z.string(), targetPath: z.string(), relatedShiftId: z.number().nullable(), read: z.boolean(), createdAt: z.string() });
export const notificationListSchema = z.array(notificationSchema);
export type Notification = z.infer<typeof notificationSchema>;
