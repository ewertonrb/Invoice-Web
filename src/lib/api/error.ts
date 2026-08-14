export interface ApiErrorPayload {
  status?: number;
  error?: string;
  message?: string;
  errors?: Record<string, string> | null;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fields: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function toApiError(response: Response): Promise<ApiError> {
  const fallback = response.status === 401
    ? "Invalid email or password."
    : "Could not complete the request.";

  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return new ApiError(response.status, payload.message || fallback, payload.errors || {});
  } catch {
    return new ApiError(response.status, fallback);
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof SyntaxError) {
    return Response.json(
      { message: "The request body must contain valid JSON." },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return Response.json(
      { message: error.message, errors: error.fields },
      { status: error.status },
    );
  }

  console.error("BFF request failed", error instanceof Error ? error.message : "Unknown error");
  return Response.json(
    { message: "The service is temporarily unavailable." },
    { status: 503 },
  );
}
