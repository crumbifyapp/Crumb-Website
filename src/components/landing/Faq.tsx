import { JsonLd } from "@/components/seo/JsonLd";
import { faqPageJsonLd } from "@/lib/structured-data";
import { FAQS } from "./faq-data";

// Static list on purpose (no accordion): every answer is in the server HTML.
export function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="wrap">
        <div className="faq-head reveal">
          <span className="eyebrow">FAQ</span>
          <h2>
            Questions, <em className="s">answered</em>.
          </h2>
        </div>
        <div className="faq-list stagger">
          {FAQS.map((faq) => (
            <div className="faq-item reveal" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <JsonLd data={faqPageJsonLd(FAQS)} />
    </section>
  );
}
