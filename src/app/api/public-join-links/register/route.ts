import { z } from "zod";
import { ApiError, errorResponse } from "@/lib/api/error";
import { apiRequest } from "@/lib/api/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";
import { setToken } from "@/lib/auth/session";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  surname: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  password: z.string().min(8).max(100),
  token: z.string().min(1),
});

type JoinResponse = { companyId: number; companyName: string; membershipStatus: string };
type TokenResponse = { token: string; expiresIn: number };

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Review the registration details." }, { status: 400 });
    const joined = await apiRequest<JoinResponse>("/public/join-links/register", { method: "POST", body: JSON.stringify(parsed.data) });
    const login = await apiRequest<TokenResponse>("/auth/login", { method: "POST", body: JSON.stringify({ email: parsed.data.email, password: parsed.data.password }) });
    await setToken(login.token, login.expiresIn);
    return Response.json(joined);
  } catch (error) {
    if (error instanceof ApiError) return errorResponse(error);
    return errorResponse(error);
  }
}
