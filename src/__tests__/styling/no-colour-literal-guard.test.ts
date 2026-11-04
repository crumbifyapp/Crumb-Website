/**
 * Colour guard (rebrand 1.4.2, "nothing stale").
 *
 * CHECK 1. A colour literal (`#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()`, `hsl()`, `hsla()`,
 * including inside a Tailwind arbitrary value such as `text-[#abc123]`) may live only in the two
 * token files and the few files that cannot read a token. Everything else reads a `crumb-*`
 * token. `.ts` and `.tsx` are parsed with the TypeScript AST, so a comment never reaches the
 * check; `.css` has its `/* *\/` comments stripped first.
 *
 * CHECK 2. The retired brand colours (the cream, gold and brown palette) appear nowhere in src,
 * not even in the token files or in other tests, outside comments. This file is the one
 * exception because it has to name them.
 *
 * A template that BUILDS a colour from variables (`rgba(${r},${g},${b},${a})`) is a formula, not
 * a literal. In-page anchors (`href="#feed"`, and `#feed` is valid 4-digit hex) are not colours.
 * HTML entities such as `&#8592;` are not colours.
 */
import { readFileSync, readdirSync } from "fs";
import path from "path";
import ts from "typescript";

const SRC_ROOT = path.resolve(__dirname, "..", "..");
const GLOBALS_CSS = path.join(SRC_ROOT, "app", "globals.css");
const LAYOUT_TSX = path.join(SRC_ROOT, "app", "layout.tsx");
const THIS_FILE = path.basename(__filename);
const SOURCE_EXTENSION = /\.(ts|tsx|css)$/;

/** Files that may hold colour literals, relative to src/ with forward slashes. */
const LITERAL_ALLOWED_FILES: ReadonlySet<string> = new Set([
  "app/globals.css", // token file
  "app/landing.css", // token file
  "components/landing/data.ts", // score ramp and official store badge art
  "components/landing/StoreBadges.tsx", // official store badge art
]);
/** layout.tsx may hold only the themeColor literal, and only while it equals this token. */
const LAYOUT_REL_PATH = "app/layout.tsx";
const THEME_COLOUR_TOKEN = "--color-crumb-light-bg";

type Hit = { readonly line: number; readonly literal: string };

// ---------------------------------------------------------------------------
// Patterns
// ---------------------------------------------------------------------------

/**
 * Hex of a legal length not preceded by `&` (an HTML entity such as `&#8592;`), or a functional
 * colour whose first argument is a number (an underscore before it, as in a Tailwind
 * arbitrary value, still counts). `rgba(${r}` and `rgb(var(--x)` are not literals.
 */
const COLOUR_LITERAL_RE =
  /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b|(?<![A-Za-z])(?:rgba?|hsla?)\(\s*[\d.]/gi;

const RETIRED_HEX = [
  "E6C39B", "C9A077", "F4ECE1", "F4ECDF", "EFE5D8", "EFE5D6", "FFFDF9", "E4D8C7", "1A1208", "5A4C3A",
  "8A7A62", "8A7A68", "4A3F33", "C4B09A", "9B8272", "241712", "D8B489", "0E0805", "2A2118", "8A7060",
  "E0D5C9", "EDE2D5", "C4513D", "E5D6C2", "CDBFAD", "B6A488", "8F7D63", "D8CAB3", "3A2C1A", "6F6049",
  "4D3F2C", "6B5B45", "EADFCF", "E1D3BF", "2A1D10", "221708", "D4C9BC", "8B7355", "3D2B1F",
  "D8663F",
] as const;

const RETIRED_RGB_TRIPLETS: ReadonlyArray<readonly [number, number, number]> = [
  [230, 195, 155],
  [244, 236, 225],
  [26, 18, 8],
  [40, 26, 10],
  [139, 115, 85],
  [255, 253, 249],
  [216, 102, 63],
];

/** Retired hex (any case, an alpha suffix still counts) or a retired triplet in rgb()/rgba(). */
const RETIRED_RE = new RegExp(
  `(?<![&\\w])#(?:${RETIRED_HEX.join("|")})|` +
    RETIRED_RGB_TRIPLETS.map(
      ([r, g, b]) => `(?<![A-Za-z])rgba?\\(\\s*${r}[\\s,]+${g}[\\s,]+${b}\\b`,
    ).join("|"),
  "gi",
);

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

type StringPart = { readonly text: string; readonly line: number; readonly node?: ts.Node };

function tsStringParts(source: string, fileName: string): readonly StringPart[] {
  const kind = fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, kind);
  const parts: StringPart[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      parts.push({ text: node.text, line, node });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return parts;
}

/** CSS with comments blanked (newlines kept, so line numbers stay true), one part per line. */
function cssParts(source: string): readonly StringPart[] {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "));
  return stripped.split("\n").map((text, i) => ({ text, line: i + 1 }));
}

function partsOf(source: string, fileName: string): readonly StringPart[] {
  return fileName.endsWith(".css") ? cssParts(source) : tsStringParts(source, fileName);
}

function propertyName(name: ts.PropertyName): string {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : "";
}

/** True when the node is the value of an `href` JSX attribute or an `href` object property. */
function isHrefValue(node: ts.Node | undefined): boolean {
  if (!node) return false;
  let parent = node.parent;
  if (parent && ts.isJsxExpression(parent)) parent = parent.parent;
  if (!parent) return false;
  if (ts.isJsxAttribute(parent)) return parent.name.getText() === "href";
  return ts.isPropertyAssignment(parent) && propertyName(parent.name) === "href";
}

const BARE_ANCHOR = /^#\w+$/;

function matchesIn(
  parts: readonly StringPart[],
  pattern: RegExp,
  skip: (part: StringPart, literal: string) => boolean = () => false,
): readonly Hit[] {
  return parts.flatMap((part) =>
    [...part.text.matchAll(pattern)]
      .filter((m) => !skip(part, m[0]))
      .map((m) => ({
        // A multi-line template or CSS block: add the newlines before the match.
        line: part.line + part.text.slice(0, m.index).split("\n").length - 1,
        literal: m[0],
      })),
  );
}

/** Check 1. Colour literals; an exact `#word` href value is an anchor, not a colour. */
function findColourLiterals(
  source: string,
  fileName: string,
  allowedLiteral: (literal: string) => boolean = () => false,
): readonly Hit[] {
  return matchesIn(
    partsOf(source, fileName),
    COLOUR_LITERAL_RE,
    (part, literal) =>
      allowedLiteral(literal) || (BARE_ANCHOR.test(part.text) && isHrefValue(part.node)),
  );
}

/** Check 2. Retired brand colours, everywhere, no exemptions. */
function findRetiredColours(source: string, fileName: string): readonly Hit[] {
  return matchesIn(partsOf(source, fileName), RETIRED_RE);
}

function format(file: string, hits: readonly Hit[]): string[] {
  return hits.map((hit) => `${file}:${hit.line} ${hit.literal}`);
}

function listSourceFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return SOURCE_EXTENSION.test(entry.name) ? [full] : [];
  });
}

const rel = (file: string): string => path.relative(SRC_ROOT, file).split(path.sep).join("/");

function readThemeColourToken(css: string): string {
  const m = css.match(new RegExp(`${THEME_COLOUR_TOKEN}\\s*:\\s*([^;]+);`));
  if (!m) throw new Error(`${THEME_COLOUR_TOKEN} is not declared in globals.css`);
  return m[1].trim();
}

function readViewportThemeColour(layout: string): string {
  const m = layout.match(/themeColor\s*:\s*["']([^"']+)["']/);
  if (!m) throw new Error("layout.tsx exports no literal viewport themeColor");
  return m[1];
}

// ---------------------------------------------------------------------------
// The real tree
// ---------------------------------------------------------------------------

describe("no colour literal outside the token files", () => {
  const themeColour = readThemeColourToken(readFileSync(GLOBALS_CSS, "utf8")).toLowerCase();

  it("every other src file reads a token instead of a hex or rgb literal", () => {
    const offenders = listSourceFiles(SRC_ROOT).flatMap((file) => {
      const relPath = rel(file);
      if (relPath.startsWith("__tests__/") || LITERAL_ALLOWED_FILES.has(relPath)) return [];
      const allowed = relPath === LAYOUT_REL_PATH ? (l: string) => l.toLowerCase() === themeColour : undefined;
      return format(relPath, findColourLiterals(readFileSync(file, "utf8"), file, allowed));
    });
    expect(offenders).toEqual([]);
  });

  it("layout.tsx themeColor equals the light background token, so the two cannot drift", () => {
    expect(readViewportThemeColour(readFileSync(LAYOUT_TSX, "utf8")).toLowerCase()).toBe(themeColour);
  });

  it("the scan walks the real tree (an empty scan would pass everything)", () => {
    const files = listSourceFiles(SRC_ROOT).map(rel);
    expect(files.length).toBeGreaterThan(30);
    for (const allowed of LITERAL_ALLOWED_FILES) expect(files).toContain(allowed);
    expect(files).toContain(LAYOUT_REL_PATH);
  });
});

describe("retired brand colours appear nowhere in src", () => {
  it("no file, token files and tests included, holds a retired hex or rgb outside a comment", () => {
    const offenders = listSourceFiles(SRC_ROOT).flatMap((file) =>
      path.basename(file) === THIS_FILE
        ? []
        : format(rel(file), findRetiredColours(readFileSync(file, "utf8"), file)),
    );
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Fixtures: the detectors fire, and stay quiet on the look-alikes
// ---------------------------------------------------------------------------

describe("check 1 fixtures", () => {
  const literals = (source: string, fileName = "fixture.tsx"): string[] =>
    findColourLiterals(source, fileName).map((h) => h.literal);

  it("flags a hex in a className, with its line", () => {
    const hits = findColourLiterals('const a = 1;\nconst b = <p className="p-2 text-[#abc123]" />;', "f.tsx");
    expect(hits).toEqual([{ line: 2, literal: "#abc123" }]);
  });

  it("flags short and alpha hex", () => {
    expect(literals("const a = ['#fff', '#11223344'];")).toEqual(["#fff", "#11223344"]);
  });

  it("flags an rgba in an inline style", () => {
    expect(literals('const a = <p style={{ background: "rgba(0, 0, 0, 0.4)" }} />;')).toHaveLength(1);
  });

  it("flags an arbitrary-value shadow", () => {
    expect(literals('const a = "shadow-[0_1px_0_rgba(1,2,3,.4)]";')).toEqual(["rgba(1"]);
  });

  it("flags an rgb() and an hsl() in a CSS string", () => {
    expect(literals("a { color: rgb(1, 2, 3); border-color: hsl(10 20% 30%); }", "f.css")).toEqual([
      "rgb(1",
      "hsl(1",
    ]);
  });

  it("flags an uppercase RGBA() function name", () => {
    expect(literals("const a = 'shadow-[0_1px_0_RGBA(1,2,3,.4)]';")).toEqual(["RGBA(1"]);
  });

  it("flags a template head that hard-codes the channels", () => {
    expect(literals("const a = `rgba(255,255,255,${alpha})`;")).toEqual(["rgba(2"]);
  });

  it("flags a hex that is not used as an href, even when it looks like an anchor", () => {
    expect(literals('const a = <path fill="#feed" />; const b = { colour: "#feed" };')).toEqual(["#feed", "#feed"]);
  });

  it("does not flag an in-page anchor in an href attribute, an expression or an href property", () => {
    expect(
      literals('const a = <a href="#feed">x</a>; const b = <a href={"#top"} />; const c = { href: "#feed", label: "The feed" };'),
    ).toEqual([]);
  });

  it("does not flag a colour that only appears in a comment", () => {
    expect(literals("// color: #ABCDEF\n/* rgba(1,2,3,0.4) */\nconst a = 1;")).toEqual([]);
    expect(literals("a { /* color: #abcdef */ margin: 0; }", "f.css")).toEqual([]);
  });

  it("does not flag an HTML entity", () => {
    expect(literals('const a = <span>&#8592; Back</span>; const b = "&#8592;"; const c = "&#x1F389;";')).toEqual([]);
  });

  it("does not flag a token reference or a bare keyword", () => {
    expect(literals('const a = "bg-crumb-bg text-crumb-text"; const b = "var(--color-crumb-teal)"; const c = "transparent";')).toEqual([]);
  });

  it("does not flag a colour built from variables (a formula)", () => {
    expect(literals("const a = `rgba(${r},${g},${b},${a})`; const b = `hsl(${h}, 66%, ${l}%)`;")).toEqual([]);
  });

  it("does not truncate real code after a // inside a string", () => {
    expect(literals("const u = 'https://example.com'; const c = '#123456';")).toEqual(["#123456"]);
  });

  it("allows only the literal the caller names", () => {
    const source = 'export const viewport = { themeColor: "#E6F0EE", other: "#112233" };';
    const hits = findColourLiterals(source, "layout.tsx", (l) => l.toLowerCase() === "#e6f0ee");
    expect(hits.map((h) => h.literal)).toEqual(["#112233"]);
  });
});

describe("check 2 fixtures", () => {
  const retired = (source: string, fileName = "fixture.tsx"): string[] =>
    findRetiredColours(source, fileName).map((h) => h.literal);

  it("flags a retired hex in either case and an alpha variant", () => {
    expect(retired('const a = ["#e6c39b", "#E6C39B", "#1a1208cc"];')).toEqual(["#e6c39b", "#E6C39B", "#1a1208"]);
  });

  it("flags a retired hex inside a className, a CSS file and a test-style fixture", () => {
    expect(retired('const a = "text-[#C9A077]";')).toEqual(["#C9A077"]);
    expect(retired("a { color: #f4ece1; }", "f.css")).toEqual(["#f4ece1"]);
  });

  it("flags a retired triplet with spaces, commas or both, at any alpha", () => {
    expect(retired('const a = "rgba(230 , 195,155, 0.07)"; const b = "rgb(26 18 8)"; const c = "rgba( 40,26,10,.3)";')).toHaveLength(3);
  });

  it("does not flag a triplet that merely starts the same or a current colour", () => {
    expect(retired('const a = "rgba(230,195,150,1)"; const b = "#79B8AD"; const c = "rgba(121,184,173,0.07)";')).toEqual([]);
  });

  it("does not flag a retired colour that only appears in a comment", () => {
    expect(retired("// was #E6C39B\n/* rgba(230,195,155,0.07) */\nconst a = 1;")).toEqual([]);
    expect(retired("a { /* old #F4ECE1 */ margin: 0; }", "f.css")).toEqual([]);
  });

  it("reports the file, line and literal in the failure message", () => {
    const hits = findRetiredColours("const a = 1;\nconst b = '#E6C39B';", "x.ts");
    expect(format("src/x.ts", hits)).toEqual(["src/x.ts:2 #E6C39B"]);
  });
});
