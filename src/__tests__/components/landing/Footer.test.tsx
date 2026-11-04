/**
 * src/__tests__/components/landing/Footer.test.tsx
 *
 * The map credit lives on the hero map, not in the footer.
 */

import { render } from "@testing-library/react";
import { Footer } from "@/components/landing/Footer";

describe("Footer", () => {
  it("does not contain the map credit", () => {
    const { container } = render(<Footer />);
    expect(container.textContent ?? "").not.toContain("CARTO");
  });
});
