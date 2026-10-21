/**
 * Tailwind colour tokens guard. Every `crumb-<name>` utility class used under src/ must map to a
 * `--color-crumb-<name>` token declared in the `@theme` block of src/app/globals.css.
 *
 * Tailwind silently drops an unknown utility (no CSS is emitted), so a typo such as
 * `bg-crumb-brown` or `text-crumb-muted` renders as the browser default: a button loses its
 * background and muted text turns white. No runtime test sees that, so this static guard reads
 * the theme and the sources and fails on any class whose token is not defined.
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";

const SRC_ROOT = path.resolve(__dirname, "..", "..");
const GLOBALS_CSS = path.join(SRC_ROOT, "app", "globals.css");

/**
 * Utility prefixes that take a theme colour. `crumb-` after one of these is a colour class.
 * Entries are regex fragments: `border` covers the directional forms (border-t, border-x, ...).
 */
const COLOUR_UTILITIES = [
  "bg",
  "text",
  "text-shadow",
  "border(?:-[xytrblse])?",
  "ring",
  "ring-offset",
  "outline",
  "fill",
  "stroke",
  "from",
  "via",
  "to",
  "shadow",
  "drop-shadow",
  "inset-shadow",
  "inset-ring",
  "divide",
  "decoration",
  "accent",
  "caret",
  "placeholder",
];

const CRUMB_CLASS = new RegExp(
  `(?<![\\w-])(?:[\\w-]+:)*(?:${COLOUR_UTILITIES.join("|")})-crumb-([a-z0-9-]+)`,
  "g",
);

const SOURCE_EXTENSION = /\.(ts|tsx|js|jsx|mdx|css)$/;

/** Token names declared inside the `@theme` block, e.g. `--color-crumb-ink` yields `ink`. */
export function definedCrumbTokens(css: string): Set<string> {
  const themeStart = css.indexOf("@theme");
  if (themeStart < 0) throw new Error("globals.css declares no @theme block");
  const open = css.indexOf("{", themeStart);
  const close = css.indexOf("}", open);
  const block = css.slice(open, close);
  const names = [...block.matchAll(/--color-crumb-([a-z0-9-]+)\s*:/g)].map((m) => m[1]);
  return new Set(names);
}

/** Every `<utility>-crumb-<name>` class in the source whose name is not a defined token. */
export function findUndefinedCrumbClasses(
  source: string,
  defined: ReadonlySet<string>,
): string[] {
  return [...source.matchAll(CRUMB_CLASS)]
    .filter((m) => !defined.has(m[1]))
    .map((m) => m[0]);
}

function listSourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "__tests__") return [];
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return listSourceFiles(fullPath);
    return SOURCE_EXTENSION.test(entry.name) ? [fullPath] : [];
  });
}

function undefinedClassesInSrc(defined: ReadonlySet<string>): string[] {
  return listSourceFiles(SRC_ROOT).flatMap((file) => {
    const rel = path.relative(SRC_ROOT, file);
    return findUndefinedCrumbClasses(readFileSync(file, "utf8"), defined).map(
      (cls) => `${rel}: ${cls}`,
    );
  });
}

describe("crumb-* colour utilities resolve to the @theme tokens", () => {
  const defined = definedCrumbTokens(readFileSync(GLOBALS_CSS, "utf8"));

  it("parses the token names declared in the @theme block", () => {
    expect(defined.size).toBeGreaterThan(0);
    expect(defined.has("ink-deep")).toBe(true);
  });

  it("flags utility classes whose token is not declared", () => {
    const source =
      '<a className="inline-block bg-crumb-brown hover:bg-crumb-dark text-crumb-cream border-t-crumb-nope drop-shadow-crumb-nope">';
    expect(findUndefinedCrumbClasses(source, defined)).toEqual([
      "bg-crumb-brown",
      "hover:bg-crumb-dark",
      "border-t-crumb-nope",
      "drop-shadow-crumb-nope",
    ]);
  });

  it("accepts declared tokens, opacity modifiers and non-utility crumb words", () => {
    const source =
      'className="bg-crumb-ink-deep text-crumb-cream/70 border-crumb-gold"; host = "crumb-website-git-preview"';
    expect(findUndefinedCrumbClasses(source, defined)).toEqual([]);
  });

  it("every crumb-* colour class under src/ uses a declared token", () => {
    expect(undefinedClassesInSrc(defined)).toEqual([]);
  });
});
