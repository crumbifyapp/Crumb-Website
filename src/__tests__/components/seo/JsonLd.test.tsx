import { render } from "@testing-library/react";
import { JsonLd } from "@/components/seo/JsonLd";

describe("JsonLd", () => {
  it("renders a ld+json script that parses back to the data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "Crumbify" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({ "@type": "Thing", name: "Crumbify" });
  });

  it("escapes < so a value cannot break out of the script tag", () => {
    const { container } = render(<JsonLd data={{ name: "</script><script>alert(1)</script>" }} />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(script.innerHTML).not.toContain("</script>");
    expect(script.innerHTML).not.toContain("<");
    expect(JSON.parse(script.innerHTML).name).toBe("</script><script>alert(1)</script>");
  });
});
