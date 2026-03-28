/**
 * Pure calculation functions for mortgage computations.
 * Extracted from pages/wizard.js for testability.
 */

// Returns [{track, pct}] based on goals
function recommendMix(goals) {
  const has = (g) => goals.includes(g);
  if (has("stability") && !has("low_total"))
    return [{ track: "fixed_unlinked", pct: 50 }, { track: "fixed_cpi", pct: 33 }, { track: "prime", pct: 17 }];
  if (has("low_monthly") && !has("stability"))
    return [{ track: "prime", pct: 34 }, { track: "variable_unlinked", pct: 33 }, { track: "variable_cpi", pct: 33 }];
  if (has("early_repay"))
    return [{ track: "prime", pct: 33 }, { track: "fixed_unlinked", pct: 34 }, { track: "fixed_cpi", pct: 33 }];
  if (has("low_total"))
    return [{ track: "prime", pct: 33 }, { track: "fixed_unlinked", pct: 34 }, { track: "variable_unlinked", pct: 33 }];
  return [{ track: "fixed_unlinked", pct: 33 }, { track: "fixed_cpi", pct: 34 }, { track: "prime", pct: 33 }];
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
function scoreBank(bank, goals, loan, years) {
  const mix = recommendMix(goals);
  let totalMonthly = 0;
  let totalInterest = 0;
  mix.forEach(({ track, pct }) => {
    const portion = (loan * pct) / 100;
    const rate = bank[track] || 0.06;
    totalMonthly += calcMonthly(portion, rate, years);
    totalInterest += calcTotalInterest(portion, rate, years);
  });

  const w = {
    low_monthly:  { monthly: 0.6, interest: 0.4 },
    low_total:    { monthly: 0.2, interest: 0.8 },
    early_repay:  { monthly: 0.4, interest: 0.6 },
    stability:    { monthly: 0.5, interest: 0.5 },
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

module.exports = { recommendMix, calcMonthly, calcTotalInterest, scoreBank };
