import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorPanel } from "./ui";

afterEach(cleanup);

describe("ErrorPanel", () => {
  it("announces the error and exposes a working retry action", () => {
    const retry = vi.fn();
    render(<ErrorPanel message="Network unavailable" retry={retry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Network unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it("does not render a dead retry control", () => {
    render(<ErrorPanel message="Access denied" />);
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
  });
});
