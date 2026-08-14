import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type CompanyId = number;

const companyScope = (companyId: CompanyId) => ["company", companyId] as const;

export const queryKeys = {
  session: ["session"] as const,
  dashboard: {
    summary: (companyId: CompanyId) => [...companyScope(companyId), "dashboard", "summary"] as const,
  },
  companies: ["companies"] as const,
  company: companyScope,
  projects: (companyId: CompanyId) => [...companyScope(companyId), "projects"] as const,
  project: (companyId: CompanyId, projectId: number) => [...companyScope(companyId), "projects", projectId] as const,
  positions: (companyId: CompanyId) => [...companyScope(companyId), "positions"] as const,
  position: (companyId: CompanyId, positionId: number) => [...companyScope(companyId), "positions", positionId] as const,
  rates: (companyId: CompanyId) => [...companyScope(companyId), "rates"] as const,
  rate: (companyId: CompanyId, rateId: number) => [...companyScope(companyId), "rates", rateId] as const,
  workers: (companyId: CompanyId) => [...companyScope(companyId), "workers"] as const,
  worker: (companyId: CompanyId, workerId: number) => [...companyScope(companyId), "workers", workerId] as const,
  invitations: (companyId: CompanyId) => [...companyScope(companyId), "invitations"] as const,
  memberships: (companyId: CompanyId) => [...companyScope(companyId), "memberships"] as const,
  workerProfile: (companyId: CompanyId) => [...companyScope(companyId), "worker-profile"] as const,
  workLogs: (companyId: CompanyId) => [...companyScope(companyId), "work-logs"] as const,
  workLog: (companyId: CompanyId, workLogId: number) => [...companyScope(companyId), "work-logs", workLogId] as const,
  invoices: (companyId: CompanyId) => [...companyScope(companyId), "invoices"] as const,
  shifts: (companyId: CompanyId) => [...companyScope(companyId), "shifts"] as const,
  shift: (companyId: CompanyId, shiftId: number) => [...companyScope(companyId), "shifts", shiftId] as const,
  notifications: (companyId: CompanyId) => [...companyScope(companyId), "notifications"] as const,
};

export function isCompanyScopedQueryKey(queryKey: QueryKey): boolean {
  return queryKey[0] === "company" && typeof queryKey[1] === "number";
}

export async function clearCompanyScopedCache(queryClient: QueryClient): Promise<void> {
  const predicate = ({ queryKey }: { queryKey: QueryKey }) => isCompanyScopedQueryKey(queryKey);

  await queryClient.cancelQueries({ predicate });
  queryClient.removeQueries({ predicate });
}
