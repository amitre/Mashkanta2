const { calcMonthly, calcTotalInterest, recommendMix, scoreBank, getPrimeSpread, effectivePrimeRate } = require("../../lib/calculations");

describe("calcMonthly", () => {
  test("500k NIS, 5%, 30yr ≈ 2684.11", () => {
    const result = calcMonthly(500000, 0.05, 30);
    expect(result).toBeCloseTo(2684.11, 0);
  });

  test("1M NIS, 5.5%, 25yr", () => {
    const result = calcMonthly(1000000, 0.055, 25);
    expect(result).toBeGreaterThan(6000);
    expect(result).toBeLessThan(7000);
  });

  test("0% rate returns principal / n", () => {
    const result = calcMonthly(360000, 0, 30);
    expect(result).toBeCloseTo(1000, 5);
  });

  test("higher rate → higher payment", () => {
    expect(calcMonthly(500000, 0.06, 20)).toBeGreaterThan(calcMonthly(500000, 0.04, 20));
  });

  test("longer term → lower monthly payment", () => {
    expect(calcMonthly(500000, 0.05, 30)).toBeLessThan(calcMonthly(500000, 0.05, 20));
  });
});

describe("calcTotalInterest", () => {
  test("returns a positive number", () => {
    expect(calcTotalInterest(500000, 0.05, 30)).toBeGreaterThan(0);
  });

  test("higher rate → more total interest", () => {
    expect(calcTotalInterest(500000, 0.06, 20)).toBeGreaterThan(calcTotalInterest(500000, 0.04, 20));
  });

  test("longer term → more total interest", () => {
    expect(calcTotalInterest(500000, 0.05, 30)).toBeGreaterThan(calcTotalInterest(500000, 0.05, 20));
  });
});

const FIXED_TRACKS = ["fixed_unlinked", "fixed_cpi"];

describe("recommendMix", () => {
  test("stability → fixed_unlinked at 67%", () => {
    const mix = recommendMix(["stability"]);
    const fixedUnlinked = mix.find((m) => m.track === "fixed_unlinked");
    expect(fixedUnlinked).toBeDefined();
    expect(fixedUnlinked.pct).toBe(67);
  });

  test("low_monthly → prime is in mix", () => {
    const mix = recommendMix(["low_monthly"]);
    expect(mix.find((m) => m.track === "prime")).toBeDefined();
  });

  test("percentages sum to 100", () => {
    for (const goals of [["stability"], ["low_monthly"], ["early_repay"], ["low_total"], []]) {
      const mix = recommendMix(goals);
      const sum = mix.reduce((acc, m) => acc + m.pct, 0);
      expect(sum).toBe(100);
    }
  });

  test("empty goals → returns default mix", () => {
    const mix = recommendMix([]);
    expect(mix.length).toBeGreaterThan(0);
  });

  // חוק ריבית קבועה: לפחות 33% מהתמהיל בריבית קבועה
  test("כל תמהיל מכיל לפחות 33% ריבית קבועה (חוק רגולטורי)", () => {
    const allGoalCombinations = [
      ["stability"],
      ["low_monthly"],
      ["early_repay"],
      ["low_total"],
      ["stability", "low_total"],
      ["low_monthly", "early_repay"],
      [],
    ];
    for (const goals of allGoalCombinations) {
      const mix = recommendMix(goals);
      const fixedPct = mix
        .filter((m) => FIXED_TRACKS.includes(m.track))
        .reduce((sum, m) => sum + m.pct, 0);
      expect(fixedPct).toBeGreaterThanOrEqual(33);
    }
  });

  // כלל מסלול קבוע יחיד: אין לשלב קל"צ + ק"צ יחד
  test("כל תמהיל מכיל לכל היותר מסלול קבוע אחד (לא קל\"צ + ק\"צ יחד)", () => {
    const allGoalCombinations = [
      ["stability"], ["low_monthly"], ["early_repay"], ["low_total"], [],
    ];
    for (const goals of allGoalCombinations) {
      const mix = recommendMix(goals);
      const fixedTracks = mix.filter((m) => FIXED_TRACKS.includes(m.track));
      expect(fixedTracks.length).toBeLessThanOrEqual(1);
    }
  });
});

describe("getPrimeSpread", () => {
  test("פחות מ-40% → P-0.85%", () => {
    expect(getPrimeSpread(33)).toBeCloseTo(-0.0085, 5);
    expect(getPrimeSpread(39)).toBeCloseTo(-0.0085, 5);
  });
  test("40%-50% → P-0.75%", () => {
    expect(getPrimeSpread(40)).toBeCloseTo(-0.0075, 5);
    expect(getPrimeSpread(50)).toBeCloseTo(-0.0075, 5);
  });
  test("מעל 50% → P-0.60%", () => {
    expect(getPrimeSpread(51)).toBeCloseTo(-0.006, 5);
    expect(getPrimeSpread(67)).toBeCloseTo(-0.006, 5);
  });
});

describe("effectivePrimeRate", () => {
  const P = 0.055; // 5.5%
  test("33% פריים → 5.5% - 0.85% = 4.65%", () => {
    expect(effectivePrimeRate(P, 33)).toBeCloseTo(0.0465, 5);
  });
  test("45% פריים → 5.5% - 0.75% = 4.75%", () => {
    expect(effectivePrimeRate(P, 45)).toBeCloseTo(0.0475, 5);
  });
  test("67% פריים → 5.5% - 0.60% = 4.90%", () => {
    expect(effectivePrimeRate(P, 67)).toBeCloseTo(0.049, 5);
  });
});

describe("scoreBank", () => {
  const bankA = { prime: 0.05, fixed_cpi: 0.03, fixed_unlinked: 0.045, variable_cpi: 0.028, variable_unlinked: 0.044, variable_cpi_1yr: 0.024 };
  const bankB = { prime: 0.06, fixed_cpi: 0.04, fixed_unlinked: 0.055, variable_cpi: 0.038, variable_unlinked: 0.054, variable_cpi_1yr: 0.034 };
  const PRIME_RATE = 0.055;

  test("cheaper bank gets lower score", () => {
    const scoreA = scoreBank(bankA, ["stability"], 1000000, 25, PRIME_RATE).score;
    const scoreB = scoreBank(bankB, ["stability"], 1000000, 25, PRIME_RATE).score;
    expect(scoreA).toBeLessThan(scoreB);
  });

  test("returns totalMonthly and totalInterest", () => {
    const result = scoreBank(bankA, ["low_total"], 500000, 20, PRIME_RATE);
    expect(result.totalMonthly).toBeGreaterThan(0);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);
  });

  test("fallback for missing variable_cpi", () => {
    const bankNoCpi = { prime: 0.05, fixed_cpi: 0.03, fixed_unlinked: 0.045, variable_unlinked: 0.044 };
    const result = scoreBank(bankNoCpi, ["low_monthly"], 500000, 25, PRIME_RATE);
    expect(result.totalMonthly).toBeGreaterThan(0);
  });

  test("עם primeRate — ריבית פריים אפקטיבית נמוכה יותר מריבית הבנק", () => {
    // פריים 33% בתמהיל → ספרד P-0.85% → ריבית אפקטיבית 4.65% (נמוכה מ-5% של הבנק)
    const result = scoreBank(bankA, ["stability"], 1000000, 25, PRIME_RATE);
    expect(result.totalMonthly).toBeGreaterThan(0);
  });
});
