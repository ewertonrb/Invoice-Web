import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";
import { clearToken } from "@/lib/auth/session";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  await clearToken();
  return new Response(null, { status: 204 });
}
