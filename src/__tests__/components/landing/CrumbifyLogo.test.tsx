import { render, screen } from "@testing-library/react";
import { CrumbifyLogo } from "@/components/landing/CrumbifyLogo";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

describe("CrumbifyLogo", () => {
  it("renders an accessible svg lockup using currentColor paths", () => {
    const { container } = render(<CrumbifyLogo />);
    const svg = screen.getByRole("img", { name: "Crumbify" });
    expect(svg.tagName.toLowerCase()).toBe("svg");
    expect(svg).toHaveClass("logo");
    expect(svg).toHaveAttribute("viewBox", "0 0 1158 1163");
    const path = container.querySelector("path");
    expect(path).not.toBeNull();
    expect(path).toHaveAttribute("fill", "currentColor");
    expect(path).toHaveAttribute("fill-rule", "evenodd");
    expect(path?.getAttribute("d")).toMatch(/^M /);
  });
});

describe("logo placement", () => {
  it("Header brand link is named by the logo, with no duplicate text", () => {
    render(<Header />);
    const brand = screen.getByRole("link", { name: "Crumbify" });
    expect(brand).toHaveAttribute("href", "#top");
    expect(brand.textContent).toBe("");
    expect(brand.querySelector("svg.logo")).not.toBeNull();
  });

  it("Footer keeps the tagline and shows the logo once", () => {
    const { container } = render(<Footer />);
    expect(container.querySelectorAll("svg.logo")).toHaveLength(1);
    expect(screen.getByText("Every bite tells a story.")).toBeInTheDocument();
  });
});
