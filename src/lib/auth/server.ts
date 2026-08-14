import { apiRequest } from "@/lib/api/server";
import { getToken } from "@/lib/auth/session";
import type { AuthSession, CompanyMembership, CurrentUser } from "@/lib/auth/types";

function activeCompanyFromToken(token: string, companies: CompanyMembership[]) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()) as {
      companyId?: number;
    };
    return companies.find((company) => company.companyId === payload.companyId) ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthSession | null> {
  const token = await getToken();
  if (!token) return null;

  const [user, companies] = await Promise.all([
    apiRequest<CurrentUser>("/auth/me", {}, token),
    apiRequest<CompanyMembership[]>("/auth/me/companies", {}, token),
  ]);

  return { user, companies, activeCompany: activeCompanyFromToken(token, companies) };
}
