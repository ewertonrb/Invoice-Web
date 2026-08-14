import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { POST } from "./[action]/route";

beforeEach(() => vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })));
afterEach(() => vi.restoreAllMocks());
const upstream = (body: unknown, status = 200) => vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));
const post = (action: string, body: string, origin = "https://invoice.example") => POST(new Request(`https://invoice.example/api/public-invitations/${action}`, { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body }), { params: Promise.resolve({ action }) });

describe("public invitation BFF", () => {
  it("rejects anonymous inspection without a token", async () => { const response = await GET(new Request("https://invoice.example/api/public-invitations")); expect(response.status).toBe(400); expect(fetch).not.toHaveBeenCalled(); });
  it("forwards anonymous inspection with encoded token and no authorization", async () => { upstream({ valid: true }); const response = await GET(new Request("https://invoice.example/api/public-invitations?token=a%2Bb%2Fc")); expect(response.status).toBe(200); const [url, init] = vi.mocked(fetch).mock.calls[0]; expect(String(url)).toContain("/public/invitations?token=a%2Bb%2Fc"); expect(new Headers(init?.headers).has("Authorization")).toBe(false); });
  it.each(["accept", "decline"])("forwards same-origin anonymous %s", async (action) => { upstream({ ok: true }); const response = await post(action, JSON.stringify({ token: "raw" })); expect(response.status).toBe(200); const [url, init] = vi.mocked(fetch).mock.calls[0]; expect(String(url)).toContain(`/public/invitations/${action}`); expect(init).toMatchObject({ method: "POST", body: JSON.stringify({ token: "raw" }) }); expect(new Headers(init?.headers).has("Authorization")).toBe(false); });
  it("rejects cross-origin POST before forwarding", async () => { const response = await post("accept", "{}", "https://evil.example"); expect(response.status).toBe(403); expect(fetch).not.toHaveBeenCalled(); });
  it("returns 400 for malformed JSON", async () => { const response = await post("accept", "{"); expect(response.status).toBe(400); expect(fetch).not.toHaveBeenCalled(); });
  it("enforces the action allowlist before parsing or forwarding", async () => { const response = await post("delete-all", "{"); expect(response.status).toBe(404); expect(fetch).not.toHaveBeenCalled(); });
});
