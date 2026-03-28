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

/**
 * Parse bank→rate pairs from one track's HTML page.
 * Handles two formats in <td class="ribit2Compare">:
 *   "3.20%"      — absolute rate (fixed/variable tracks)
 *   "P -0.67%"   — prime-linked spread; actual rate = primeRate + spread
 *
 * @param {string} html
 * @param {number|null} primeRate  — e.g. 0.055 (5.5%), needed for "P ±X%" rows
 */
function parseRatesFromHtml(html, primeRate) {
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

    let rateVal;
    // "P -0.67%" or "P +0.10%" — prime-linked spread
    const primeSpreadM = rateText.match(/^P\s*([+-]?\s*\d+(?:[.,]\d+)?)\s*%$/i);
    if (primeSpreadM) {
      if (primeRate == null) continue; // can't compute without prime rate
      const spread = parseFloat(primeSpreadM[1].replace(/\s/g, "").replace(",", ".")) / 100;
      if (isNaN(spread)) continue;
      rateVal = (primeRate + spread) * 100; // convert back to % for unified handling below
    } else {
      rateVal = parseFloat(rateText.replace("%", "").replace(",", "."));
    }

    if (!isNaN(rateVal) && rateVal > 0 && rateVal < 20) {
      bankRates[bankName] = Math.round(rateVal * 10000) / 10000 / 100;
    }
  }
  return bankRates;
}

async function scrapeThemarker(loanAmount, years, primeRate) {
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
    const bankRates = parseRatesFromHtml(html, primeRate);
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

// ---------------------------------------------------------------------------
// Bank of Israel base rate
// ---------------------------------------------------------------------------

/**
 * Fetches the Bank of Israel base interest rate.
 * Tries the BoI statistics API first, falls back to scraping the homepage.
 * Returns { rate: 0.04, date: "28.3.2026" } or null.
 */
async function fetchBoiRate() {
  const debugLines = [];
  const dbg = (s) => { console.log("  " + s); debugLines.push(s); };

  // Method 1: BoI statistics API — try multiple URL shapes
  const today = new Date();
  const startPeriod = `${today.getFullYear() - 1}-01-01`;
  const apiCandidates = [
    `https://edge.boi.gov.il/FusionEdge/services/BulkDownload/v1/series/download?id=IR01&format=json&startPeriod=${startPeriod}`,
    `https://edge.boi.gov.il/FusionEdge/services/BulkDownload/v1/series/download?ids=IR01&format=json`,
    `https://edge.boi.gov.il/FusionEdge/services/BulkDownload/v2/series/download?id=IR01&format=json`,
  ];
  for (const apiUrl of apiCandidates) {
    try {
      dbg(`API: ${apiUrl}`);
      const res = await fetch(apiUrl, {
        headers: { ...BROWSER_HEADERS, Accept: "application/json" },
        redirect: "follow",
      });
      dbg(`HTTP ${res.status}`);
      if (!res.ok) continue;
      const text = await res.text();
      dbg(`raw[500]: ${text.slice(0, 500)}`);
      const data = JSON.parse(text);
      const obs =
        data?.seriesData?.[0]?.observations ||
        data?.SeriesToReturn?.[0]?.Observations ||
        data?.data ||
        (Array.isArray(data) ? data : null);
      if (obs && obs.length > 0) {
        const last = obs[obs.length - 1];
        const rawVal = last.value ?? last.Value ?? last.val;
        const rawDate = last.period ?? last.TimePeriod ?? last.date;
        const rate = parseFloat(rawVal) / 100;
        if (!isNaN(rate) && rate > 0 && rate < 0.5) {
          const dateStr = rawDate ? String(rawDate).replace(/(\d{4})-(\d{2}).*/, "$2/$1") : null;
          dbg(`FOUND: ${(rate * 100).toFixed(2)}% date=${dateStr}`);
          fs.writeFileSync(path.join(__dirname, "../data/boi-debug.json"),
            JSON.stringify({ debugLines, source: "api" }, null, 2));
          return { rate, date: dateStr };
        }
      }
      dbg("parsed but no valid observation");
    } catch (e) {
      dbg(`error: ${e.message}`);
    }
  }

  // Method 2: monetary policy decisions page (server-side rendered)
  const pageCandidates = [
    "https://www.boi.org.il/he/monetarypolicy/monetarypolicydecisions/Pages/Default.aspx",
    "https://www.boi.org.il/en/monetary-policy/monetary-policy-interest-rate/",
    "https://www.boi.org.il/he/",
    "https://www.boi.org.il/",
  ];
  for (const pageUrl of pageCandidates) {
    try {
      dbg(`Page: ${pageUrl}`);
      const res = await fetch(pageUrl, { headers: BROWSER_HEADERS, redirect: "follow" });
      dbg(`HTTP ${res.status}`);
      if (!res.ok) continue;
      const html = await res.text();
      const decoded = decodeEntities(html);

      // Look for standalone rate value near ריבית — exclude URL-encoded matches
      // A real percentage looks like "4%" or "4.5%" as standalone text, NOT inside a URL
      const textBlocks = decoded
        .replace(/https?:\/\/[^\s"<>]*/g, " ")    // strip URLs first
        .replace(/<[^>]+>/g, " ");                 // strip tags

      dbg(`text length: ${textBlocks.length}`);

      // Log all % occurrences in cleaned text
      const pctHits = [...textBlocks.matchAll(/(\d+(?:[.,]\d+)?)\s*%/g)]
        .filter(m => parseFloat(m[1]) < 100 && parseFloat(m[1]) > 0)
        .slice(0, 20)
        .map(m => `${m[0]}@${m.index}: "${textBlocks.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, " ")}"`);
      dbg(`% in text: ${JSON.stringify(pctHits)}`);

      // Specific pattern: "ריבית בנק ישראל 4%" (the widget text)
      const specificM = textBlocks.match(/ריבית\s*בנק\s*ישראל\s*(\d+(?:[.,]\d+)?)\s*%/);
      if (specificM) {
        const rate = parseFloat(specificM[1].replace(",", ".")) / 100;
        if (!isNaN(rate) && rate >= 0.01 && rate <= 0.15) {
          // Also extract next decision date if present
          const dateM = textBlocks.match(/מועד\s*ההחלטה\s*הבא[:\s]*(\d{2}\/\d{2}\/\d{4})/);
          const d = new Date();
          const todayStr = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
          const dateStr = dateM ? dateM[1].replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$1.$2.$3") : todayStr;
          dbg(`FOUND: ${(rate * 100).toFixed(2)}% nextDecision=${dateM?.[1]} from ${pageUrl}`);
          fs.writeFileSync(path.join(__dirname, "../data/boi-debug.json"),
            JSON.stringify({ debugLines, source: pageUrl, rate, date: todayStr, nextDecision: dateM?.[1] }, null, 2));
          return { rate, date: todayStr, nextDecision: dateM?.[1] };
        }
      }
      dbg(`not found on ${pageUrl}`);
    } catch (e) {
      dbg(`error: ${e.message}`);
    }
  }

  fs.writeFileSync(path.join(__dirname, "../data/boi-debug.json"),
    JSON.stringify({ debugLines, source: null }, null, 2));
  return null;
}

async function main() {
  // Fetch BoI rate FIRST — needed to compute prime-linked track rates
  console.log("Fetching Bank of Israel base rate…");
  const boiResult = await fetchBoiRate();

  // Prime rate = BoI base rate + 1.5%
  const boiRate        = boiResult?.rate         ?? null;
  const primeRate      = boiRate != null ? Math.round((boiRate + 0.015) * 10000) / 10000 : null;
  console.log(`BoI: ${boiRate != null ? (boiRate * 100).toFixed(2) + "%" : "not found"}, prime: ${primeRate != null ? (primeRate * 100).toFixed(2) + "%" : "unknown"}`);

  console.log("\nScraping mortgage rates from supermarker.themarker.com…");
  const { banks, surveyDate } = await scrapeThemarker(1_000_000, 25, primeRate);
  const boiRateDate    = boiResult?.date         ?? null;
  const nextDecision   = boiResult?.nextDecision ?? null;

  const data = {
    updatedAt:    new Date().toISOString(),
    surveyDate:   surveyDate    || null,
    boiRate,
    primeRate,
    boiRateDate,
    nextDecision,
    banks,
  };

  const outPath = path.join(__dirname, "../data/rates-cache.json");
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`\nSaved ${banks.length} banks to ${outPath}`);
  console.log(`Survey date: ${surveyDate}`);
  console.log(`BoI base rate: ${boiRate != null ? (boiRate * 100).toFixed(2) + "%" : "not found"}`);
  console.log(`Prime rate: ${primeRate != null ? (primeRate * 100).toFixed(2) + "%" : "not found"}`);
  console.log("Banks:");
  banks.forEach(b => console.log(`  ${b.name}: prime=${(b.prime*100).toFixed(2)}%`));
}

main().catch(err => { console.error("Error:", err.message); process.exit(1); });
