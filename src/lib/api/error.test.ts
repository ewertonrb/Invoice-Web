import { describe, expect, it, vi } from "vitest";
import { ApiError, errorResponse } from "./error";

describe("errorResponse", () => {
  it("returns 400 for malformed JSON", async () => {
    const response = errorResponse(new SyntaxError("Unexpected end of JSON input"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: "The request body must contain valid JSON.",
    });
  });

  it("preserves expected API error status and fields", async () => {
    const response = errorResponse(new ApiError(422, "Invalid input.", { email: "Required" }));

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      message: "Invalid input.",
      errors: { email: "Required" },
    });
  });

  it("does not disclose unexpected error details", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = errorResponse(new Error("database password leaked"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      message: "The service is temporarily unavailable.",
    });
    consoleError.mockRestore();
  });
});
