import { cookies } from "next/headers";

export const SESSION_COOKIE = "invoice_session";

const cookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  ...(maxAge ? { maxAge } : {}),
});

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function setToken(token: string, expiresIn: number): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresIn));
}

export async function clearToken(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}
