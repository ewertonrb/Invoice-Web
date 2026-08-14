import { clearToken } from "@/lib/auth/session";
import { safeInternalPath } from "@/lib/auth/redirect";

export async function GET(request: Request) {
  await clearToken();
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const login = new URL("/login", request.url);
  if (next) login.searchParams.set("next", safeInternalPath(next));
  return Response.redirect(login, 303);
}
