/**
 * /api/rates
 *
 * Returns mortgage rates from the local cache (data/rates-cache.json).
 * The cache is updated weekly by GitHub Actions running scripts/update-rates.js,
 * which scrapes supermarker.themarker.com and commits the updated JSON.
 */

import fs   from "fs";
import path from "path";

export default function handler(req, res) {
  const cacheFile = path.join(process.cwd(), "data", "rates-cache.json");

  let cache;
  try {
    cache = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  } catch (err) {
    return res.status(500).json({ error: "rates cache not found", details: err.message });
  }

  return res.status(200).json({
    banks:        cache.banks,
    surveyDate:   cache.surveyDate   || null,
    updatedAt:    cache.updatedAt    || null,
    boiRate:       cache.boiRate       ?? null,
    primeRate:     cache.primeRate     ?? null,
    boiRateDate:   cache.boiRateDate   || null,
    nextDecision:  cache.nextDecision  || null,
    live:         true,
    source:       "supermarker.themarker.com",
  });
}
