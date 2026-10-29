import { render } from "@testing-library/react";
import { Groups } from "@/components/landing/Groups";

describe("Groups images", () => {
  it("renders the face avatars through next/image at 36px", () => {
    const { container } = render(<Groups />);
    const faces = container.querySelectorAll(".faces img.av");
    expect(faces).toHaveLength(4);
    faces.forEach((img) => {
      expect(img.getAttribute("srcset")).toContain("/_next/image?url=%2Fmedia%2Fpeople%2F");
      expect(img.getAttribute("width")).toBe("36");
      expect(img.getAttribute("height")).toBe("36");
      expect(img.getAttribute("alt")).toBe("");
    });
  });

  it("renders the 50px row thumbnails through next/image with matching sizes", () => {
    const { container } = render(<Groups />);
    const pics = container.querySelectorAll(".grow .pic img");
    expect(pics).toHaveLength(3);
    pics.forEach((img) => {
      expect(img.getAttribute("srcset")).toContain("/_next/image?url=%2Fmedia%2Ffood%2F");
      expect(img.getAttribute("sizes")).toBe("50px");
      expect(img.getAttribute("alt")).toBe("");
      expect(img.getAttribute("loading")).toBe("lazy");
    });
  });
});
