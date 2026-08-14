import { ApiError, toApiError } from "@/lib/api/error";
import { companyResponseSchema, companySchema, companyUpdateSchema, type Company, type CompanyInput, type CompanyUpdateInput } from "./schemas";

async function request(path: string, init?: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    });
  } catch {
    throw new ApiError(503, "Could not connect to the server.");
  }
  if (response.status === 401) {
    window.location.replace(new URL("/api/auth/clear-session", window.location.origin).href);
    throw new ApiError(401, "Your session has expired.");
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined;
  return response.json();
}

export async function getCompany(companyId: number): Promise<Company> {
  return companyResponseSchema.parse(await request(`/companies/${companyId}`));
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const payload = companySchema.parse(input);
  return companyResponseSchema.parse(await request("/companies", { method: "POST", body: JSON.stringify({ ...payload, phone: payload.phone || null, address: payload.address || null }) }));
}

export async function updateCompany(companyId: number, input: CompanyUpdateInput): Promise<Company> {
  const payload = companyUpdateSchema.parse(input);
  return companyResponseSchema.parse(await request(`/companies/${companyId}`, { method: "PUT", body: JSON.stringify({ ...payload, phone: payload.phone || null, address: payload.address || null }) }));
}

export async function deactivateCompany(companyId: number): Promise<void> {
  await request(`/companies/${companyId}`, { method: "DELETE" });
}
