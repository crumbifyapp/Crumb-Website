import { getAppStoreRating } from "@/lib/app-store-rating";

const LOOKUP_URL = "https://itunes.apple.com/lookup?id=6777163992&country=gb";

function mockFetch(impl: () => Promise<unknown>) {
  const fn = jest.fn(impl);
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

function okJson(body: unknown) {
  return mockFetch(() => Promise.resolve({ ok: true, json: () => Promise.resolve(body) }));
}

describe("getAppStoreRating", () => {
  const realFetch = global.fetch;
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    global.fetch = realFetch;
    warn.mockRestore();
  });

  it("returns the rounded rating and count on a valid response", async () => {
    const fetchMock = okJson({
      resultCount: 1,
      results: [{ averageUserRating: 4.8333, userRatingCount: 6 }],
    });
    await expect(getAppStoreRating()).resolves.toEqual({ ratingValue: 4.8, ratingCount: 6 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit & { next?: unknown },
    ];
    expect(url).toBe(LOOKUP_URL);
    expect(init.next).toEqual({ revalidate: 86400 });
    expect(init.signal).toBeDefined();
    expect(warn).not.toHaveBeenCalled();
  });

  it("returns null and warns on a non-ok response", async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({}) }));
    await expect(getAppStoreRating()).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it("returns null when the body is not valid JSON", async () => {
    mockFetch(() =>
      Promise.resolve({ ok: true, json: () => Promise.reject(new SyntaxError("bad json")) }),
    );
    await expect(getAppStoreRating()).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it.each([
    ["no results", { results: [] }],
    ["results missing", {}],
    ["rating is a string", { results: [{ averageUserRating: "5", userRatingCount: 6 }] }],
    ["rating out of range high", { results: [{ averageUserRating: 5.5, userRatingCount: 6 }] }],
    ["rating out of range low", { results: [{ averageUserRating: 0.5, userRatingCount: 6 }] }],
    ["rating not finite", { results: [{ averageUserRating: null, userRatingCount: 6 }] }],
    ["count not an integer", { results: [{ averageUserRating: 5, userRatingCount: 2.5 }] }],
  ])("returns null on a bad shape: %s", async (_label, body) => {
    okJson(body);
    await expect(getAppStoreRating()).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
  });

  it("returns null when the rating count is zero", async () => {
    okJson({ results: [{ averageUserRating: 5, userRatingCount: 0 }] });
    await expect(getAppStoreRating()).resolves.toBeNull();
  });

  it("returns null and never throws when fetch rejects", async () => {
    mockFetch(() => Promise.reject(new Error("network down")));
    await expect(getAppStoreRating()).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
  });
});
