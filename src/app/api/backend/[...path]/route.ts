import { clearToken, getToken } from "@/lib/auth/session";
import { forbiddenOrigin, isSameOrigin } from "@/lib/auth/request";
import { getApiUrl } from "@/lib/api/server";

const allowedMethods = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);
const ignoredRequestHeaders = new Set(["authorization", "cookie", "host", "content-length"]);

async function handler(request: Request, context: { params: Promise<{ path: string[] }> }) {
  if (!allowedMethods.has(request.method)) return new Response(null, { status: 405 });
  if (request.method !== "GET" && !isSameOrigin(request)) return forbiddenOrigin();
  const token = await getToken();
  if (!token) return Response.json({ message: "Unauthenticated." }, { status: 401 });

  const { path } = await context.params;
  if (path[0] === "auth") return Response.json({ message: "Route not allowed." }, { status: 404 });
  const target = getApiUrl(`/${path.map(encodeURIComponent).join("/")}`);
  target.search = new URL(request.url).search;
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!ignoredRequestHeaders.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    const outgoingHeaders = new Headers();
    const contentType = response.headers.get("content-type");
    const disposition = response.headers.get("content-disposition");
    if (contentType) outgoingHeaders.set("content-type", contentType);
    if (disposition) outgoingHeaders.set("content-disposition", disposition);
    if (response.status === 401) await clearToken();
    return new Response(response.body, { status: response.status, headers: outgoingHeaders });
  } catch {
    return Response.json({ message: "Could not connect to the server." }, { status: 503 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
