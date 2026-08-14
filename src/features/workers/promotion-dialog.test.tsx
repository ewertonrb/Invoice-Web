import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WorkerDetail } from "./worker-detail";

const promote = { mutate: vi.fn(), isPending: false, error: null };
const worker = { id: 1, appUserId: 2, fullName: "Alex Worker", email: "alex@example.com", abn: null, gstRegistered: false, phone: null, status: "COMPLETE", membershipId: 12, membershipRole: "WORKER", membershipStatus: "ACTIVE", completedAt: null, bankDetails: null, superDetails: null, notes: null, createdAt: "2026-01-01", updatedAt: "2026-01-01" };
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("./hooks", () => ({ useWorker: () => ({ data: worker, isPending: false, isError: false }), useWorkerStatus: () => ({ mutate: vi.fn(), isPending: false, error: null }), usePromoteWorker: () => promote }));

describe("worker promotion UI", () => {
  it.each(["OWNER", "ADMIN"] as const)("shows the promotion action for %s", (role) => { const { unmount } = render(<WorkerDetail companyId={7} workerId={1} actorRole={role} />); expect(screen.getByRole("button", { name: "Promote worker" })).toBeInTheDocument(); unmount(); });
  it.each(["MANAGER", "FINANCE", "WORKER"] as const)("hides promotion from %s", (role) => { const { unmount } = render(<WorkerDetail companyId={7} workerId={1} actorRole={role} />); expect(screen.queryByRole("button", { name: "Promote worker" })).not.toBeInTheDocument(); unmount(); });
  it("requires an explicit MANAGER or FINANCE choice before confirmation", () => { render(<WorkerDetail companyId={7} workerId={1} actorRole="OWNER" />); fireEvent.click(screen.getByRole("button", { name: "Promote worker" })); const dialog = screen.getByRole("alertdialog", { name: "Promote worker" }); expect(dialog).toHaveAttribute("aria-modal", "true"); const manager = screen.getByRole("radio", { name: "MANAGER" }); const finance = screen.getByRole("radio", { name: "FINANCE" }); expect(manager).not.toBeChecked(); expect(finance).not.toBeChecked(); const confirm = screen.getByRole("button", { name: "Choose a role" }); expect(confirm).toBeDisabled(); expect(screen.queryByText("OWNER", { selector: "label" })).not.toBeInTheDocument(); fireEvent.click(finance); expect(finance).toBeChecked(); expect(screen.getByRole("button", { name: "Promote to FINANCE" })).toBeEnabled(); });
});
