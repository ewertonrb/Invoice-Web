import { ApiError, toApiError } from "@/lib/api/error";

export async function changeCurrentPassword(input: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/backend/users/me/password", {
      method: "PATCH",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ApiError(503, "Could not connect to the server.");
  }
  if (response.status === 401) throw new ApiError(401, "Your session has expired.");
  if (!response.ok) throw await toApiError(response);
}
