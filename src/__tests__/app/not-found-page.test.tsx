/**
 * src/__tests__/app/not-found-page.test.tsx
 *
 * The global 404 page: replaces the per-share-page inline "not found"
 * blocks (which returned 200). Must link home.
 */

import { render, screen } from "@testing-library/react";
import NotFound, { metadata } from "@/app/not-found";

describe("NotFound page", () => {
  it("renders the heading and line", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
    expect(screen.getByText("This link doesn't go anywhere on Crumbify.")).toBeInTheDocument();
  });

  it("links back to the homepage", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: "Back to Crumbify" })).toHaveAttribute("href", "/");
  });

  it("exports its own title", () => {
    expect(metadata.title).toBe("Page not found - Crumbify");
  });
});
