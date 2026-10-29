import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

jest.mock("lenis", () => {
  return jest.fn().mockImplementation(() => ({
    raf: jest.fn(),
    scrollTo: jest.fn(),
    destroy: jest.fn(),
  }));
});

window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }) as unknown as MediaQueryList);

global.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;

// Route by URL: the App Store lookup (server) and the founding counter (client).
global.fetch = jest.fn((url: string) =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve(
        String(url).includes("itunes.apple.com")
          ? { results: [{ averageUserRating: 5, userRatingCount: 6 }] }
          : { count: 10, remaining: 90, closed: false },
      ),
  }),
) as jest.Mock;

describe("Home page composition", () => {
  it("renders the landing sections without crashing", async () => {
    render(await Home());

    expect(screen.getAllByText("Crumbify").length).toBeGreaterThan(0);
    expect(screen.getByText(/Your city, scored/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /loop/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Founding member/i).length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText("10 / 100")).toBeInTheDocument());
  });

  it("places the FAQ between the founding section and the CTA", async () => {
    const { container } = render(await Home());
    const ids = Array.from(container.querySelectorAll("section")).map((s) => s.id);
    expect(ids.indexOf("faq")).toBe(ids.indexOf("founding") + 1);
    expect(ids.indexOf("get-the-app")).toBe(ids.indexOf("faq") + 1);
  });

  it("emits MobileApplication JSON-LD with the live App Store rating", async () => {
    const { container } = render(await Home());
    const blocks = Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
      (s) => JSON.parse(s.innerHTML),
    );
    const app = blocks.find((b) => b["@type"] === "MobileApplication");
    expect(app.aggregateRating).toMatchObject({ ratingValue: 5, ratingCount: 6 });
    expect(blocks.some((b) => b["@type"] === "FAQPage")).toBe(true);
  });

  it("omits aggregateRating when the App Store lookup fails", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error("offline")));
    const { container } = render(await Home());
    const app = Array.from(container.querySelectorAll('script[type="application/ld+json"]'))
      .map((s) => JSON.parse(s.innerHTML))
      .find((b) => b["@type"] === "MobileApplication");
    expect(app).not.toHaveProperty("aggregateRating");
    warn.mockRestore();
  });
});
