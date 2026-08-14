import { z } from "zod";
import { ApiError, errorResponse } from "@/lib/api/error";
import { apiRequest } from "@/lib/api/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";
import { clearToken, getToken, setToken } from "@/lib/auth/session";
import type { TokenResponse } from "@/lib/auth/types";

const schema = z.object({ companyId: z.number().int().positive() });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  try {
    const token = await getToken();
    if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Invalid company." }, { status: 400 });

    const selected = await apiRequest<TokenResponse>("/auth/select-company", {
      method: "POST",
      body: JSON.stringify(parsed.data),
    }, token);
    await setToken(selected.token, selected.expiresIn);
    return Response.json({
      companyId: selected.companyId,
      companyName: selected.companyName,
      role: selected.role,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) await clearToken();
    return errorResponse(error);
  }
}
