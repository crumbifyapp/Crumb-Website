interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Renders one schema.org JSON-LD block. `<` is escaped to the JSON unicode
 * escape `\u003c` so a value containing "</script>" can never break out of
 * the script element.
 */
export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
