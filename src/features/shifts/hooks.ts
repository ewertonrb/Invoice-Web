"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { acceptShift, cancelShift, createShift, declineShift, getAvailableShifts, getMyShifts, getShifts } from "./api";
export function useShifts(companyId: number, worker = false) { return useQuery({ queryKey: [...queryKeys.shifts(companyId), worker ? "available" : "manage"], queryFn: () => worker ? getAvailableShifts(companyId) : getShifts(companyId), enabled: companyId > 0 }); }
export function useMyShifts(companyId: number) { return useQuery({ queryKey: [...queryKeys.shifts(companyId), "mine"], queryFn: () => getMyShifts(companyId), enabled: companyId > 0 }); }
export function useCreateShift(companyId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (input: Parameters<typeof createShift>[1]) => createShift(companyId, input), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.shifts(companyId) }) }); }
function useShiftAction(companyId: number, fn: (id: number) => Promise<unknown>) { const client = useQueryClient(); return useMutation({ mutationFn: (id: number) => fn(id), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.shifts(companyId) }) }); }
export function useAcceptShift(companyId: number) { return useShiftAction(companyId, (id) => acceptShift(companyId, id)); }
export function useCancelShift(companyId: number) { return useShiftAction(companyId, (id) => cancelShift(companyId, id)); }
export function useDeclineShift(companyId: number) { const client = useQueryClient(); return useMutation({ mutationFn: ({ id, reason }: { id: number; reason?: string }) => declineShift(companyId, id, reason), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.shifts(companyId) }) }); }
