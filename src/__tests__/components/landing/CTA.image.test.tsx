import { render } from "@testing-library/react";
import { CTA } from "@/components/landing/CTA";

describe("CTA image", () => {
  it("renders the full-bleed decorative photo through next/image with sizes 100vw", () => {
    const { container } = render(<CTA />);
    const img = container.querySelector(".cta-media img") as HTMLImageElement;
    expect(img.getAttribute("srcset")).toContain(
      `/_next/image?url=${encodeURIComponent("/media/food/cta-dark.jpg")}`
    );
    expect(img.getAttribute("sizes")).toBe("100vw");
    expect(img.getAttribute("alt")).toBe("");
    expect(img.getAttribute("loading")).toBe("lazy");
  });
});
