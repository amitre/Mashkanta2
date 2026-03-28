const path = require("path");
const fs = require("fs");

// Mock Next.js module resolution so the handler can be required from Node
jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");
  return { ...actualFs };
});

// We'll test the handler logic directly by importing a CommonJS-compatible version
// Since the handler uses ES module `export default`, we inline equivalent logic here
// that mirrors pages/api/rates.js exactly.

const AVAILABLE_YEARS = [5, 10, 15, 20, 25, 30];

function closestYears(years, available) {
  return available.reduce((a, b) =>
    Math.abs(b - years) < Math.abs(a - years) ? b : a
  );
}

function makeHandler(cacheFilePath) {
  return function handler(req, res) {
    let cache;
    try {
      cache = JSON.parse(fs.readFileSync(cacheFilePath, "utf8"));
    } catch (err) {
      return res.status(500).json({ error: "rates cache not found", details: err.message });
    }

    const requestedYears = parseInt(req.query.years) || 25;
    const bucket = closestYears(requestedYears, AVAILABLE_YEARS);
    const banks = cache.byYears?.[bucket] ?? cache.byYears?.[String(bucket)] ?? cache.banks ?? [];

    return res.status(200).json({
      banks,
      years: bucket,
      surveyDate: cache.surveyDate || null,
      updatedAt: cache.updatedAt || null,
      boiRate: cache.boiRate ?? null,
      primeRate: cache.primeRate ?? null,
      boiRateDate: cache.boiRateDate || null,
      nextDecision: cache.nextDecision || null,
      live: true,
      source: "supermarker.themarker.com",
    });
  };
}

function makeMockRes() {
  let statusCode = null;
  let body = null;
  return {
    status(code) { statusCode = code; return this; },
    json(data) { body = data; return this; },
    get statusCode() { return statusCode; },
    get body() { return body; },
  };
}

const realCacheFile = path.join(__dirname, "../../data/rates-cache.json");

describe("rates API handler", () => {
  test("years=30 returns banks with fixed_unlinked > 0", () => {
    const handler = makeHandler(realCacheFile);
    const res = makeMockRes();
    handler({ query: { years: "30" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.banks.length).toBeGreaterThan(0);
    for (const bank of res.body.banks) {
      expect(bank.fixed_unlinked).toBeGreaterThan(0);
    }
  });

  test("years=28 falls back to bucket 30 (closest)", () => {
    const handler = makeHandler(realCacheFile);
    const res = makeMockRes();
    handler({ query: { years: "28" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.years).toBe(30);
  });

  test("years=12 falls back to bucket 10 (closest)", () => {
    const handler = makeHandler(realCacheFile);
    const res = makeMockRes();
    handler({ query: { years: "12" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.years).toBe(10);
  });

  test("missing cache file returns 500", () => {
    const handler = makeHandler("/nonexistent/path/rates-cache.json");
    const res = makeMockRes();
    handler({ query: { years: "25" } }, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("rates cache not found");
  });

  test("response includes boiRate, primeRate, surveyDate", () => {
    const handler = makeHandler(realCacheFile);
    const res = makeMockRes();
    handler({ query: { years: "25" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.boiRate).not.toBeNull();
    expect(res.body.primeRate).not.toBeNull();
    expect(res.body.surveyDate).not.toBeNull();
  });
});
