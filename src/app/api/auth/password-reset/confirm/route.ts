import { z } from "zod";
import { errorResponse } from "@/lib/api/error";
import { apiRequest } from "@/lib/api/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";

const schema = z.object({ token: z.string().min(1), password: z.string().min(8).max(100), confirmPassword: z.string().min(1) });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Use a password with at least 8 characters." }, { status: 400 });
    await apiRequest<void>("/auth/password-reset/confirm", { method: "POST", body: JSON.stringify(parsed.data) });
    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
