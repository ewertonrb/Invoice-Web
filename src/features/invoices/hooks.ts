"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { cancelInvoice, generateInvoiceDrafts, getInvoice, getInvoicePdf, getInvoices, issueInvoice, markInvoicePaid, previewInvoices } from "./api";
export const useInvoicePreview = (companyId: number, start: string, end: string) => useQuery({ queryKey: [...queryKeys.invoices(companyId), "preview", { start, end }], queryFn: () => previewInvoices(start, end), enabled: Boolean(start && end && start <= end) });
export const useInvoices = (companyId: number, status?: string) => useQuery({ queryKey: [...queryKeys.invoices(companyId), { status: status || null }], queryFn: () => getInvoices(status) });
export const useInvoice = (companyId: number, id: number) => useQuery({ queryKey: [...queryKeys.invoices(companyId), id], queryFn: () => getInvoice(id), enabled: id > 0 });
function invalidateDashboard(client: ReturnType<typeof useQueryClient>, companyId: number) { return client.refetchQueries({ queryKey: queryKeys.dashboard.summary(companyId), type: "active" }); }
export function useGenerateInvoiceDrafts(companyId: number) { const client = useQueryClient(); return useMutation({ mutationFn: ({ start, end, workerProfileIds }: { start: string; end: string; workerProfileIds?: number[] }) => generateInvoiceDrafts(start, end, workerProfileIds), onSuccess: async () => await Promise.all([client.invalidateQueries({ queryKey: queryKeys.invoices(companyId) }), invalidateDashboard(client, companyId)]) }); }
function useInvoiceAction(companyId: number, id: number, mutationFn: () => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn, onSuccess: async (data) => { client.setQueryData([...queryKeys.invoices(companyId), id], data); await Promise.all([client.invalidateQueries({ queryKey: queryKeys.invoices(companyId) }), invalidateDashboard(client, companyId)]); } }); }
export const useIssueInvoice = (companyId: number, id: number) => useInvoiceAction(companyId, id, () => issueInvoice(id, new Date().toISOString().slice(0, 10), new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)));
export const useMarkInvoicePaid = (companyId: number, id: number) => useInvoiceAction(companyId, id, () => markInvoicePaid(id));
export const useCancelInvoice = (companyId: number, id: number) => useInvoiceAction(companyId, id, () => cancelInvoice(id));
export const useInvoicePdf = () => useMutation({ mutationFn: getInvoicePdf });
