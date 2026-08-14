import type { CompanyRole } from "@/lib/auth/types";

export type Permission = "company:manage" | "projects:manage" | "rates:view" | "rates:manage" | "workers:manage" | "profile:own" | "workLogs:own" | "workLogs:review" | "invoices:view" | "invoices:manage" | "shifts:view" | "shifts:manage";

const rolePermissions: Record<CompanyRole, ReadonlySet<Permission>> = {
  OWNER: new Set(["company:manage", "projects:manage", "rates:view", "rates:manage", "workers:manage", "workLogs:own", "workLogs:review", "invoices:view", "invoices:manage", "shifts:view", "shifts:manage"]),
  ADMIN: new Set(["company:manage", "projects:manage", "rates:view", "rates:manage", "workers:manage", "workLogs:own", "workLogs:review", "invoices:view", "invoices:manage", "shifts:view", "shifts:manage"]),
  MANAGER: new Set(["projects:manage", "rates:view", "rates:manage", "workers:manage", "workLogs:own", "workLogs:review", "invoices:view", "invoices:manage", "shifts:view", "shifts:manage"]),
  FINANCE: new Set(["rates:view", "workLogs:own", "workLogs:review", "invoices:view"]),
  WORKER: new Set(["profile:own", "workLogs:own", "invoices:view", "shifts:view"]),
};

export function can(role: CompanyRole, permission: Permission): boolean {
  return rolePermissions[role].has(permission);
}
