import { render } from "@testing-library/react";
import { FeedCard } from "@/components/landing/FeedCard";
import { posts } from "@/components/landing/data";

describe("FeedCard images", () => {
  const post = posts[0];

  it("serves the food photo through next/image with a right-sized sizes hint and lazy loading", () => {
    const { container } = render(<FeedCard post={post} />);
    const img = container.querySelector(".pic img") as HTMLImageElement;
    expect(img.getAttribute("srcset")).toContain(
      `/_next/image?url=${encodeURIComponent(`/media/food/${post.food}`)}`
    );
    expect(img.getAttribute("sizes")).toBe("(max-width: 640px) min(82vw, 320px), 324px");
    expect(img.getAttribute("alt")).toBe(post.place);
    expect(img.getAttribute("loading")).toBe("lazy");
    expect(img).toHaveAttribute("width");
    expect(img).toHaveAttribute("height");
  });

  it("serves the avatar through next/image at its 38px display size and keeps the av class", () => {
    const { container } = render(<FeedCard post={post} />);
    const av = container.querySelector("img.av") as HTMLImageElement;
    expect(av.getAttribute("srcset")).toContain(
      `/_next/image?url=${encodeURIComponent(`/media/people/${post.person}`)}`
    );
    expect(av.getAttribute("width")).toBe("38");
    expect(av.getAttribute("height")).toBe("38");
    expect(av.getAttribute("alt")).toBe("");
  });
});
