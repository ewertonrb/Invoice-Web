export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

export function forbiddenOrigin(): Response {
  return Response.json({ message: "Request origin is not allowed." }, { status: 403 });
}
