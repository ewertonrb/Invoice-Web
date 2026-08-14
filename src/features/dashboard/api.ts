import { z } from "zod";
import { ApiError, toApiError } from "@/lib/api/error";

export const dashboardSummarySchema = z.object({
  pendingReview: z.number(),
  readyToInvoice: z.number(),
  draftInvoices: z.number(),
  outstandingAmount: z.number().or(z.string()).transform(Number).default(0),
  availableShifts: z.number().default(0),
  myShifts: z.number().default(0),
});

async function request(path: string) {
  let response: Response;
  try {
    response = await fetch(`/api/backend${path}`, { cache: "no-store", headers: { Accept: "application/json" } });
  } catch {
    throw new ApiError(503, "Could not connect to the server.");
  }
  if (response.status === 401) {
    window.location.replace("/api/auth/clear-session");
    throw new ApiError(401, "Your session has expired.");
  }
  if (!response.ok) throw await toApiError(response);
  return response.json();
}

export const getDashboardSummary = async () => dashboardSummarySchema.parse(await request("/dashboard/summary"));
