export type CompanyRole = "OWNER" | "ADMIN" | "MANAGER" | "FINANCE" | "WORKER";
export type SystemRole = "PLATFORM_ADMIN" | "USER";

export interface CurrentUser {
  id: number;
  name: string;
  surname: string | null;
  email: string;
  status: string;
  systemRole: SystemRole;
}

export interface CompanyMembership {
  membershipId: number;
  companyId: number;
  companyName: string;
  role: CompanyRole;
}

export interface AuthSession {
  user: CurrentUser;
  companies: CompanyMembership[];
  activeCompany: CompanyMembership | null;
}

export function isPlatformAdmin(session: Pick<AuthSession, "user"> | null | undefined): boolean {
  return session?.user.systemRole === "PLATFORM_ADMIN";
}

export interface TokenResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  name: string;
  email: string;
  companyId?: number;
  companyName?: string;
  role?: CompanyRole;
}
