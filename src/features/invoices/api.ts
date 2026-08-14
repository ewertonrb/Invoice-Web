import { z } from "zod";
import { ApiError, toApiError } from "@/lib/api/error";
import { invoicePeriodPreviewSchema, invoiceSchema, invoiceSummarySchema } from "./schemas";

async function request(path: string, init?: RequestInit) { let response: Response; try { response = await fetch(`/api/backend${path}`, { ...init, headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) } }); } catch { throw new ApiError(503, "Could not connect to the server."); } if (response.status === 401) { window.location.replace("/api/auth/clear-session"); throw new ApiError(401, "Your session has expired."); } if (!response.ok) throw await toApiError(response); return response.json(); }
export const previewInvoices = async (periodStart: string, periodEnd: string) => invoicePeriodPreviewSchema.parse(await request(`/invoices/preview?periodStart=${encodeURIComponent(periodStart)}&periodEnd=${encodeURIComponent(periodEnd)}`));
export const getInvoices = async (status?: string) => invoiceSummarySchema.array().parse(await request(`/invoices${status ? `?status=${encodeURIComponent(status)}` : ""}`));
export const getInvoice = async (id: number) => invoiceSchema.parse(await request(`/invoices/${id}`));
export const generateInvoiceDrafts = async (periodStart: string, periodEnd: string, workerProfileIds?: number[]) => z.object({ invoices: invoiceSchema.array(), generatedCount: z.number(), skippedCount: z.number() }).parse(await request("/invoices/drafts", { method: "POST", body: JSON.stringify({ periodStart, periodEnd, workerProfileIds: workerProfileIds?.length ? workerProfileIds : null }) }));
export const issueInvoice = async (id: number, issueDate: string, dueDate: string) => invoiceSchema.parse(await request(`/invoices/${id}/issue`, { method: "PATCH", body: JSON.stringify({ issueDate, dueDate }) }));
export const markInvoicePaid = async (id: number) => invoiceSchema.parse(await request(`/invoices/${id}/paid`, { method: "PATCH" }));
export const cancelInvoice = async (id: number) => invoiceSchema.parse(await request(`/invoices/${id}/cancel`, { method: "PATCH" }));
export const getInvoicePdf = async (id: number) => { const response = await fetch(`/api/backend/invoices/${id}/pdf`); if (!response.ok) throw await toApiError(response); return response.blob(); };
