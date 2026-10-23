/**
 * src/__tests__/well-known/assetlinks-json-shape.test.ts
 *
 * app#1213: public/.well-known/assetlinks.json shipped with the literal placeholder
 * "REPLACE_WITH_SHA256_FROM_PLAY_CONSOLE" in sha256_cert_fingerprints. Android App Links
 * never verified, so /ref and /u links opened the website instead of the app, and nothing
 * failed in CI. Class: placeholder config shipped to production. This static guard reads
 * the real file and fails on each way the statement can be wrong, with a distinct message
 * per failure. The RED fixtures below run the same pure validator over bad inputs (including
 * the exact old placeholder file) so each message is shown to fire.
 *
 * Follows the style of apple-app-site-association.test.ts in this folder.
 */

import { readFileSync } from "fs";
import { join } from "path";

const PACKAGE_NAME = "com.crumbify.app";
const HANDLE_ALL_URLS = "delegate_permission/common.handle_all_urls";
// The EAS Android upload keystore of com.crumbify.app. The Play App Signing key is added later
// as a second entry; this test only requires that this one stays listed.
const EAS_UPLOAD_FINGERPRINT =
  "FC:DF:19:36:68:B0:8E:81:7C:F0:B9:1D:7E:9B:02:27:EB:0F:DF:72:9A:E5:03:2D:06:36:69:A4:F9:CC:9A:F1";
// 32 bytes, uppercase hex, colon separated: 32 pairs, 31 colons.
const FINGERPRINT_RE = /^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$/;

const MSG = {
  notJson: "assetlinks.json does not parse as JSON",
  notStatementArray: "assetlinks.json must be a non-empty array of statement objects",
  wrongPackage: "assetlinks.json target.package_name must be com.crumbify.app",
  missingHandleAllUrls:
    "assetlinks.json relation must include delegate_permission/common.handle_all_urls",
  noFingerprints: "assetlinks.json sha256_cert_fingerprints must list at least one certificate",
  badFingerprint:
    "assetlinks.json sha256_cert_fingerprints entry must be 32 uppercase hex bytes separated by colons",
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Pure validator: returns the distinct failure messages for one assetlinks.json body.
 * An empty array means the file passes every check.
 */
function assetLinksFailures(raw: string): string[] {
  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch {
    return [MSG.notJson];
  }
  if (!Array.isArray(doc) || doc.length === 0 || !doc.every(isRecord)) {
    return [MSG.notStatementArray];
  }

  const failures = new Set<string>();
  for (const statement of doc as Record<string, unknown>[]) {
    const relation = Array.isArray(statement.relation) ? statement.relation : [];
    const target = isRecord(statement.target) ? statement.target : {};

    if (target.package_name !== PACKAGE_NAME) failures.add(MSG.wrongPackage);
    if (!relation.includes(HANDLE_ALL_URLS)) failures.add(MSG.missingHandleAllUrls);

    const fingerprints = target.sha256_cert_fingerprints;
    if (!Array.isArray(fingerprints) || fingerprints.length === 0) {
      failures.add(MSG.noFingerprints);
    } else {
      for (const fingerprint of fingerprints) {
        if (typeof fingerprint !== "string" || !FINGERPRINT_RE.test(fingerprint)) {
          failures.add(MSG.badFingerprint);
        }
      }
    }
  }
  return [...failures];
}

/** A statement that passes every check, with optional overrides for RED fixtures. */
function statementFile(
  targetOverrides: Record<string, unknown> = {},
  relation: readonly string[] = [HANDLE_ALL_URLS],
): string {
  return JSON.stringify([
    {
      relation: [...relation],
      target: {
        namespace: "android_app",
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: [EAS_UPLOAD_FINGERPRINT],
        ...targetOverrides,
      },
    },
  ]);
}

// The exact pre-fix file as it sat on main (app#1213). Kept verbatim so the guard is shown to
// fail on the real placeholder, not on a simplified stand-in.
const OLD_PLACEHOLDER_FILE = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.crumbify.app",
      "sha256_cert_fingerprints": [
        "REPLACE_WITH_SHA256_FROM_PLAY_CONSOLE"
      ]
    }
  }
]
`;

const raw = readFileSync(
  join(__dirname, "../../../public/.well-known/assetlinks.json"),
  "utf8",
);

describe("assetlinks.json (live file)", () => {
  it("passes every shape check", () => {
    expect(assetLinksFailures(raw)).toEqual([]);
  });

  it("keeps the EAS upload fingerprint listed (Play App Signing key is added as a second entry later)", () => {
    const doc = JSON.parse(raw) as Array<{ target: { sha256_cert_fingerprints: string[] } }>;
    expect(doc[0].target.sha256_cert_fingerprints).toContain(EAS_UPLOAD_FINGERPRINT);
  });

  it("the placeholder literal is gone from the shipped file", () => {
    expect(raw).not.toContain("REPLACE_WITH_SHA256_FROM_PLAY_CONSOLE");
  });
});

describe("assetLinksFailures RED fixtures (each failure class fires with its own message)", () => {
  it("the exact old placeholder file fails on the fingerprint only", () => {
    expect(assetLinksFailures(OLD_PLACEHOLDER_FILE)).toEqual([MSG.badFingerprint]);
  });

  it("unparseable JSON fails as notJson", () => {
    expect(assetLinksFailures('[{"relation": [')).toEqual([MSG.notJson]);
  });

  it("an empty statement array fails as notStatementArray", () => {
    expect(assetLinksFailures("[]")).toEqual([MSG.notStatementArray]);
  });

  it("a non-object statement fails as notStatementArray", () => {
    expect(assetLinksFailures('["not-a-statement"]')).toEqual([MSG.notStatementArray]);
  });

  it("a different package_name fails as wrongPackage", () => {
    expect(assetLinksFailures(statementFile({ package_name: "com.example.other" }))).toEqual([
      MSG.wrongPackage,
    ]);
  });

  it("a relation without handle_all_urls fails as missingHandleAllUrls", () => {
    expect(
      assetLinksFailures(statementFile({}, ["delegate_permission/common.get_login_creds"])),
    ).toEqual([MSG.missingHandleAllUrls]);
  });

  it("an empty fingerprint list fails as noFingerprints", () => {
    expect(assetLinksFailures(statementFile({ sha256_cert_fingerprints: [] }))).toEqual([
      MSG.noFingerprints,
    ]);
  });

  it("a lowercase fingerprint fails as badFingerprint", () => {
    expect(
      assetLinksFailures(statementFile({ sha256_cert_fingerprints: [EAS_UPLOAD_FINGERPRINT.toLowerCase()] })),
    ).toEqual([MSG.badFingerprint]);
  });

  it("a 31-byte fingerprint fails as badFingerprint", () => {
    const short = EAS_UPLOAD_FINGERPRINT.slice(0, -3);
    expect(assetLinksFailures(statementFile({ sha256_cert_fingerprints: [short] }))).toEqual([
      MSG.badFingerprint,
    ]);
  });

  it("a fingerprint without colon separators fails as badFingerprint", () => {
    const bare = EAS_UPLOAD_FINGERPRINT.replace(/:/g, "");
    expect(assetLinksFailures(statementFile({ sha256_cert_fingerprints: [bare] }))).toEqual([
      MSG.badFingerprint,
    ]);
  });

  it("a non-string fingerprint entry fails as badFingerprint", () => {
    expect(assetLinksFailures(statementFile({ sha256_cert_fingerprints: [42] }))).toEqual([
      MSG.badFingerprint,
    ]);
  });
});

describe("assetLinksFailures GREEN fixture and message set", () => {
  it("a valid file with a second (Play App Signing) fingerprint passes", () => {
    const playKey =
      "0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9:0A:1B:2C:3D:4E:5F:60:71:82:93:A4:B5:C6:D7:E8:F9";
    expect(
      assetLinksFailures(
        statementFile({ sha256_cert_fingerprints: [EAS_UPLOAD_FINGERPRINT, playKey] }),
      ),
    ).toEqual([]);
  });

  it("every failure class has its own distinct message", () => {
    const messages = Object.values(MSG);
    expect(new Set(messages).size).toBe(messages.length);
  });
});
