import { z } from "zod";
import { ApiError, errorResponse } from "@/lib/api/error";
import { apiRequest } from "@/lib/api/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address.") });

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return Response.json({ message: "Enter a valid email address.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    return Response.json(await apiRequest("/auth/password-reset/request", { method: "POST", body: JSON.stringify(parsed.data) }));
  } catch (error) {
    return errorResponse(error instanceof ApiError ? error : error);
  }
}
