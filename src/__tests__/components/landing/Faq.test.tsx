import { render, screen } from "@testing-library/react";
import { Faq } from "@/components/landing/Faq";
import { FAQS } from "@/components/landing/faq-data";

describe("Faq", () => {
  it("renders every question as an h3 and every answer visibly", () => {
    render(<Faq />);
    expect(FAQS).toHaveLength(5);
    for (const { question, answer } of FAQS) {
      expect(screen.getByRole("heading", { level: 3, name: question })).toBeInTheDocument();
      expect(screen.getByText(answer)).toBeInTheDocument();
    }
  });

  it("is the #faq section with an h2 and no collapsible markup", () => {
    const { container } = render(<Faq />);
    expect(container.querySelector("section#faq.faq")).not.toBeNull();
    expect(
      screen.getByRole("heading", { level: 2, name: /Questions, answered/ }),
    ).toBeInTheDocument();
    expect(container.querySelector("details")).toBeNull();
    expect(container.querySelector("[aria-expanded]")).toBeNull();
  });

  it("embeds FAQPage JSON-LD built from the same FAQS", () => {
    const { container } = render(<Faq />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.map((q: { name: string }) => q.name)).toEqual(
      FAQS.map((f) => f.question),
    );
  });
});

describe("FAQS copy", () => {
  const text = FAQS.map((f) => `${f.question} ${f.answer}`).join(" ");

  it("contains no em or en dashes", () => {
    expect(text).not.toMatch(/[–—]/);
  });

  it("contains no money figures", () => {
    expect(text).not.toMatch(/£|\$/);
  });
});
