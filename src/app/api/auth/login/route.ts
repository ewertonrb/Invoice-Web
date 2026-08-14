import { z } from "zod";
import { ApiError, errorResponse } from "@/lib/api/error";
import { apiRequest } from "@/lib/api/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";
import { clearToken, setToken } from "@/lib/auth/session";
import type { CompanyMembership, CurrentUser, TokenResponse } from "@/lib/auth/types";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { message: "Review the information provided.", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const login = await apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    });
    const [user, companies] = await Promise.all([
      apiRequest<CurrentUser>("/auth/me", {}, login.token),
      apiRequest<CompanyMembership[]>("/auth/me/companies", {}, login.token),
    ]);
    await setToken(login.token, login.expiresIn);
    return Response.json({ user, companies, activeCompany: null });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) await clearToken();
    return errorResponse(error);
  }
}
