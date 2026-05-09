/**
 * Pure calculation functions for mortgage computations.
 * Extracted from pages/wizard.js for testability.
 */

const FIXED_TRACKS = ["fixed_unlinked", "fixed_cpi"];
const MIN_FIXED_PCT = 33; // רגולציה ישראלית: לפחות שליש מהמימון בריבית קבועה

/**
 * פריים ספרד לפי אחוז הפריים בתמהיל:
 *  < 40%  → P - 0.85%
 *  40-50% → P - 0.75%
 *  > 50%  → P - 0.60%
 */
function getPrimeSpread(primePct) {
  if (primePct < 40)  return -0.0085;
  if (primePct <= 50) return -0.0075;
  return -0.006;
}

/**
 * מחזיר את ריבית הפריים האפקטיבית לפי אחוז הפריים בתמהיל.
 * primeRate = ריבית הפריים הנוכחית (כגון 0.055 = 5.5%)
 */
function effectivePrimeRate(primeRate, primePct) {
  return primeRate + getPrimeSpread(primePct);
}

/**
 * Ensures at least MIN_FIXED_PCT% of the mix is in fixed-rate tracks.
 */
function enforceFixedMinimum(mix) {
  const fixedPct = mix
    .filter((m) => FIXED_TRACKS.includes(m.track))
    .reduce((sum, m) => sum + m.pct, 0);

  if (fixedPct >= MIN_FIXED_PCT) return mix;

  const deficit = MIN_FIXED_PCT - fixedPct;
  const result = mix.map((m) => ({ ...m }));

  const fixedEntry = result.find((m) => m.track === "fixed_unlinked")
    || result.find((m) => m.track === "fixed_cpi");

  if (fixedEntry) {
    fixedEntry.pct += deficit;
  } else {
    result.push({ track: "fixed_unlinked", pct: deficit });
  }

  const nonFixed = result.filter((m) => !FIXED_TRACKS.includes(m.track));
  const nonFixedTotal = nonFixed.reduce((s, m) => s + m.pct, 0);
  nonFixed.forEach((m) => {
    m.pct = Math.round(m.pct - (m.pct / nonFixedTotal) * deficit);
  });

  const total = result.reduce((s, m) => s + m.pct, 0);
  if (total !== 100) result[0].pct += 100 - total;

  return result.filter((m) => m.pct > 0);
}

// ממיר תמהיל למסלולים צמודי מדד בלבד (כאשר ההחזר עולה על 40% מהכנסה פנויה)
function convertToCpiLinked(mix) {
  const CPI_MAP = {
    fixed_unlinked: "fixed_cpi",
    prime: "variable_cpi",
    variable_unlinked: "variable_cpi",
  };

  const converted = mix.map(({ track, pct }) => ({
    track: CPI_MAP[track] || track,
    pct,
  }));

  // מיזוג מסלולים כפולים (prime + variable_unlinked → שניהם הופכים ל-variable_cpi)
  const merged = {};
  for (const { track, pct } of converted) {
    merged[track] = (merged[track] || 0) + pct;
  }

  return Object.entries(merged).map(([track, pct]) => ({ track, pct }));
}

// Returns [{track, pct}] based on goals — minimum 33% fixed guaranteed
// שלוש מטרות בלבד: stability / balanced / flexible
function recommendMix(goals) {
  const has = (g) => goals.includes(g);
  if (has("stability"))
    return enforceFixedMinimum([{ track: "fixed_unlinked", pct: 67 }, { track: "prime", pct: 33 }]);
  if (has("flexible"))
    return enforceFixedMinimum([{ track: "fixed_unlinked", pct: 33 }, { track: "prime", pct: 67 }]);
  // balanced (default)
  return enforceFixedMinimum([{ track: "fixed_unlinked", pct: 33 }, { track: "prime", pct: 34 }, { track: "variable_unlinked", pct: 33 }]);
}

function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function calcTotalInterest(principal, annualRate, years) {
  const monthly = calcMonthly(principal, annualRate, years);
  return monthly * years * 12 - principal;
}

// Score a bank for given goals (lower is better)
// primeRate (optional): ריבית הפריים הנוכחית מבנק ישראל — לחישוב ספרד מדויק
// forceCpiLinked (optional): כאשר ההחזר עולה על 40% מהכנסה פנויה — ממיר לצמוד מדד
function scoreBank(bank, goals, loan, years, primeRate, forceCpiLinked) {
  let mix = recommendMix(goals);
  if (forceCpiLinked) mix = convertToCpiLinked(mix);
  const primePct = (mix.find((m) => m.track === "prime") || {}).pct || 0;

  let totalMonthly = 0;
  let totalInterest = 0;
  mix.forEach(({ track, pct }) => {
    const portion = (loan * pct) / 100;
    let rate;
    if (track === "prime" && primeRate != null) {
      rate = effectivePrimeRate(primeRate, primePct);
    } else {
      rate = bank[track] || 0.06;
    }
    totalMonthly += calcMonthly(portion, rate, years);
    totalInterest += calcTotalInterest(portion, rate, years);
  });

  const w = {
    stability: { monthly: 0.5, interest: 0.5 },
    balanced:  { monthly: 0.4, interest: 0.6 },
    flexible:  { monthly: 0.6, interest: 0.4 },
  };
  if (bank.variable_cpi === undefined) bank = { ...bank, variable_cpi: 0.028 };

  let score = 0;
  let weight = 0;
  goals.forEach((g) => {
    if (w[g]) {
      score += w[g].monthly * totalMonthly + w[g].interest * totalInterest;
      weight++;
    }
  });
  if (weight === 0) score = totalMonthly + totalInterest * 0.1;
  else score /= weight;

  return { bank, totalMonthly, totalInterest, score };
}

module.exports = { recommendMix, calcMonthly, calcTotalInterest, scoreBank, effectivePrimeRate, getPrimeSpread, convertToCpiLinked };
