/**
 * src/__tests__/components/landing/Hero.test.tsx
 *
 * The free waitlist ended on 2026-10-02: the hero must not render an email
 * signup (WaitlistForm removed), and must keep the store badges block.
 */

import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/landing/Hero";

jest.mock("@/components/landing/HeroMap", () => ({ HeroMap: () => <div data-testid="hero-map" /> }));

describe("Hero", () => {
  it("renders no email input and no waitlist form", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector(".waitlist-form")).toBeNull();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.textContent ?? "").not.toMatch(/waitlist/i);
  });

  it("keeps the H1 and puts the plain what-it-is sentence directly under it", () => {
    const { container } = render(<Hero />);
    // The H1 breaks across a <br />, so match the two halves around it.
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /^Your city, scored\s*by the people you trust\.$/,
    );
    const sub = container.querySelector("p.sub");
    expect(sub?.textContent).toBe(
      "Crumbify is a social food app for iPhone for finding, rating and saving restaurants with your friends. Every pin is a real spot a friend has been to, scored out of ten.",
    );
  });

  it("still renders the store badges block", () => {
    render(<Hero />);
    expect(screen.getByTestId("store-badges")).toBeInTheDocument();
  });
});
