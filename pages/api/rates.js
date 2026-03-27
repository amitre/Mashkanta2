/**
 * /api/rates?loan=AMOUNT&years=YEARS
 *
 * Scrapes per-track, per-bank mortgage rates from supermarker.themarker.com.
 * For each mortgage track in the site's select box, submits the form with the
 * user's loan amount and term, then parses the results table.
 *
 * Falls back to hardcoded defaults if scraping fails.
 */

const SCRAPE_URL =
  "https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8",
  "Cache-Control": "no-cache",
};

// Map option text in track dropdown → our internal keys
const TRACK_TEXT_MAP = [
  { key: "prime",             patterns: ["פריים"] },
  { key: "fixed_unlinked",   patterns: ["קבועה לא צמודה", 'קל"צ', "קלצ"] },
  { key: "fixed_cpi",        patterns: ["קבועה צמודה", 'קצ"מ', "קצמ"] },
  { key: "variable_unlinked",patterns: ["משתנה לא צמודה", 'מל"צ', "מלצ"] },
  { key: "variable_cpi",     patterns: ["משתנה צמודה", 'מצ"מ', "מצמ"] },
];

// Map substrings found in bank cells (text OR img alt) → canonical names
const BANK_PATTERNS = [
  { key: "בנק הפועלים",      patterns: ["הפועלים", "פועלים"] },
  { key: "בנק לאומי",        patterns: ["לאומי"] },
  { key: "בנק מזרחי-טפחות",  patterns: ["מזרחי", "טפחות"] },
  { key: "בנק דיסקונט",      patterns: ["דיסקונט"] },
  { key: "בנק ירושלים",      patterns: ["ירושלים"] },
  { key: "הבנק הבינלאומי",   patterns: ["בינלאומי"] },
  { key: "בנק אגוד",         patterns: ["אגוד"] },
  { key: "אוצר החייל",       patterns: ["אוצר"] },
  { key: "בנק מרכנתיל",      patterns: ["מרכנתיל"] },
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
// HTML helpers
// ---------------------------------------------------------------------------

/**
 * Extract text from a raw cell innerHTML:
 * - Pulls alt="" attributes from <img> tags (bank logos store name there)
 * - Pulls title="" attributes from any tag
 * - Then strips all remaining HTML tags
 */
function cellText(innerHTML) {
  const parts = [];

  // Collect alt / title attributes before stripping tags
  const attrRe = /\b(?:alt|title)=["']([^"']+)["']/gi;
  let am;
  while ((am = attrRe.exec(innerHTML)) !== null) {
    const v = am[1].trim();
    if (v) parts.push(v);
  }

  // Plain text after stripping tags
  const plain = innerHTML
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (plain) parts.push(plain);

  return parts.join(" ");
}

/** Extract all hidden input values from HTML */
function extractHiddenInputs(html) {
  const fields = {};
  const re = /<input([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    if (!/type=["']?hidden["']?/i.test(tag)) continue;
    const nameM = tag.match(/\bname=["']([^"']*)["']/i);
    const valM  = tag.match(/\bvalue=["']([^"']*)["']/i);
    if (nameM) fields[nameM[1]] = valM ? valM[1] : "";
  }
  return fields;
}

/** Decode numeric HTML entities (&#NNNN;) to characters */
function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/** Extract all <select> elements with their options (entity-decoded) */
function extractSelects(html) {
  const selects = {};
  const selectRe = /<select([^>]*)>([\s\S]*?)<\/select>/gi;
  let sm;
  while ((sm = selectRe.exec(html)) !== null) {
    const nameM = sm[1].match(/\bname=["']([^"']*)["']/i);
    if (!nameM) continue;
    const name = nameM[1];
    const options = [];
    const optRe = /<option([^>]*)>([\s\S]*?)<\/option>/gi;
    let om;
    while ((om = optRe.exec(sm[2])) !== null) {
      const valM = om[1].match(/\bvalue=["']([^"']*)["']/i);
      const text = decodeEntities(om[2].replace(/<[^>]+>/g, "").trim());
      options.push({ value: valM ? valM[1] : text, text });
    }
    selects[name] = options;
  }
  return selects;
}

/**
 * Find the years select — its option texts are numeric year values (5,10,15,20,25,30).
 * Returns { name, valueForYears } where valueForYears is the option value matching the
 * requested number of years.
 */
function findYearsSelect(selects, years) {
  const YEAR_VALUES = { 5:"1", 10:"2", 15:"3", 20:"4", 25:"5", 30:"6" };
  for (const [name, options] of Object.entries(selects)) {
    const texts = options.map((o) => o.text.trim());
    if (texts.includes("15") && texts.includes("25")) {
      // This is the years select — find the value for the requested years
      const match = options.find((o) => o.text.trim() === String(years));
      return { name, value: match ? match.value : (YEAR_VALUES[years] ?? "5") };
    }
  }
  return null;
}

/** Extract names of visible text/number inputs (excluding hidden/submit/button) */
function extractVisibleInputNames(html) {
  const names = [];
  const re = /<input([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    const typeM = tag.match(/\btype=["']?(\w+)["']?/i);
    const type  = typeM ? typeM[1].toLowerCase() : "text";
    const skip  = ["hidden","submit","button","image","reset","checkbox","radio"];
    if (skip.includes(type)) continue;
    const nameM = tag.match(/\bname=["']([^"']*)["']/i);
    if (nameM) names.push(nameM[1]);
  }
  return names;
}

/** Extract submit input name→value pairs */
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
    if (options.some((opt) => mapTextToTrack(opt.text) !== null))
      return { name, options };
  }
  return null;
}

function mapTextToTrack(text) {
  const t = text.trim();
  for (const { key, patterns } of TRACK_TEXT_MAP) {
    if (patterns.some((p) => t.includes(p))) return key;
  }
  return null;
}

function mapTextToBank(text) {
  const t = text.trim();
  for (const { key, patterns } of BANK_PATTERNS) {
    if (patterns.some((p) => t.includes(p))) return key;
  }
  return null;
}

/**
 * Try to parse a percentage value from a cell string.
 * Accepts:  "3.00%"  "3.00"  "3,00%"
 * Rejects:  monthly payments like "6,905.82"  or "₪6905"
 * Returns decimal (0.03) or null.
 */
function parseRate(cellStr) {
  const s = cellStr.trim();
  // Must end with % or be a short number (≤6 chars) — excludes large monthly payments
  const hasPercent = s.endsWith("%");
  const cleaned = s.replace("%", "").replace(",", ".").trim();
  const v = parseFloat(cleaned);
  if (isNaN(v) || v < 0.5 || v > 15) return null; // mortgage rates 0.5%–15%
  if (!hasPercent && cleaned.length > 5) return null; // reject long numbers without %
  return Math.round(v * 10000) / 10000 / 100; // e.g. 3.00 → 0.03
}

/**
 * Parse bank→rate mapping from a results page HTML.
 *
 * Strategy:
 * 1. Find all <table> blocks (scan ALL, pick the one with bank data).
 * 2. For the winning table, detect column indices for "בנק" and "ריבית"
 *    from the header row.
 * 3. Extract (bankName, rate) from each data row using those column indices.
 * 4. If column detection fails, fall back to scanning every cell in each row.
 */
function parseRatesFromHtml(html) {
  const bankRates = {};

  // Collect all table innerHTML blocks — use a stack approach to handle nesting:
  // we want outermost tables only.
  const tableBlocks = [];
  let depth = 0;
  let start = -1;
  const tagRe = /<\/?table[^>]*>/gi;
  let t;
  while ((t = tagRe.exec(html)) !== null) {
    if (t[0].toLowerCase().startsWith("<table")) {
      if (depth === 0) start = t.index;
      depth++;
    } else {
      depth--;
      if (depth === 0 && start >= 0) {
        tableBlocks.push(html.slice(start, t.index + t[0].length));
        start = -1;
      }
    }
  }

  for (const tableHtml of tableBlocks) {
    // Parse rows → cells (using cellText to preserve alt/title)
    const rows = [];
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rm;
    while ((rm = rowRe.exec(tableHtml)) !== null) {
      const cells = [];
      const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cm;
      while ((cm = cellRe.exec(rm[1])) !== null) {
        cells.push(cellText(cm[1]));
      }
      if (cells.length > 0) rows.push(cells);
    }

    // Does this table have at least one recognisable bank name?
    const hasBanks = rows.some((row) =>
      row.some((cell) => mapTextToBank(cell) !== null)
    );
    if (!hasBanks) continue;

    // Try to identify header row → column indices
    let bankCol  = -1;
    let rateCol  = -1;
    for (const row of rows) {
      for (let i = 0; i < row.length; i++) {
        const c = row[i];
        if (bankCol  < 0 && (c.includes("בנק") || c.includes("חברה"))) bankCol  = i;
        if (rateCol  < 0 && c.includes("ריבית")) rateCol = i;
      }
      if (bankCol >= 0 && rateCol >= 0) break;
    }

    if (bankCol >= 0 && rateCol >= 0) {
      // Column-based extraction (most reliable)
      for (const row of rows) {
        if (row.length <= Math.max(bankCol, rateCol)) continue;
        const bankName = mapTextToBank(row[bankCol]);
        if (!bankName) continue;
        const rate = parseRate(row[rateCol]);
        if (rate) bankRates[bankName] = rate;
      }
    } else {
      // Fallback: scan each row for (bankName, rate) pair
      for (const row of rows) {
        let bankName = null;
        let rate = null;
        for (const cell of row) {
          if (!bankName) bankName = mapTextToBank(cell);
          if (!rate)     rate     = parseRate(cell);
        }
        if (bankName && rate) bankRates[bankName] = rate;
      }
    }

    if (Object.keys(bankRates).length > 0) break;
  }

  return bankRates;
}

// ---------------------------------------------------------------------------
// Core scraper
// ---------------------------------------------------------------------------

async function fetchPage(url, options = {}) {
  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, ...(options.headers || {}) },
    redirect: "follow",
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();
  return { html, res };
}

/**
 * Extract the survey date string from the page, e.g. "ינואר 2026".
 * The site displays something like: "סקר ינואר 2026"
 */
function extractSurveyDate(html) {
  const m = html.match(/סקר\s+([\u05D0-\u05EA]+\s+\d{4})/);
  return m ? m[1].trim() : null;
}

/** Collect cookies from Set-Cookie header into a single string */
function parseCookies(res) {
  const raw = res.headers.get("set-cookie") || "";
  return raw
    .split(/,(?=\s*\w+=)/)
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

async function scrapeThemarker(loanAmount, years) {
  // 1. Initial GET — discover form structure
  const { html: pageHtml, res: pageRes } = await fetchPage(SCRAPE_URL);
  let cookies = parseCookies(pageRes);

  const hiddenFields  = extractHiddenInputs(pageHtml);
  const selects       = extractSelects(pageHtml);
  const visibleInputs = extractVisibleInputNames(pageHtml);

  // 2. Find the mortgage-track select box
  const trackSelect = findTrackSelect(selects);
  if (!trackSelect) throw new Error("Track select not found on page");

  // 3. Find the years select (options: "5","10","15","20","25","30")
  const yearsSelect = findYearsSelect(selects, years);
  if (!yearsSelect) throw new Error("Years select not found on page");

  // 4. Find the loan-amount input by name heuristic
  const loanField = visibleInputs.find((n) =>
    /loan|sum|amount|סכום|הלוואה/i.test(n)
  ) ?? visibleInputs[0];
  if (!loanField)
    throw new Error(`Loan amount field not found. Inputs: ${visibleInputs.join(", ")}`);

  // 5. Iterate each track option
  const result = {}; // bankName → { prime, fixed_cpi, … }
  let surveyDate = extractSurveyDate(pageHtml);

  for (const option of trackSelect.options) {
    const trackKey = mapTextToTrack(option.text);
    if (!trackKey) continue;

    const body = new URLSearchParams({
      ...hiddenFields,
      [loanField]:        String(loanAmount),
      [yearsSelect.name]: yearsSelect.value,
      [trackSelect.name]: option.value,
    });

    const { html: postHtml, res: postRes } = await fetchPage(SCRAPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
        Referer: SCRAPE_URL,
      },
      body: body.toString(),
    });

    // Update cookies for next request
    const newCookies = parseCookies(postRes);
    if (newCookies) cookies = newCookies;

    // Update VIEWSTATE from response for subsequent POSTs
    const freshHidden = extractHiddenInputs(postHtml);
    Object.assign(hiddenFields, freshHidden);

    // Try to extract survey date from results page if not yet found
    if (!surveyDate) surveyDate = extractSurveyDate(postHtml);

    const bankRates = parseRatesFromHtml(postHtml);

    for (const [bankName, rate] of Object.entries(bankRates)) {
      if (!result[bankName]) result[bankName] = {};
      result[bankName][trackKey] = rate;
    }
  }

  if (Object.keys(result).length === 0)
    throw new Error("No bank rates found — site structure may have changed");

  // 5. Build final array; fill missing tracks with defaults
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
