/**
 * Public support address for the Organization JSON-LD. Lives outside src/lib on
 * purpose: the no-committed-secrets guard forbids @crumbify.co.uk literals in
 * src/lib (auth allowlists), and this is the public contact address that the
 * legal and support pages already print.
 */
export const SUPPORT_EMAIL = "support@crumbify.co.uk";
