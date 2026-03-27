/**
 * /api/rates?loan=AMOUNT&years=YEARS
 *
 * Fetches per-track, per-bank mortgage rates from supermarker.themarker.com.
 * Uses GET with URL params (Years, Product, SUM) — one request per track.
 * Parses <tr class="mortgageHover"> rows: bank name from img alt, rate from
 * <td class="ribit2Compare">.
 *
 * Falls back to hardcoded defaults if the site is unreachable.
 */

const BASE_URL = "https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8",
};

// Map our track keys → site's Product URL param value
const TRACKS = [
  { key: "prime",             product: 5 },
  { key: "fixed_cpi",        product: 3 },
  { key: "fixed_unlinked",   product: 4 },
  { key: "variable_unlinked",product: 69 },
  { key: "variable_cpi",     product: 6 },
];

// Map years → site's Years URL param value (select option value)
const YEARS_MAP = { 5: 1, 10: 2, 15: 3, 20: 4, 25: 5, 30: 6 };

// Map substrings in img alt text → canonical bank names
const BANK_PATTERNS = [
  { key: "בנק הפועלים",      patterns: ["הפועלים"] },
  { key: "הבנק הבינלאומי",   patterns: ["בינלאומי"] }, // must come before לאומי — "בינלאומי" contains "לאומי"
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
  prime: 0.056,
  fixed_cpi: 0.035,
  fixed_unlinked: 0.055,
  variable_unlinked: 0.048,
  variable_cpi: 0.028,
};

// In-memory cache keyed by "loan_years"
const _cache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapTextToBank(text) {
  const t = text.trim();
  for (const { key, patterns } of BANK_PATTERNS) {
    if (patterns.some((p) => t.includes(p))) return key;
  }
  return null;
}

function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"').replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

/**
 * Find the closest Years param value for the requested years.
 * Rounds to the nearest available option (5,10,15,20,25,30).
 */
function yearsToParam(years) {
  if (YEARS_MAP[years]) return YEARS_MAP[years];
  const available = [5, 10, 15, 20, 25, 30];
  const closest = available.reduce((a, b) =>
    Math.abs(b - years) < Math.abs(a - years) ? b : a
  );
  return YEARS_MAP[closest];
}

/**
 * Extract survey date ("ינואר 2026") from the page HTML.
 * The site displays something like "סקר ינואר 2026".
 */
function extractSurveyDate(html) {
  const m = html.match(/סקר\s+([\u05D0-\u05EA]+\s+\d{4})/);
  return m ? m[1].trim() : null;
}

/**
 * Parse bank→rate pairs from one track's result page.
 * Rows: <tr class="mortgageHover">
 * Bank: <img alt="מסלול משכנתא של בנק X">
 * Rate: <td class="... ribit2Compare ..."> X.XX% </td>
 */
function parseRatesFromHtml(html) {
  const bankRates = {};

  const rowRe = /<tr[^>]+class="[^"]*mortgageHover[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  let rm;
  while ((rm = rowRe.exec(html)) !== null) {
    const rowHtml = rm[1];

    // Bank name from img alt
    const altM = rowHtml.match(/alt="([^"]+)"/i);
    if (!altM) continue;
    const bankName = mapTextToBank(decodeEntities(altM[1]));
    if (!bankName) continue;

    // Rate from td.ribit2Compare
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

// ---------------------------------------------------------------------------
// Core scraper
// ---------------------------------------------------------------------------

async function scrapeThemarker(loanAmount, years) {
  const yearsParam = yearsToParam(years);
  const result = {}; // bankName → { prime, fixed_cpi, … }
  let surveyDate = null;

  for (const { key: trackKey, product } of TRACKS) {
    const url = `${BASE_URL}?Years=${yearsParam}&Product=${product}&SUM=${loanAmount}`;

    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (!res.ok) continue;

    const html = await res.text();
    if (!surveyDate) surveyDate = extractSurveyDate(html);

    const bankRates = parseRatesFromHtml(html);
    for (const [bankName, rate] of Object.entries(bankRates)) {
      if (!result[bankName]) result[bankName] = {};
      result[bankName][trackKey] = rate;
    }
  }

  if (Object.keys(result).length === 0)
    throw new Error("No bank rates found — site structure may have changed");

  // Build final array; fill missing tracks with defaults
  const banks = Object.entries(result).map(([name, rates]) => ({
    name,
    prime:             rates.prime             ?? DEFAULT_RATES.prime,
    fixed_cpi:         rates.fixed_cpi         ?? DEFAULT_RATES.fixed_cpi,
    fixed_unlinked:    rates.fixed_unlinked     ?? DEFAULT_RATES.fixed_unlinked,
    variable_unlinked: rates.variable_unlinked  ?? DEFAULT_RATES.variable_unlinked,
    variable_cpi:      rates.variable_cpi       ?? DEFAULT_RATES.variable_cpi,
  }));

  return { banks, surveyDate };
}

// ---------------------------------------------------------------------------
// Fallback — hardcoded default banks
// ---------------------------------------------------------------------------

const BANKS = [
  "בנק הפועלים", "בנק לאומי", "בנק מזרחי-טפחות",
  "בנק דיסקונט", "בנק אגוד", "אוצר החייל", "בנק מרכנתיל",
];

const BANK_VARIANCE = [
  { prime:  0,      fixed_cpi:  0,      fixed_unlinked:  0,      variable_unlinked:  0,      variable_cpi:  0      },
  { prime: -0.001,  fixed_cpi:  0.002,  fixed_unlinked: -0.002,  variable_unlinked:  0.001,  variable_cpi: -0.001  },
  { prime: -0.002,  fixed_cpi: -0.001,  fixed_unlinked:  0.003,  variable_unlinked: -0.001,  variable_cpi:  0.002  },
  { prime:  0.002,  fixed_cpi:  0.001,  fixed_unlinked: -0.001,  variable_unlinked:  0.002,  variable_cpi: -0.002  },
  { prime:  0.001,  fixed_cpi: -0.002,  fixed_unlinked:  0.002,  variable_unlinked: -0.002,  variable_cpi:  0.001  },
  { prime: -0.001,  fixed_cpi:  0.003,  fixed_unlinked: -0.003,  variable_unlinked:  0.001,  variable_cpi:  0.003  },
  { prime:  0.003,  fixed_cpi: -0.001,  fixed_unlinked:  0.001,  variable_unlinked: -0.003,  variable_cpi: -0.001  },
];

function sanitizeRate(val) {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0 || n > 0.3) return null;
  return Math.round(n * 10000) / 10000;
}

function buildDefaultBanks() {
  return BANKS.map((name, i) => {
    const v = BANK_VARIANCE[i] || {};
    return {
      name,
      prime:             sanitizeRate(DEFAULT_RATES.prime             + (v.prime             || 0)),
      fixed_cpi:         sanitizeRate(DEFAULT_RATES.fixed_cpi         + (v.fixed_cpi         || 0)),
      fixed_unlinked:    sanitizeRate(DEFAULT_RATES.fixed_unlinked    + (v.fixed_unlinked    || 0)),
      variable_unlinked: sanitizeRate(DEFAULT_RATES.variable_unlinked + (v.variable_unlinked || 0)),
      variable_cpi:      sanitizeRate(DEFAULT_RATES.variable_cpi      + (v.variable_cpi      || 0)),
    };
  });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  const today = new Date().toLocaleDateString("he-IL");
  const loan  = parseInt(req.query.loan)  || 1000000;
  const years = parseInt(req.query.years) || 25;

  const cacheKey = `${loan}_${years}`;
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  try {
    const { banks, surveyDate } = await scrapeThemarker(loan, years);
    const data = {
      banks,
      live: true,
      source: "supermarker.themarker.com",
      date: today,
      surveyDate: surveyDate || null,
    };
    _cache.set(cacheKey, { data, time: Date.now() });
    return res.status(200).json(data);
  } catch (err) {
    console.error("Themarker scrape error:", err.message);
    return res.status(200).json({
      banks: buildDefaultBanks(),
      live: false,
      source: "ברירת מחדל (שגיאה בגישה לאתר)",
      date: today,
      error: err.message,
    });
  }
}
