const fs = require("fs");
const path = require("path");

const cacheFile = path.join(__dirname, "../../data/rates-cache.json");
const REQUIRED_YEAR_KEYS = [5, 10, 15, 20, 25, 30];
const REQUIRED_RATE_FIELDS = ["prime", "fixed_cpi", "fixed_unlinked", "variable_cpi", "variable_cpi_1yr", "variable_unlinked"];

let cache;

beforeAll(() => {
  const raw = fs.readFileSync(cacheFile, "utf8");
  cache = JSON.parse(raw);
});

test("rates-cache.json is valid JSON", () => {
  expect(cache).toBeDefined();
  expect(typeof cache).toBe("object");
});

test("contains byYears with all 6 year keys", () => {
  expect(cache.byYears).toBeDefined();
  for (const yr of REQUIRED_YEAR_KEYS) {
    expect(cache.byYears[yr] ?? cache.byYears[String(yr)]).toBeDefined();
  }
});

test("each year bucket has at least 3 banks", () => {
  for (const yr of REQUIRED_YEAR_KEYS) {
    const banks = cache.byYears[yr] ?? cache.byYears[String(yr)];
    expect(Array.isArray(banks)).toBe(true);
    expect(banks.length).toBeGreaterThanOrEqual(3);
  }
});

test("each bank has all 6 rate fields", () => {
  for (const yr of REQUIRED_YEAR_KEYS) {
    const banks = cache.byYears[yr] ?? cache.byYears[String(yr)];
    for (const bank of banks) {
      for (const field of REQUIRED_RATE_FIELDS) {
        expect(bank[field]).toBeDefined();
        expect(typeof bank[field]).toBe("number");
      }
    }
  }
});

test("all rate values are between 0.01 and 0.20", () => {
  for (const yr of REQUIRED_YEAR_KEYS) {
    const banks = cache.byYears[yr] ?? cache.byYears[String(yr)];
    for (const bank of banks) {
      for (const field of REQUIRED_RATE_FIELDS) {
        const val = bank[field];
        expect(val).toBeGreaterThanOrEqual(0.01);
        expect(val).toBeLessThanOrEqual(0.20);
      }
    }
  }
});

test("primeRate equals boiRate + 1.5% (±0.1%)", () => {
  expect(cache.boiRate).toBeDefined();
  expect(cache.primeRate).toBeDefined();
  const expected = cache.boiRate + 0.015;
  expect(Math.abs(cache.primeRate - expected)).toBeLessThanOrEqual(0.001);
});

test("surveyDate is a non-empty string", () => {
  expect(typeof cache.surveyDate).toBe("string");
  expect(cache.surveyDate.trim().length).toBeGreaterThan(0);
});
