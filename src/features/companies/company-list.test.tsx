import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompanyList } from "./company-list";
import { useCompany } from "./hooks";

vi.mock("./hooks", () => ({ useCompany: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("CompanyList", () => {
  it("shows the nominal active and GST fields without swapping them", () => {
    vi.mocked(useCompany).mockReturnValue({
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        id: 7,
        name: "Acme Labour",
        abn: "12 345 678 901",
        email: "accounts@acme.test",
        phone: null,
        address: null,
        active: true,
        contractorInvoiceGstEnabled: false,
        createdAt: "2026-08-06T09:00:00",
        updatedAt: "2026-08-06T10:00:00",
      },
    } as ReturnType<typeof useCompany>);

    render(<CompanyList companyId={7} />);

    expect(useCompany).toHaveBeenCalledWith(7);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Contractor GST").nextElementSibling).toHaveTextContent("Disabled");
    expect(screen.getByRole("link", { name: /view/i })).toHaveAttribute("href", "/companies/7");
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute("href", "/companies/7/edit");
  });

  it("renders an announced loading state", () => {
    vi.mocked(useCompany).mockReturnValue({ isPending: true, isError: false, isSuccess: false } as ReturnType<typeof useCompany>);
    render(<CompanyList companyId={7} />);
    expect(screen.getByLabelText("Loading companies")).toBeInTheDocument();
  });
});
