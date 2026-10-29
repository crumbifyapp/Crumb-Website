import {
  faqPageJsonLd,
  mobileApplicationJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/structured-data";
import { FAQS } from "@/components/landing/faq-data";

const ORG_ID = "https://crumbify.co.uk/#organization";

describe("organizationJsonLd", () => {
  it("describes Crumbify LTD with only the real social profile", () => {
    expect(organizationJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": ORG_ID,
      name: "Crumbify",
      legalName: "Crumbify LTD",
      url: "https://crumbify.co.uk/",
      logo: "https://crumbify.co.uk/images/crumbify-logo.png",
      sameAs: ["https://x.com/crumbifyco"],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@crumbify.co.uk",
      },
    });
  });
});

describe("websiteJsonLd", () => {
  it("links the publisher by @id and declares no SearchAction", () => {
    const site = websiteJsonLd();
    expect(site).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://crumbify.co.uk/#website",
      name: "Crumbify",
      url: "https://crumbify.co.uk/",
      inLanguage: "en-GB",
      publisher: { "@id": ORG_ID },
    });
    expect(site).not.toHaveProperty("potentialAction");
  });
});

describe("mobileApplicationJsonLd", () => {
  it("omits aggregateRating entirely when no rating is passed", () => {
    const app = mobileApplicationJsonLd(null);
    expect(app).toMatchObject({
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "Crumbify",
      operatingSystem: "iOS",
      applicationCategory: "SocialNetworkingApplication",
      description:
        "Crumbify is a social food app for iPhone. Discover restaurants through friends you trust, log everywhere you eat, rate it out of ten and save places to try.",
      url: "https://crumbify.co.uk/",
      installUrl: "https://apps.apple.com/gb/app/crumbify/id6777163992",
      image: "https://crumbify.co.uk/images/app-icon.png",
      offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
      publisher: { "@id": ORG_ID },
    });
    expect(Object.keys(app)).not.toContain("aggregateRating");
  });

  it("adds the passed App Store rating with the 1 to 5 bounds", () => {
    const app = mobileApplicationJsonLd({ ratingValue: 4.8, ratingCount: 12 });
    expect(app.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.8,
      ratingCount: 12,
      bestRating: 5,
      worstRating: 1,
    });
  });
});

describe("faqPageJsonLd", () => {
  it("builds mainEntity from exactly the FAQS array", () => {
    const page = faqPageJsonLd(FAQS);
    expect(page["@type"]).toBe("FAQPage");
    expect(page.mainEntity).toEqual(
      FAQS.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    );
    expect(page.mainEntity).toHaveLength(5);
  });
});
