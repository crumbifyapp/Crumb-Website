/**
 * Static-analysis guard: every public contact address on the site is
 * support@crumbify.co.uk (owner decisions D421 and D422, 13 Nov 2026: one
 * universal address for user, account, legal, help, sponsor and deletion
 * requests). contact@ and admin@ were retired and must not come back.
 *
 * Scans site source (src/ and tests/e2e/, including the Playwright page
 * objects) for any <name>@crumbify.co.uk literal. Fails on any address other
 * than the canonical support@ address and the explicit allowlist below.
 *
 * src/__tests__ is skipped on purpose: unit-test fixtures use synthetic
 * addresses (one@, two@, anyone@) that are never shown to visitors.
 */

import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

const SCAN_ROOTS = ["src", path.join("tests", "e2e")];

const SCAN_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".html",
  ".css",
  ".txt",
]);

const SKIP_DIR_NAMES = new Set(["node_modules", ".next", "__tests__"]);

/** The single public contact address (D421, D422). */
const CONTACT_ADDRESS = "support@crumbify.co.uk";

/**
 * Explicit allowlist: the only other @crumbify.co.uk address allowed in site
 * source. appreview@ is the App Review demo account's sign-in email (a login
 * for store reviewers, NOT a contact address). Do not add entries without an
 * owner decision.
 */
const ALLOWLIST = new Set<string>(["appreview@crumbify.co.uk"]);

function collectFiles(entryPath: string, out: string[]): void {
  const stat = statSync(entryPath);
  if (stat.isDirectory()) {
    if (SKIP_DIR_NAMES.has(path.basename(entryPath))) return;
    for (const child of readdirSync(entryPath)) {
      collectFiles(path.join(entryPath, child), out);
    }
    return;
  }
  if (stat.isFile() && SCAN_EXTENSIONS.has(path.extname(entryPath))) {
    out.push(entryPath);
  }
}

function gatherSiteFiles(): string[] {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) {
    collectFiles(path.join(REPO_ROOT, root), files);
  }
  return files;
}

function findDisallowedAddresses(): string[] {
  const findings: string[] = [];
  for (const file of gatherSiteFiles()) {
    const relPath = path.relative(REPO_ROOT, file);
    readFileSync(file, "utf-8")
      .split("\n")
      .forEach((lineText, index) => {
        for (const match of lineText.matchAll(/[A-Za-z0-9._%+-]+@crumbify\.co\.uk/gi)) {
          const address = match[0].toLowerCase();
          if (address !== CONTACT_ADDRESS && !ALLOWLIST.has(address)) {
            findings.push(`${relPath}:${index + 1}: ${match[0]}`);
          }
        }
      });
  }
  return findings;
}

describe("security: public contact address is support@crumbify.co.uk only", () => {
  it("scans the real site source, not an empty set", () => {
    const relFiles = gatherSiteFiles().map((file) => path.relative(REPO_ROOT, file));
    expect(relFiles).toContain(path.join("src", "components", "landing", "Footer.tsx"));
    expect(relFiles).toContain(path.join("tests", "e2e", "pages", "HomePage.ts"));
  });

  it("contains no @crumbify.co.uk address other than support@ or the allowlist", () => {
    expect(findDisallowedAddresses()).toEqual([]);
  });
});
