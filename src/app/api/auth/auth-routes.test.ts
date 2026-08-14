import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api/error";

const sessionMocks = vi.hoisted(() => ({
  clearToken: vi.fn(),
  getToken: vi.fn(),
  setToken: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  SESSION_COOKIE: "invoice_session",
  ...sessionMocks,
}));

vi.mock("@/lib/api/server", () => apiMocks);

import { GET as clearSession } from "./clear-session/route";
import { POST as login } from "./login/route";
import { POST as selectCompany } from "./select-company/route";

function jsonRequest(path: string, body: string): Request {
  return new Request(`https://invoice.example${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://invoice.example",
    },
    body,
  });
}

describe("authentication Route Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionMocks.getToken.mockResolvedValue("valid-session-token");
  });

  it("returns 400 for malformed login JSON without calling the backend", async () => {
    const response = await login(jsonRequest("/api/auth/login", "{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "The request body must contain valid JSON.",
    });
    expect(apiMocks.apiRequest).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed company-selection JSON without calling the backend", async () => {
    const response = await selectCompany(jsonRequest("/api/auth/select-company", "{"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "The request body must contain valid JSON.",
    });
    expect(apiMocks.apiRequest).not.toHaveBeenCalled();
  });

  it("clears a stale session when login receives a backend 401", async () => {
    apiMocks.apiRequest.mockRejectedValueOnce(new ApiError(401, "Invalid credentials."));

    const response = await login(jsonRequest(
      "/api/auth/login",
      JSON.stringify({ email: "person@example.com", password: "password" }),
    ));

    expect(response.status).toBe(401);
    expect(sessionMocks.clearToken).toHaveBeenCalledOnce();
    expect(sessionMocks.setToken).not.toHaveBeenCalled();
  });

  it("clears the cookie and preserves a safe next path", async () => {
    const response = await clearSession(new Request(
      "https://invoice.example/api/auth/clear-session?next=%2Finvitations%2Faccept%3Ftoken%3Dabc",
    ));

    expect(sessionMocks.clearToken).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://invoice.example/login?next=%2Finvitations%2Faccept%3Ftoken%3Dabc");
  });

  it("falls back to dashboard when clear-session receives an external next", async () => {
    const response = await clearSession(new Request(
      "https://invoice.example/api/auth/clear-session?next=https://attacker.example",
    ));

    expect(sessionMocks.clearToken).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://invoice.example/login?next=%2Fdashboard");
  });
});
