import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const session = vi.hoisted(() => ({ getToken: vi.fn(), clearToken: vi.fn() }));
vi.mock("@/lib/auth/session", () => session);
import { GET } from "./route";
import { POST } from "./accept/route";
beforeEach(() => { vi.clearAllMocks(); session.getToken.mockResolvedValue("session-token"); vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })); });
afterEach(() => vi.restoreAllMocks());
const accept = (body: string, origin = "https://invoice.example") => POST(new Request("https://invoice.example/api/public-join-links/accept", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body }));

describe("public join-link BFF", () => {
  it("requires a token and always sets no-store", async () => { const response = await GET(new Request("https://invoice.example/api/public-join-links")); expect(response.status).toBe(400); expect(response.headers.get("cache-control")).toBe("no-store"); expect(fetch).not.toHaveBeenCalled(); });
  it("inspects anonymously with encoded token, no auth, and no-store", async () => { const response = await GET(new Request("https://invoice.example/api/public-join-links?token=a%2Bb%2Fc")); const [url, init] = vi.mocked(fetch).mock.calls[0]; expect(response.headers.get("cache-control")).toBe("no-store"); expect(String(url)).toContain("/public/join-links?token=a%2Bb%2Fc"); expect(init?.cache).toBe("no-store"); expect(new Headers(init?.headers).has("Authorization")).toBe(false); });
  it("requires an authenticated session before parsing or forwarding", async () => { session.getToken.mockResolvedValue(null); const response = await accept(JSON.stringify({ token: "raw" })); expect(response.status).toBe(401); expect(fetch).not.toHaveBeenCalled(); });
  it("forwards only the token with session authorization and without caching", async () => { const response = await accept(JSON.stringify({ token: "raw", email: "ignored@example.com", password: "ignored" })); const [, init] = vi.mocked(fetch).mock.calls[0]; expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store"); expect(init).toMatchObject({ method: "POST", body: JSON.stringify({ token: "raw" }), cache: "no-store" }); expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer session-token"); });
  it("rejects cross-origin before forwarding", async () => { const response = await accept("{}", "https://evil.example"); expect(response.status).toBe(403); expect(response.headers.get("cache-control")).toBe("no-store"); expect(fetch).not.toHaveBeenCalled(); });
  it("returns 400 and no-store for malformed JSON", async () => { const response = await accept("{"); expect(response.status).toBe(400); expect(response.headers.get("cache-control")).toBe("no-store"); expect(fetch).not.toHaveBeenCalled(); });
  it("clears the session when upstream rejects authorization", async () => { vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 401 })); const response = await accept(JSON.stringify({ token: "raw" })); expect(response.status).toBe(401); expect(session.clearToken).toHaveBeenCalledOnce(); });
});
