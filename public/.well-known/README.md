# public/.well-known/

Digital Asset Links / Universal Links statement files. Both are spec-defined,
third-party-parsed formats (Google Play / Apple) - keep them to their plain
documented shape, no extra sibling keys, no comments embedded in the JSON.

## assetlinks.json (Android App Links)

`sha256_cert_fingerprints` holds the EAS Android signing (upload) keystore fingerprint of
`com.crumbify.app` (app#1213). The guard `src/__tests__/well-known/assetlinks-json-shape.test.ts`
fails on any placeholder, empty list, or malformed fingerprint.

**OWNER ACTION (open):** add the Play App Signing key certificate as a SECOND entry in
`sha256_cert_fingerprints`. Play Console > [app] > Setup > App integrity > App signing >
App signing key certificate > "SHA-256 certificate fingerprint". Store installs are signed
with the Play App Signing key, so App Links verify for Play installs only after that entry
lands. Do not invent a value.

(Fix-round r2, F53-N5: this note previously lived as a non-spec `comment`
key inside the JSON statement object itself - moved here so the file stays
a plain, spec-shaped two-key statement with zero risk of an unknown-key
rejection by Google's verifier the moment the real fingerprint is pasted in.)

## apple-app-site-association (iOS Universal Links)

No owner action pending; configured via `associatedDomains: applinks:crumbify.co.uk`
in the app's `app.json` (app repo).
