/**
 * /ref?u=<username> route tests (#1191).
 *
 * The invite link the app shares used to be a permanent redirect to `/` that dropped the username and
 * recorded nothing. These tests pin the outcome: a valid username records ONE referral_clicks row
 * (code = the normalised username, platform, a salted ip_hash the app backend can reproduce), the visitor
 * lands on `/` exactly as before, and invalid or missing input never errors, never records.
 */

import { createHash } from "node:crypto";

const mockInsert = jest.fn();
const mockRefreshEqIp = jest.fn();
const mockRefreshEqCode = jest.fn(() => ({ eq: mockRefreshEqIp }));
const mockUpdate = jest.fn<{ eq: jest.Mock }, [Record<string, unknown>]>(() => ({ eq: mockRefreshEqCode }));
const mockFrom = jest.fn(() => ({ insert: mockInsert, update: mockUpdate }));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: mockFrom })),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn((url: URL, status: number) => ({
      status,
      headers: new Headers({ location: url.toString() }),
    })),
  },
}));

import { GET } from "../../app/ref/route";

type FakeRequest = { url: string; headers: Headers };

function buildRequest(
  query: string,
  { userAgent, ip }: { userAgent?: string; ip?: string } = {}
): FakeRequest {
  const headers = new Headers();
  if (userAgent) headers.set("user-agent", userAgent);
  if (ip) headers.set("x-forwarded-for", ip);
  return { url: `https://crumbify.co.uk/ref${query}`, headers };
}

const IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";
const ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

describe("GET /ref", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() => ({ insert: mockInsert, update: mockUpdate }));
    mockRefreshEqIp.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
    process.env.SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
    process.env.REFERRAL_IP_SALT = "test-salt";
    process.env.NEXT_PUBLIC_APP_STORE_URL = "https://apps.apple.com/app/crumbify";
  });

  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.REFERRAL_IP_SALT;
    delete process.env.NEXT_PUBLIC_APP_STORE_URL;
  });

  it("records the click for the username and lands on the home page, whatever the device", async () => {
    for (const userAgent of [IOS_UA, ANDROID_UA, DESKTOP_UA]) {
      mockInsert.mockClear();
      const res = await GET(buildRequest("?u=sam_eats", { userAgent, ip: "1.2.3.4" }) as unknown as Request);
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
      expect(mockInsert).toHaveBeenCalledTimes(1);
    }
  });

  it("writes code = the username, the platform and sha256(salt:ip) into referral_clicks, one row per visitor", async () => {
    await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "203.0.113.7, 10.0.0.1" }) as unknown as Request);

    expect(mockFrom).toHaveBeenCalledWith("referral_clicks");
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockInsert).toHaveBeenCalledWith(
      {
        code: "sam_eats",
        platform: "ios",
        // Independent oracle: the value the app backend (likely-inviter) computes from the leftmost
        // x-forwarded-for entry and the same salt.
        ip_hash: createHash("sha256").update("test-salt:203.0.113.7").digest("hex"),
      }
    );
  });

  it("records the platform for android and other user agents", async () => {
    await GET(buildRequest("?u=sam_eats", { userAgent: ANDROID_UA, ip: "1.2.3.4" }) as unknown as Request);
    await GET(buildRequest("?u=sam_eats", { userAgent: DESKTOP_UA, ip: "1.2.3.4" }) as unknown as Request);
    expect(mockInsert.mock.calls.map((c) => c[0].platform)).toEqual(["android", "other"]);
  });

  it("normalises the username: trimmed and lower-cased", async () => {
    await GET(buildRequest("?u=%20Sam_Eats%20", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);
    expect(mockInsert.mock.calls[0][0].code).toBe("sam_eats");
  });

  it.each([
    ["a missing u", ""],
    ["an empty u", "?u="],
    ["a blank u", "?u=%20%20"],
    ["a one-character u", "?u=a"],
    ["a u over 30 characters", `?u=${"a".repeat(31)}`],
    ["a u with a dash", "?u=sam-eats"],
    ["a u with a dot", "?u=sam.eats"],
    ["a u with a slash", "?u=sam%2Feats"],
    ["a u with an html tag", "?u=%3Cscript%3E"],
    ["a u with a non-ascii letter", "?u=s%C3%A4m_eats"],
    ["the old code parameter only", "?code=sam_eats"],
  ])("lands on the home page and records nothing for %s", async (_name, query) => {
    const res = await GET(buildRequest(query, { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("never errors to the visitor when the click write fails or throws", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      mockInsert.mockResolvedValueOnce({ error: { message: "dup for a@b.io" } });
      const failed = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);
      expect(failed.status).toBe(302);
      expect(errorSpy).toHaveBeenCalledWith("referral_clicks insert failed:", '{"message":"dup for [redacted-email]"}');

      mockInsert.mockRejectedValueOnce(new Error("network error"));
      const thrown = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);
      expect(thrown.status).toBe(302);
      expect(errorSpy).toHaveBeenCalledWith("referral_clicks insert threw:", "Error: network error");
    } finally {
      errorSpy.mockRestore();
    }
  });

  it("skips the write, but still lands home, without Supabase config or a client address", async () => {
    delete process.env.SUPABASE_URL;
    const noConfig = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);
    expect(noConfig.status).toBe(302);
    process.env.SUPABASE_URL = "https://test.supabase.co";
    const noIp = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA }) as unknown as Request);
    expect(noIp.status).toBe(302);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  describe("insert failure paths (partial unique index, 23505 refresh)", () => {
        const expectedHash = createHash("sha256").update("test-salt:1.2.3.4").digest("hex");

    it("refreshes created_at for the same visitor and code on a 23505 and never logs an error", async () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      try {
        mockInsert.mockResolvedValueOnce({ error: { code: "23505", message: "duplicate key value" } });
        const res = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);

        expect(res.status).toBe(302);
        expect(mockUpdate).toHaveBeenCalledTimes(1);
        const refreshed = mockUpdate.mock.calls[0][0];
        expect(refreshed).toEqual({ created_at: expect.any(String), platform: "ios" });
        expect(Number.isNaN(Date.parse(String(refreshed.created_at)))).toBe(false);
        expect(mockRefreshEqCode).toHaveBeenCalledWith("code", "sam_eats");
        expect(mockRefreshEqIp).toHaveBeenCalledWith("ip_hash", expectedHash);
        expect(errorSpy).not.toHaveBeenCalled();
      } finally {
        errorSpy.mockRestore();
      }
    });

    it("logs other insert errors redacted and still lands home", async () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      try {
        mockInsert.mockResolvedValueOnce({ error: { code: "22P02", message: "bad value for a@b.io" } });
        const res = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);

        expect(res.status).toBe(302);
        expect(res.headers.get("location")).toBe("https://crumbify.co.uk/");
        expect(mockUpdate).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(
          "referral_clicks insert failed:",
          '{"code":"22P02","message":"bad value for [redacted-email]"}'
        );
        expect(errorSpy.mock.calls.flat().join(" ")).not.toContain("a@b.io");
      } finally {
        errorSpy.mockRestore();
      }
    });

    it("logs a failing refresh, redacted, and still lands home", async () => {
      const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      try {
        mockInsert.mockResolvedValueOnce({ error: { code: "23505", message: "duplicate key" } });
        mockRefreshEqIp.mockResolvedValueOnce({ error: { code: "42501", message: "refresh denied for c@d.io" } });
        const res = await GET(buildRequest("?u=sam_eats", { userAgent: IOS_UA, ip: "1.2.3.4" }) as unknown as Request);

        expect(res.status).toBe(302);
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(
          "referral_clicks refresh failed:",
          '{"code":"42501","message":"refresh denied for [redacted-email]"}'
        );
        expect(errorSpy.mock.calls.flat().join(" ")).not.toContain("c@d.io");
      } finally {
        errorSpy.mockRestore();
      }
    });
  });
});
