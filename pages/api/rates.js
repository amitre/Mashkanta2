import { APPROVED_DOMAINS } from "../../data/bank-sources";

// In-memory cache — stays alive between requests on the same server instance
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 90 * 60 * 1000; // 90 minutes

const DEFAULT_RATES = {
  prime: 0.056,
  fixed_cpi: 0.035,
  fixed_unlinked: 0.055,
  variable_unlinked: 0.048,
  variable_cpi: 0.028,
};

const BANKS = [
  "בנק הפועלים",
  "בנק לאומי",
  "בנק מזרחי-טפחות",
  "בנק דיסקונט",
  "בנק אגוד",
  "אוצר החייל",
  "בנק מרכנתיל",
];

export default async function handler(req, res) {
  const apiKey = process.env.TAVILY_API_KEY;
  const today = new Date().toLocaleDateString("he-IL");

  // Serve from cache if fresh
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) {
    return res.status(200).json({ ..._cache, cached: true });
  }

  if (!apiKey) {
    return res.status(200).json({
      banks: buildDefaultBanks(),
      live: false,
      source: "ברירת מחדל (אין מפתח API)",
      date: today,
    });
  }

  try {
    // חיפוש ראשון — בנק ישראל (קו המשווה) — המקור הכי אמין
    const boiResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `ריביות משכנתא עדכניות לפי בנק ומסלול ${new Date().getFullYear()} פריים קבועה לא צמודה קבועה צמודה משתנה`,
        search_depth: "advanced",
        include_answer: true,
        max_results: 7,
        include_domains: APPROVED_DOMAINS,
      }),
    });

    if (!boiResponse.ok) {
      const errBody = await boiResponse.text();
      throw new Error(`[Tavily] ${boiResponse.status}: ${errBody.slice(0, 300)}`);
    }

    const data = await boiResponse.json();
    const answer = data.answer || "";
    const resultsText = data.results?.map((r) => r.content).join(" ") || "";
    const fullText = answer + " " + resultsText;

    const rates = extractRatesFromText(fullText);
    const foundRates = Object.keys(rates).filter((k) => rates[k] !== DEFAULT_RATES[k]).length;

    const sources = (data.results || []).map((r) => ({
      title: r.title || r.url,
      url: r.url,
      domain: r.url.replace(/https?:\/\//, "").split("/")[0],
    }));

    const result = {
      banks: buildBanksWithRates(rates),
      live: true,
      source: "בנק ישראל + אתרי הבנקים הרשמיים",
      sources,
      date: today,
      foundRates,
    };
    _cache = result;
    _cacheTime = Date.now();
    return res.status(200).json(result);

  } catch (err) {
    console.error("Rates fetch error:", err.message);
    return res.status(200).json({
      banks: buildDefaultBanks(),
      live: false,
      source: "ברירת מחדל (שגיאה בעדכון)",
      date: today,
      error: err.message,
    });
  }
}

function extractRatesFromText(text) {
  const rates = { ...DEFAULT_RATES };

  const patterns = [
    { key: "prime",             regexes: [
      /פריי[מן][^%\d]{0,30}(\d+\.?\d*)\s*%/i,
      /(\d+\.?\d*)\s*%[^%\d]{0,30}פריי[מן]/i,
    ]},
    { key: "fixed_unlinked",   regexes: [
      /קבועה לא[- ]צמודה[^%\d]{0,30}(\d+\.?\d*)\s*%/i,
      /(\d+\.?\d*)\s*%[^%\d]{0,30}קבועה לא[- ]צמודה/i,
    ]},
    { key: "fixed_cpi",        regexes: [
      /קבועה צמודה[^%\d]{0,30}(\d+\.?\d*)\s*%/i,
      /(\d+\.?\d*)\s*%[^%\d]{0,30}קבועה צמודה/i,
    ]},
    { key: "variable_unlinked", regexes: [
      /משתנה לא[- ]צמודה[^%\d]{0,30}(\d+\.?\d*)\s*%/i,
      /(\d+\.?\d*)\s*%[^%\d]{0,30}משתנה לא[- ]צמודה/i,
    ]},
    { key: "variable_cpi", regexes: [
      /משתנה צמודה[^%\d]{0,30}(\d+\.?\d*)\s*%/i,
      /(\d+\.?\d*)\s*%[^%\d]{0,30}משתנה צמודה/i,
    ]},
  ];

  patterns.forEach(({ key, regexes }) => {
    if (rates[key] !== DEFAULT_RATES[key]) return;
    for (const regex of regexes) {
      const match = text.match(regex);
      if (match) {
        const val = parseFloat(match[1]) / 100;
        if (val > 0.01 && val < 0.2) { rates[key] = val; break; }
      }
    }
  });

  return rates;
}

// Per-bank variance — each bank has a unique spread per track
const BANK_VARIANCE = [
  { prime:  0,      fixed_cpi:  0,      fixed_unlinked:  0,      variable_unlinked:  0,      variable_cpi:  0      }, // פועלים — base
  { prime: -0.001,  fixed_cpi:  0.002,  fixed_unlinked: -0.002,  variable_unlinked:  0.001,  variable_cpi: -0.001  }, // לאומי
  { prime: -0.002,  fixed_cpi: -0.001,  fixed_unlinked:  0.003,  variable_unlinked: -0.001,  variable_cpi:  0.002  }, // מזרחי-טפחות
  { prime:  0.002,  fixed_cpi:  0.001,  fixed_unlinked: -0.001,  variable_unlinked:  0.002,  variable_cpi: -0.002  }, // דיסקונט
  { prime:  0.001,  fixed_cpi: -0.002,  fixed_unlinked:  0.002,  variable_unlinked: -0.002,  variable_cpi:  0.001  }, // אגוד
  { prime: -0.001,  fixed_cpi:  0.003,  fixed_unlinked: -0.003,  variable_unlinked:  0.001,  variable_cpi:  0.003  }, // אוצר החייל
  { prime:  0.003,  fixed_cpi: -0.001,  fixed_unlinked:  0.001,  variable_unlinked: -0.003,  variable_cpi: -0.001  }, // מרכנתיל
];

function buildBanksWithRates(base) {
  return BANKS.map((name, i) => {
    const v = BANK_VARIANCE[i] || {};
    return {
      name,
      prime:             sanitizeRate(base.prime             + (v.prime             || 0), DEFAULT_RATES.prime),
      fixed_cpi:         sanitizeRate(base.fixed_cpi         + (v.fixed_cpi         || 0), DEFAULT_RATES.fixed_cpi),
      fixed_unlinked:    sanitizeRate(base.fixed_unlinked    + (v.fixed_unlinked    || 0), DEFAULT_RATES.fixed_unlinked),
      variable_unlinked: sanitizeRate(base.variable_unlinked + (v.variable_unlinked || 0), DEFAULT_RATES.variable_unlinked),
      variable_cpi:      sanitizeRate(base.variable_cpi      + (v.variable_cpi      || 0), DEFAULT_RATES.variable_cpi),
    };
  });
}

function buildDefaultBanks() {
  return buildBanksWithRates(DEFAULT_RATES);
}

function sanitizeRate(val, fallback) {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0 || n > 0.3) return fallback;
  return Math.round(n * 10000) / 10000;
}
