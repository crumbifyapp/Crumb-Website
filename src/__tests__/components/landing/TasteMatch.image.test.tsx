import { render } from "@testing-library/react";
import { TasteMatch } from "@/components/landing/TasteMatch";

describe("TasteMatch images", () => {
  it("renders the two 62px match avatars through next/image", () => {
    const { container } = render(<TasteMatch />);
    const avs = container.querySelectorAll(".match-top img.av");
    expect(avs).toHaveLength(2);
    avs.forEach((img) => {
      expect(img.getAttribute("srcset")).toContain("/_next/image?url=%2Fmedia%2Fpeople%2F");
      expect(img.getAttribute("width")).toBe("62");
      expect(img.getAttribute("height")).toBe("62");
      expect(img.getAttribute("alt")).toBe("");
    });
  });

  it("renders the 54px recommendation thumbnails through next/image with matching sizes", () => {
    const { container } = render(<TasteMatch />);
    const pics = container.querySelectorAll(".reco .pic img");
    expect(pics).toHaveLength(3);
    pics.forEach((img) => {
      expect(img.getAttribute("srcset")).toContain("/_next/image?url=%2Fmedia%2Ffood%2F");
      expect(img.getAttribute("sizes")).toBe("54px");
      expect(img.getAttribute("alt")).toBe("");
      expect(img.getAttribute("loading")).toBe("lazy");
    });
  });
});
