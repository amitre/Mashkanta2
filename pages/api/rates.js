/**
 * /api/rates?loan=AMOUNT&years=YEARS
 *
 * Scrapes per-track, per-bank mortgage rates from supermarker.themarker.com.
 * For each mortgage track found in the site's select box, submits the form
 * with the user's loan amount and term, then parses the results table.
 *
 * Falls back to default rates if scraping fails.
 */

const SCRAPE_URL =
  "https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8",
  "Cache-Control": "no-cache",
};

// Map text found in site's track dropdown to our internal keys
const TRACK_TEXT_MAP = [
  { key: "prime",             patterns: ["פריים"] },
  { key: "fixed_unlinked",   patterns: ["קבועה לא צמודה", 'קל"צ', "קלצ"] },
  { key: "fixed_cpi",        patterns: ["קבועה צמודה", 'קצ"מ', "קצמ"] },
  { key: "variable_unlinked",patterns: ["משתנה לא צמודה", 'מל"צ', "מלצ"] },
  { key: "variable_cpi",     patterns: ["משתנה צמודה", 'מצ"מ', "מצמ"] },
];

// Map substrings of bank names to our canonical names
const BANK_PATTERNS = [
  { key: "בנק הפועלים",     patterns: ["הפועלים", "פועלים"] },
  { key: "בנק לאומי",       patterns: ["לאומי"] },
  { key: "בנק מזרחי-טפחות", patterns: ["מזרחי", "טפחות"] },
  { key: "בנק דיסקונט",     patterns: ["דיסקונט"] },
  { key: "בנק ירושלים",     patterns: ["ירושלים"] },
  { key: "הבנק הבינלאומי",  patterns: ["בינלאומי"] },
  { key: "בנק אגוד",        patterns: ["אגוד"] },
  { key: "אוצר החייל",      patterns: ["אוצר"] },
  { key: "בנק מרכנתיל",     patterns: ["מרכנתיל"] },
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
// HTML parsing helpers (no external dependencies)
// ---------------------------------------------------------------------------

function extractHiddenInputs(html) {
  const fields = {};
  const re = /<input[^>]+>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    if (!/type=["']?hidden["']?/i.test(tag)) continue;
    const nameM = tag.match(/\bname=["']([^"']*)["']/i);
    const valM  = tag.match(/\bvalue=["']([^"']*)["']/i);
    if (nameM) fields[nameM[1]] = valM ? valM[1] : "";
  }
  return fields;
}

function extractSelects(html) {
  const selects = {};
  const selectRe = /<select([^>]*)>([\s\S]*?)<\/select>/gi;
  let sm;
  while ((sm = selectRe.exec(html)) !== null) {
    const attrs   = sm[1];
    const content = sm[2];
    const nameM = attrs.match(/\bname=["']([^"']*)["']/i);
    if (!nameM) continue;
    const name = nameM[1];
    const options = [];
    const optRe = /<option([^>]*)>([\s\S]*?)<\/option>/gi;
    let om;
    while ((om = optRe.exec(content)) !== null) {
      const valM = om[1].match(/\bvalue=["']([^"']*)["']/i);
      const text = om[2].replace(/<[^>]+>/g, "").trim();
      options.push({ value: valM ? valM[1] : text, text });
    }
    selects[name] = options;
  }
  return selects;
}

/** Return all visible input/select names (not hidden, not submit/button) */
function extractVisibleInputNames(html) {
  const names = [];
  const re = /<input([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    const typeM = tag.match(/\btype=["']?(\w+)["']?/i);
    const type  = typeM ? typeM[1].toLowerCase() : "text";
    if (["hidden", "submit", "button", "image", "reset", "checkbox", "radio"].includes(type)) continue;
    const nameM = tag.match(/\bname=["']([^"']*)["']/i);
    if (nameM) names.push(nameM[1]);
  }
  return names;
}

function extractSubmitInputs(html) {
  const submits = {};
  const re = /<input([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    if (!/type=["']?submit["']?/i.test(tag)) continue;
    const nameM = tag.match(/\bname=["']([^"']*)["']/i);
    const valM  = tag.match(/\bvalue=["']([^"']*)["']/i);
    if (nameM) submits[nameM[1]] = valM ? valM[1] : "";
  }
  return submits;
}

/** Find the select whose options contain mortgage track names */
function findTrackSelect(selects) {
  for (const [name, options] of Object.entries(selects)) {
    const hasTrack = options.some((opt) => mapTextToTrack(opt.text) !== null);
    if (hasTrack) return { name, options };
  }
  return null;
}

/** Map a text string to one of our track keys */
function mapTextToTrack(text) {
  const t = text.trim();
  for (const { key, patterns } of TRACK_TEXT_MAP) {
    if (patterns.some((p) => t.includes(p))) return key;
  }
  return null;
}

/** Map a cell text to a canonical bank name */
function mapTextToBank(text) {
  const t = text.trim();
  for (const { key, patterns } of BANK_PATTERNS) {
    if (patterns.some((p) => t.includes(p))) return key;
  }
  return null;
}

/**
 * Given the POST response HTML and a track key, extract { bankName: rate } pairs.
 * Looks through all tables for rows that have a bank name cell and a numeric rate cell.
 */
function parseRatesFromHtml(html) {
  const bankRates = {}; // bankName -> rate (decimal)

  // Find all <table> blocks
  const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tm;
  while ((tm = tableRe.exec(html)) !== null) {
    const tableContent = tm[1];
    const rows = [];

    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rm;
    while ((rm = rowRe.exec(tableContent)) !== null) {
      const cells = [];
      const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cm;
      while ((cm = cellRe.exec(rm[1])) !== null) {
        cells.push(cm[1].replace(/<[^>]+>/g, "").trim());
      }
      if (cells.length > 0) rows.push(cells);
    }

    // Does this table contain at least one bank name?
    const hasBankRow = rows.some((row) => row.some((cell) => mapTextToBank(cell) !== null));
    if (!hasBankRow) continue;

    for (const row of rows) {
      let bankName = null;
      let rate = null;

      for (const cell of row) {
        if (!bankName) bankName = mapTextToBank(cell);
        // Look for a decimal number that looks like a percentage (0.1 – 15)
        if (!rate) {
          const numM = cell.match(/^(\d{1,2}(?:[.,]\d{1,4})?)%?$/);
          if (numM) {
            const v = parseFloat(numM[1].replace(",", "."));
            if (v > 0.1 && v < 15) rate = v / 100;
          }
        }
      }

      if (bankName && rate) bankRates[bankName] = rate;
    }

    if (Object.keys(bankRates).length > 0) break;
  }

  return bankRates;
}

// ---------------------------------------------------------------------------
// Core scraper
// ---------------------------------------------------------------------------

async function scrapeThemarker(loanAmount, years) {
  // 1. GET the page to obtain ASP.NET state fields and form structure
  const pageRes = await fetch(SCRAPE_URL, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
  });
  if (!pageRes.ok) throw new Error(`GET failed: ${pageRes.status}`);

  const pageHtml = await pageRes.text();

  // Collect session cookie(s)
  const setCookie = pageRes.headers.get("set-cookie") || "";
  const cookies = setCookie
    .split(/,(?=[^ ].*?=)/)
    .map((c) => c.split(";")[0].trim())
    .join("; ");

  // 2. Extract form structure
  const hiddenFields  = extractHiddenInputs(pageHtml);
  const selects       = extractSelects(pageHtml);
  const visibleInputs = extractVisibleInputNames(pageHtml);
  const submitInputs  = extractSubmitInputs(pageHtml);

  // 3. Find the track select box
  const trackSelect = findTrackSelect(selects);
  if (!trackSelect) throw new Error("Could not find mortgage track select on page");

  // 4. Identify loan-amount and years fields heuristically
  const loanFieldName = visibleInputs.find((n) =>
    /loan|sum|amount|סכום|הלוואה|mashkanta/i.test(n)
  ) || visibleInputs[0];

  const yearsFieldName = visibleInputs.find((n) =>
    /year|period|term|שנ|תקופ/i.test(n)
  ) || visibleInputs[1];

  if (!loanFieldName || !yearsFieldName) {
    throw new Error(`Could not identify amount/years fields. Visible inputs: ${visibleInputs.join(", ")}`);
  }

  // Build the base form data (hidden ASP.NET fields + submit button)
  const baseForm = {
    ...hiddenFields,
    ...submitInputs,
  };

  // 5. Iterate over every track option, submit the form, parse results
  const result = {}; // bankName -> { prime, fixed_cpi, ... }

  for (const option of trackSelect.options) {
    const trackKey = mapTextToTrack(option.text);
    if (!trackKey) continue; // skip options we don't recognise (e.g. "-- בחר --")

    const formData = new URLSearchParams({
      ...baseForm,
      [loanFieldName]:     String(loanAmount),
      [yearsFieldName]:    String(years),
      [trackSelect.name]:  option.value,
    });

    const postRes = await fetch(SCRAPE_URL, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
        Referer: SCRAPE_URL,
      },
      body: formData.toString(),
      redirect: "follow",
    });

    if (!postRes.ok) continue;

    const postHtml = await postRes.text();
    const bankRates = parseRatesFromHtml(postHtml);

    for (const [bankName, rate] of Object.entries(bankRates)) {
      if (!result[bankName]) result[bankName] = {};
      result[bankName][trackKey] = rate;
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("Scraped 0 bank rates — site structure may have changed");
  }

  // 6. Convert to array, fill missing tracks with defaults
  return Object.entries(result).map(([name, rates]) => ({
    name,
    prime:             rates.prime             ?? DEFAULT_RATES.prime,
    fixed_cpi:         rates.fixed_cpi         ?? DEFAULT_RATES.fixed_cpi,
    fixed_unlinked:    rates.fixed_unlinked     ?? DEFAULT_RATES.fixed_unlinked,
    variable_unlinked: rates.variable_unlinked  ?? DEFAULT_RATES.variable_unlinked,
    variable_cpi:      rates.variable_cpi       ?? DEFAULT_RATES.variable_cpi,
  }));
}

// ---------------------------------------------------------------------------
// Fallback: hardcoded default banks
// ---------------------------------------------------------------------------

const BANKS = [
  "בנק הפועלים",
  "בנק לאומי",
  "בנק מזרחי-טפחות",
  "בנק דיסקונט",
  "בנק אגוד",
  "אוצר החייל",
  "בנק מרכנתיל",
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

function sanitizeRate(val) {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0 || n > 0.3) return null;
  return Math.round(n * 10000) / 10000;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export default async function handler(req, res) {
  const today = new Date().toLocaleDateString("he-IL");

  // loan and years come from the wizard's onboarding data
  const loan  = parseInt(req.query.loan)  || 1000000;
  const years = parseInt(req.query.years) || 25;

  const cacheKey = `${loan}_${years}`;
  const cached = _cache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.status(200).json({ ...cached.data, cached: true });
  }

  try {
    const banks = await scrapeThemarker(loan, years);

    const data = {
      banks,
      live: true,
      source: "supermarker.themarker.com",
      date: today,
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
