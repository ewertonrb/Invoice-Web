"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api/query-keys";
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from "./api";
export function useNotifications(companyId: number) { return useQuery({ queryKey: [...queryKeys.notifications(companyId), "list"], queryFn: () => getNotifications(companyId), enabled: companyId > 0, refetchInterval: 30_000 }); }
export function useUnreadNotificationCount(companyId: number) { return useQuery({ queryKey: [...queryKeys.notifications(companyId), "unread-count"], queryFn: () => getUnreadCount(companyId), enabled: companyId > 0, refetchInterval: 30_000 }); }
export function useMarkNotificationRead(companyId: number) { const client = useQueryClient(); return useMutation({ mutationFn: (id: number) => markNotificationRead(companyId, id), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications(companyId) }) }); }
export function useMarkAllNotificationsRead(companyId: number) { const client = useQueryClient(); return useMutation({ mutationFn: () => markAllNotificationsRead(companyId), onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications(companyId) }) }); }
