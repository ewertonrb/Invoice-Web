import { z } from "zod";
export const statuses = ["PENDING", "ACCEPTED", "DECLINED", "CANCELLED", "EXPIRED"] as const;
export const invitationInputSchema = z.object({ name: z.string().trim().min(1).max(100), surname: z.string().trim().min(1).max(100), email: z.string().trim().email().max(150), role: z.literal("WORKER") });
export const invitationSchema = z.object({ id: z.number(), companyId: z.number(), companyName: z.string(), name: z.string(), surname: z.string(), email: z.string(), role: z.literal("WORKER"), status: z.enum(statuses), invitedByUserId: z.number(), invitedByName: z.string(), expiresAt: z.string(), acceptedAt: z.string().nullable(), cancelledAt: z.string().nullable(), createdAt: z.string(), updatedAt: z.string() });
export type InvitationInput = z.input<typeof invitationInputSchema>;
export const joinLinkInputSchema = z.object({ role: z.literal("WORKER"), maxUses: z.coerce.number().int().min(1).max(100000), expiresAt: z.string().min(1).refine((value) => new Date(value).getTime() > Date.now(), "Expiry must be in the future.") });
export const joinLinkSchema = z.object({ id: z.number(), companyId: z.number(), companyName: z.string(), role: z.literal("WORKER"), status: z.enum(["ACTIVE", "EXPIRED", "DISABLED"]), maxUses: z.number(), currentUses: z.number(), remainingUses: z.number(), expiresAt: z.string(), disabledAt: z.string().nullable(), createdByUserId: z.number(), createdByName: z.string(), createdAt: z.string(), updatedAt: z.string() });
export type JoinLinkInput = z.input<typeof joinLinkInputSchema>;
