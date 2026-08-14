import { render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";
import { WorkerList } from "./worker-list";
vi.mock("./hooks", () => ({ useWorkers: () => ({ data: [{ workerProfileId: 1, fullName: "Alex", email: "alex@example.com", phone: "0400123456", abn: "12345678901", gstRegistered: true, status: "COMPLETE", membershipStatus: "ACTIVE", profileComplete: true }], isPending: false, isError: false, isSuccess: true }) }));
describe("worker list privacy", () => { it("masks phone and ABN in summary cards", () => { render(<WorkerList companyId={7} />); expect(screen.getByText("040••••56")).toBeInTheDocument(); expect(screen.getByText("•• ••• ••• 901")).toBeInTheDocument(); expect(screen.queryByText("0400123456")).not.toBeInTheDocument(); expect(screen.queryByText("12345678901")).not.toBeInTheDocument(); }); });
