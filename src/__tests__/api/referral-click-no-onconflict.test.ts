/**
 * Static guard: src/lib/referral-click.ts must never write referral_clicks with an ON CONFLICT
 * (`onConflict` / `ignoreDuplicates`). The live unique index is PARTIAL:
 *   CREATE UNIQUE INDEX referral_clicks_code_ip_unique ON public.referral_clicks (code, ip_hash)
 *   WHERE (ip_hash IS NOT NULL)
 * A partial unique index cannot back a plain ON CONFLICT target, so every such write fails with
 * Postgres 42P10 and no referral click is recorded (seen in Vercel logs, 22 Oct). The helper writes
 * with a plain insert and refreshes the row on 23505 instead.
 */

import { readFileSync } from "fs";
import path from "path";

const HELPER_PATH = path.resolve(__dirname, "..", "..", "lib", "referral-click.ts");

/** Strips comments so the explanatory header can mention anything without tripping the guard. */
function codeOnly(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function usesOnConflict(source: string): boolean {
  return /onConflict|ignoreDuplicates/.test(codeOnly(source));
}

describe("referral click helper never uses ON CONFLICT on referral_clicks", () => {
  it("the red input (a partial-index upsert) is flagged", () => {
    // Red fixture: the pre-fix helper shape, which fails with 42P10 against the partial index.
    const redFixture = [
      "const { error } = await supabase.from(\"referral_clicks\").upsert(",
      "  { code, platform, ip_hash: ipHash },",
      "  { onConflict: \"code,ip_hash\", ignoreDuplicates: true }",
      ");",
    ].join("\n");
    expect(usesOnConflict(redFixture)).toBe(true);
  });

  it("the comment-only mention is not flagged", () => {
    expect(usesOnConflict("// a plain ON CONFLICT would fail here\n/* onConflict */\nconst x = 1;")).toBe(false);
  });

  it("the real helper source uses no onConflict or ignoreDuplicates", () => {
    const source = readFileSync(HELPER_PATH, "utf-8");
    expect(usesOnConflict(source)).toBe(false);
  });
});
