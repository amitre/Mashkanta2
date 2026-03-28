/**
 * /api/rates?years=YEARS
 *
 * Returns mortgage rates from the local cache (data/rates-cache.json).
 * Selects the bucket matching the requested years (5/10/15/20/25/30).
 * Falls back to the closest available bucket if exact match missing.
 *
 * The cache is updated weekly by GitHub Actions running scripts/update-rates.js.
 */

import fs   from "fs";
import path from "path";

const AVAILABLE_YEARS = [5, 10, 15, 20, 25, 30];

function closestYears(years, available) {
  return available.reduce((a, b) =>
    Math.abs(b - years) < Math.abs(a - years) ? b : a
  );
}

export default function handler(req, res) {
  const cacheFile = path.join(process.cwd(), "data", "rates-cache.json");

  let cache;
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  } catch (err) {
    return res.status(500).json({ error: "rates cache not found", details: err.message });
  }

  const requestedYears = parseInt(req.query.years) || 25;
  const bucket = closestYears(requestedYears, AVAILABLE_YEARS);

  // Support both old format (cache.banks) and new format (cache.byYears)
  const banks = cache.byYears?.[bucket] ?? cache.byYears?.[String(bucket)] ?? cache.banks ?? [];

  return res.status(200).json({
    banks,
    years:         bucket,
    surveyDate:    cache.surveyDate    || null,
    updatedAt:     cache.updatedAt     || null,
    boiRate:       cache.boiRate       ?? null,
    primeRate:     cache.primeRate     ?? null,
    boiRateDate:   cache.boiRateDate   || null,
    nextDecision:  cache.nextDecision  || null,
    live:          true,
    source:        "supermarker.themarker.com",
  });
}
