const { calcMonthly, calcTotalInterest, recommendMix, scoreBank } = require("../../lib/calculations");

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
  test("stability → fixed_unlinked at 50%", () => {
    const mix = recommendMix(["stability"]);
    const fixedUnlinked = mix.find((m) => m.track === "fixed_unlinked");
    expect(fixedUnlinked).toBeDefined();
    expect(fixedUnlinked.pct).toBe(50);
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
});

describe("scoreBank", () => {
  const bankA = { prime: 0.05, fixed_cpi: 0.03, fixed_unlinked: 0.045, variable_cpi: 0.028, variable_unlinked: 0.044, variable_cpi_1yr: 0.024 };
  const bankB = { prime: 0.06, fixed_cpi: 0.04, fixed_unlinked: 0.055, variable_cpi: 0.038, variable_unlinked: 0.054, variable_cpi_1yr: 0.034 };

  test("cheaper bank gets lower score", () => {
    const scoreA = scoreBank(bankA, ["stability"], 1000000, 25).score;
    const scoreB = scoreBank(bankB, ["stability"], 1000000, 25).score;
    expect(scoreA).toBeLessThan(scoreB);
  });

  test("returns totalMonthly and totalInterest", () => {
    const result = scoreBank(bankA, ["low_total"], 500000, 20);
    expect(result.totalMonthly).toBeGreaterThan(0);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.score).toBeGreaterThan(0);
  });

  test("fallback for missing variable_cpi", () => {
    const bankNoCpi = { prime: 0.05, fixed_cpi: 0.03, fixed_unlinked: 0.045, variable_unlinked: 0.044 };
    const result = scoreBank(bankNoCpi, ["low_monthly"], 500000, 25);
    expect(result.totalMonthly).toBeGreaterThan(0);
  });
});
