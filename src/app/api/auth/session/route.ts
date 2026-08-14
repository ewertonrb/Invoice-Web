import { ApiError, errorResponse } from "@/lib/api/error";
import { clearToken } from "@/lib/auth/session";
import { getSession } from "@/lib/auth/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return Response.json({ message: "Unauthenticated." }, { status: 401 });
    return Response.json(session);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) await clearToken();
    return errorResponse(error);
  }
}
