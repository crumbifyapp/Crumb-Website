/**
 * Turnstile widget page for the Crumbify app (app issue #1004): public/turnstile.html.
 *
 * The app loads this page in a hidden WebView and trusts the messages it posts. This test RUNS
 * the page's inline script against a fake Turnstile and a fake ReactNativeWebView bridge, so the
 * message contract the app parses (services/auth/captcha-token.ts) cannot drift, and pins that
 * the page loads no script other than Turnstile.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

const html = readFileSync(resolve(__dirname, "../../../public/turnstile.html"), "utf8");
const inline = /<script>([\s\S]*?)<\/script>/.exec(html)![1];

type Opts = Record<string, unknown> & { callback: (t: string) => void };
let posted: unknown[];
let render: jest.Mock;

function boot(search: string, withTurnstile = true) {
  window.history.pushState({}, "", `/turnstile.html${search}`);
  posted = [];
  render = jest.fn();
  (window as unknown as Record<string, unknown>).ReactNativeWebView = {
    postMessage: (m: string) => posted.push(JSON.parse(m)),
  };
  (window as unknown as Record<string, unknown>).turnstile = withTurnstile ? { render } : undefined;
  new Function(inline)();
  (window as unknown as { onTurnstileLoad: () => void }).onTurnstileLoad();
}

describe("public/turnstile.html", () => {
  it("renders the widget with the sitekey from the query and posts the token it produces", () => {
    boot("?sitekey=1x00000000000000000000AA");
    expect(render).toHaveBeenCalledTimes(1);
    const [selector, opts] = render.mock.calls[0] as [string, Opts];
    expect(selector).toBe("#widget");
    expect(opts.sitekey).toBe("1x00000000000000000000AA");
    opts.callback("tok-abc");
    expect(posted).toEqual([{ type: "token", token: "tok-abc" }]);
  });

  it("posts error, expired and timeout from the matching widget callbacks", () => {
    boot("?sitekey=1x00000000000000000000AA");
    const opts = render.mock.calls[0][1] as Record<string, () => void>;
    opts["error-callback"]();
    opts["expired-callback"]();
    opts["timeout-callback"]();
    expect(posted).toEqual([{ type: "error" }, { type: "expired" }, { type: "timeout" }]);
  });

  it("never renders with a missing or malformed sitekey and tells the app it failed", () => {
    for (const search of ["", "?sitekey=", "?sitekey=<script>x</script>"]) {
      boot(search);
      expect(render).not.toHaveBeenCalled();
      expect(posted.every((m) => (m as { type: string }).type === "error")).toBe(true);
      expect(posted.length).toBeGreaterThan(0);
    }
  });

  it("posts error when the Turnstile script did not load", () => {
    boot("?sitekey=1x00000000000000000000AA", false);
    expect(posted).toEqual([{ type: "error" }]);
  });

  it("loads only the Turnstile script and nothing third-party", () => {
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
    expect(srcs).toHaveLength(1);
    expect(srcs[0].startsWith("https://challenges.cloudflare.com/turnstile/v0/api.js")).toBe(true);
    expect(html).not.toMatch(/gtag|analytics|posthog|googletagmanager|vercel|<img|<iframe|<link[^>]+href=/i);
  });
});
