#!/usr/bin/env node
/**
 * Scrapes mortgage rates from supermarker.themarker.com
 * and saves them to data/rates-cache.json.
 *
 * Run weekly via GitHub Actions (see .github/workflows/update-rates.yml).
 * Reference params: 1,000,000 NIS loan, 25 years.
 */

const fs   = require("fs");
const path = require("path");

const BASE_URL = "https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8",
};

// Track key → site's Product URL param
const TRACKS = [
  { key: "prime",              product: 5  },
  { key: "fixed_cpi",         product: 3  },
  { key: "fixed_unlinked",    product: 4  },
  { key: "variable_cpi",      product: 6  },
  { key: "variable_cpi_1yr",  product: 7  },
  { key: "variable_unlinked", product: 69 },
];

// Years value → site's Years URL param
const YEARS_MAP = { 5: 1, 10: 2, 15: 3, 20: 4, 25: 5, 30: 6 };

// IMPORTANT: הבינלאומי must come BEFORE לאומי (substring match)
const BANK_PATTERNS = [
  { key: "בנק הפועלים",      patterns: ["הפועלים"] },
  { key: "הבנק הבינלאומי",   patterns: ["בינלאומי"] },
  { key: "בנק לאומי",        patterns: ["לאומי"] },
  { key: "בנק מזרחי-טפחות",  patterns: ["מזרחי", "טפחות"] },
  { key: "בנק דיסקונט",      patterns: ["דיסקונט"] },
  { key: "בנק ירושלים",      patterns: ["ירושלים"] },
  { key: "בנק אגוד",         patterns: ["אגוד"] },
  { key: "אוצר החייל",       patterns: ["אוצר"] },
  { key: "בנק מרכנתיל",      patterns: ["מרכנתיל"] },
  { key: "בנק יהב",          patterns: ["יהב"] },
];

const DEFAULT_RATES = {
  prime: 0.056, fixed_cpi: 0.035, fixed_unlinked: 0.055,
  variable_cpi: 0.028, variable_cpi_1yr: 0.026, variable_unlinked: 0.048,
};

function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g,    (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"').replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function mapTextToBank(text) {
  const t = text.trim();
  for (const { key, patterns } of BANK_PATTERNS) {
    if (patterns.some((p) => t.includes(p))) return key;
  }
  return null;
}

const HEBREW_MONTHS = [
  "ינואר","פברואר","מרץ","אפריל","מאי","יוני",
  "יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",
];

function extractSurveyDate(html) {
  const decoded = decodeEntities(html);
  // 1. Prefer "סקר <month> <year>" pattern
  const withSurvey = decoded.match(/סקר[:\s]*([\u05D0-\u05EA\u05B0-\u05C7]+\s+\d{4})/);
  if (withSurvey) return withSurvey[1].trim();
  // 2. Fallback: find any Hebrew month name followed by a 4-digit year
  for (const month of HEBREW_MONTHS) {
    const m = decoded.match(new RegExp(month + "\\s+\\d{4}"));
    if (m) return m[0].trim();
  }
  return null;
}

function parseRatesFromHtml(html) {
  const bankRates = {};
  const rowRe = /<tr[^>]+class="[^"]*mortgageHover[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const rowHtml = rm[1];
    const altM = rowHtml.match(/alt="([^"]+)"/i);
    if (!altM) continue;
    const bankName = mapTextToBank(decodeEntities(altM[1]));
    if (!bankName) continue;
    const rateM = rowHtml.match(/<td[^>]+ribit2Compare[^>]*>([\s\S]*?)<\/td>/i);
    if (!rateM) continue;
    const rateText = rateM[1].replace(/<[^>]+>/g, "").trim();
    const rateVal  = parseFloat(rateText.replace("%", ""));
    if (!isNaN(rateVal) && rateVal > 0 && rateVal < 20) {
      bankRates[bankName] = Math.round(rateVal * 10000) / 10000 / 100;
    }
  }
  return bankRates;
}

async function scrapeThemarker(loanAmount, years) {
  const yearsParam = YEARS_MAP[years] || YEARS_MAP[25];
  const result = {};
  let surveyDate = null;

  // Fetch the base page first to get the survey date (it appears above the filters)
  try {
    console.log("  Fetching base page for survey date…");
    const baseRes = await fetch(BASE_URL, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (baseRes.ok) {
      const baseHtml = await baseRes.text();
      surveyDate = extractSurveyDate(baseHtml);
      console.log(`  Survey date: ${surveyDate || "(not found)"}`);
    }
  } catch (e) {
    console.warn(`  Base page fetch failed: ${e.message}`);
  }

  for (const { key: trackKey, product } of TRACKS) {
    const url = `${BASE_URL}?Years=${yearsParam}&Product=${product}&SUM=${loanAmount}`;
    console.log(`  Fetching track ${trackKey} (product=${product})…`);
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (!res.ok) { console.warn(`  HTTP ${res.status} for ${url}`); continue; }
    const html = await res.text();
    if (!surveyDate) surveyDate = extractSurveyDate(html);
    const bankRates = parseRatesFromHtml(html);
    const count = Object.keys(bankRates).length;
    console.log(`  → ${count} banks found for ${trackKey}`);
    for (const [bankName, rate] of Object.entries(bankRates)) {
      if (!result[bankName]) result[bankName] = {};
      result[bankName][trackKey] = rate;
    }
  }

  if (Object.keys(result).length === 0)
    throw new Error("No bank rates found — site structure may have changed");

  const banks = Object.entries(result).map(([name, rates]) => ({
    name,
    prime:             rates.prime             ?? DEFAULT_RATES.prime,
    fixed_cpi:         rates.fixed_cpi         ?? DEFAULT_RATES.fixed_cpi,
    fixed_unlinked:    rates.fixed_unlinked     ?? DEFAULT_RATES.fixed_unlinked,
    variable_cpi:      rates.variable_cpi       ?? DEFAULT_RATES.variable_cpi,
    variable_cpi_1yr:  rates.variable_cpi_1yr   ?? DEFAULT_RATES.variable_cpi_1yr,
    variable_unlinked: rates.variable_unlinked  ?? DEFAULT_RATES.variable_unlinked,
  }));

  return { banks, surveyDate };
}

async function main() {
  console.log("Scraping mortgage rates from supermarker.themarker.com…");
  const { banks, surveyDate } = await scrapeThemarker(1_000_000, 25);

  const data = {
    updatedAt: new Date().toISOString(),
    surveyDate: surveyDate || null,
    banks,
  };

  const outPath = path.join(__dirname, "../data/rates-cache.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`\nSaved ${banks.length} banks to ${outPath}`);
  console.log(`Survey date: ${surveyDate}`);
  console.log("Banks:");
  banks.forEach(b => console.log(`  ${b.name}: prime=${(b.prime*100).toFixed(2)}%`));
}

main().catch(err => { console.error("Error:", err.message); process.exit(1); });
