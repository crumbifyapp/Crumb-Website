import { render, screen, within } from "@testing-library/react";
import { ContactLinks } from "@/components/legal/ContactLinks";

const SUPPORT_HREF = "mailto:support@crumbify.co.uk";

describe("ContactLinks (D423 one card)", () => {
  it("renders exactly one mailto:support@crumbify.co.uk link", () => {
    const { container } = render(<ContactLinks />);
    const mailLinks = container.querySelectorAll(`a[href="${SUPPORT_HREF}"]`);
    expect(mailLinks).toHaveLength(1);
  });

  it("titles the single email card 'Email us' with the combined sub-line and visible address", () => {
    render(<ContactLinks />);
    const link = screen.getByRole("link", { name: /Email us/ });
    expect(link.getAttribute("href")).toBe(SUPPORT_HREF);
    expect(within(link).getByText("Email us")).toBeTruthy();
    expect(
      within(link).getByText("Help, account, sponsors and everything else")
    ).toBeTruthy();
    expect(within(link).getByText("support@crumbify.co.uk")).toBeTruthy();
  });

  it("drops the old two-card labels", () => {
    render(<ContactLinks />);
    expect(screen.queryByText("Help and account support")).toBeNull();
    expect(screen.queryByText("Sponsors and everything else")).toBeNull();
  });

  it("keeps the X card unchanged", () => {
    render(<ContactLinks />);
    const x = screen.getByRole("link", { name: /Twitter \/ X/ });
    expect(x.getAttribute("href")).toBe("https://x.com/crumbifyco");
    expect(x.getAttribute("target")).toBe("_blank");
  });
});
