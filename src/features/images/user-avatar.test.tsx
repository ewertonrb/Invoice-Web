import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_AVATAR_SRC, UserAvatar } from "./user-avatar";

afterEach(cleanup);

describe("UserAvatar", () => {
  it.each([undefined, null, "", "   "])("uses the default avatar when src is %s", (src) => {
    render(<UserAvatar src={src} name="Alex Worker" />);
    expect(screen.getByAltText("Alex Worker profile photo")).toHaveAttribute("src", DEFAULT_AVATAR_SRC);
  });

  it("keeps a valid avatar and falls back after a loading error", () => {
    render(<UserAvatar src="/avatar/alex.png" name="Alex Worker" />);
    const image = screen.getByAltText("Alex Worker profile photo");
    expect(image).toHaveAttribute("src", "/avatar/alex.png");

    fireEvent.error(image);
    expect(image).toHaveAttribute("src", DEFAULT_AVATAR_SRC);
  });

  it("does not replace a valid new avatar after the source changes", () => {
    const { rerender } = render(<UserAvatar src={null} name="Alex Worker" />);
    rerender(<UserAvatar src="/avatar/new.png" name="Alex Worker" />);
    expect(screen.getByAltText("Alex Worker profile photo")).toHaveAttribute("src", "/avatar/new.png");
  });
});
