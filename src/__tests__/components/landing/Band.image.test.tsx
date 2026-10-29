import { render, screen } from "@testing-library/react";
import { Band } from "@/components/landing/Band";

describe("Band image", () => {
  it("renders the full-bleed photo through next/image with sizes 100vw", () => {
    const { container } = render(<Band />);
    const img = container.querySelector(".band-media img") as HTMLImageElement;
    expect(img.getAttribute("srcset")).toContain(
      `/_next/image?url=${encodeURIComponent("/media/food/band-overhead.jpg")}`
    );
    expect(img.getAttribute("sizes")).toBe("100vw");
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(screen.getByAltText("restaurant table shot from above")).toBe(img);
  });
});
