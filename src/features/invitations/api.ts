import { z } from "zod";
import { ApiError, toApiError } from "@/lib/api/error";
import { invitationInputSchema, invitationSchema, joinLinkInputSchema, joinLinkSchema, type InvitationInput, type JoinLinkInput } from "./schemas";

async function request(path: string, init?: RequestInit) {
  let response: Response;
  try { response = await fetch(`/api/backend${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) } }); }
  catch { throw new ApiError(503, "Could not connect to the server."); }
  if (response.status === 401) {
    window.location.replace(new URL("/api/auth/clear-session", window.location.origin).href);
    throw new ApiError(401, "Your session has expired.");
  }
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export const getInvitations = async (companyId: number, status?: string) => invitationSchema.array().parse(await request(`/companies/${companyId}/invitations${status ? `?status=${status}` : ""}`));
export const createInvitation = async (companyId: number, data: InvitationInput) => z.object({ invitation: invitationSchema, invitationUrl: z.string() }).parse(await request(`/companies/${companyId}/invitations`, { method: "POST", body: JSON.stringify(invitationInputSchema.parse(data)) }));
export const cancelInvitation = async (companyId: number, id: number) => invitationSchema.parse(await request(`/companies/${companyId}/invitations/${id}/cancel`, { method: "PATCH" }));
export const getJoinLinks = async (companyId: number) => joinLinkSchema.array().parse(await request(`/companies/${companyId}/join-links`));
export const getJoinLinkUrl = async (companyId: number, id: number) => z.object({ joinUrl: z.string().url() }).parse(await request(`/companies/${companyId}/join-links/${id}/url`)).joinUrl;
export const createJoinLink = async (companyId: number, input: JoinLinkInput) => z.object({ joinLink: joinLinkSchema, joinUrl: z.string() }).parse(await request(`/companies/${companyId}/join-links`, { method: "POST", body: JSON.stringify({ ...joinLinkInputSchema.parse(input), expiresAt: input.expiresAt || null }) }));
export const disableJoinLink = async (companyId: number, id: number) => joinLinkSchema.parse(await request(`/companies/${companyId}/join-links/${id}/disable`, { method: "PATCH" }));
export const activateJoinLink = async (companyId: number, id: number) => joinLinkSchema.parse(await request(`/companies/${companyId}/join-links/${id}/activate`, { method: "PATCH" }));
