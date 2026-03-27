import { useState, useEffect } from "react";

const STEPS = [
  { id: 1, label: "הלוואה" },
  { id: 2, label: "מטרות" },
  { id: 3, label: "הכנסה" },
  { id: 4, label: "תוצאות" },
];

const APARTMENT_STATUS = [
  { id: "first", label: "דירה ראשונה", maxLtv: 75 },
  { id: "second", label: "דירה שנייה +", maxLtv: 70 },
  { id: "investor", label: "משקיע", maxLtv: 50 },
  { id: "new_immigrant", label: "עולה חדש", maxLtv: 75 },
];

const GOALS = [
  { id: "low_monthly", label: "תשלום חודשי נמוך", sub: "לחץ פיננסי מינימלי עכשיו", icon: "💰", color: "#38a169", bg: "#f0fff4" },
  { id: "low_total", label: "עלות כוללת נמוכה", sub: "פחות ריבית לאורך זמן", icon: "📉", color: "#e53e3e", bg: "#fff5f5" },
  { id: "early_repay", label: "גמישות לפירעון מוקדם", sub: "עשוי להחזיר מוקדם", icon: "🔓", color: "#3182ce", bg: "#ebf8ff" },
  { id: "stability", label: "יציבות ודאות", sub: "לא אוהב הפתעות בהחזר", icon: "🛡️", color: "#805ad5", bg: "#faf5ff" },
];

const TRACK_META = {
  prime:            { name: "פריים",             desc: "ריבית משתנה צמודה לריבית בנק ישראל",            color: "#3182ce", risk: "בינוני" },
  fixed_cpi:        { name: "קבועה צמודה",       desc: "ריבית קבועה, קרן צמודה למדד",                  color: "#805ad5", risk: "בינוני-נמוך" },
  fixed_unlinked:   { name: "קבועה לא צמודה",   desc: "ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר", color: "#38a169", risk: "נמוך" },
  variable_unlinked:{ name: "משתנה לא צמודה",  desc: "ריבית משתנה כל 5 שנים, ללא הצמדה",             color: "#dd6b20", risk: "בינוני-גבוה" },
  variable_cpi:     { name: "משתנה צמודה",     desc: "ריבית משתנה כל 5 שנים, קרן צמודה למדד",       color: "#e53e3e", risk: "גבוה" },
};

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
  // fallback rate for variable_cpi if missing
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

function fmt(n) {
  if (!n && n !== 0) return "";
  return Math.round(n).toLocaleString("he-IL");
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [propertyValue, setPropertyValue] = useState("2000000");
  const [equity, setEquity] = useState("500000");
  const [apartmentStatus, setApartmentStatus] = useState("first");

  // Step 2
  const [goals, setGoals] = useState(["low_monthly"]);

  // Step 3
  const [income, setIncome] = useState("15000");
  const [borrowers, setBorrowers] = useState("1");
  const [years, setYears] = useState("25");

  // Rates data
  const [ratesInfo, setRatesInfo] = useState(null); // { banks, live, source, date }

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wizard_state");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.propertyValue) setPropertyValue(d.propertyValue);
        if (d.equity) setEquity(d.equity);
        if (d.apartmentStatus) setApartmentStatus(d.apartmentStatus);
        if (d.goals?.length) setGoals(d.goals);
        if (d.income) setIncome(d.income);
        if (d.borrowers) setBorrowers(d.borrowers);
        if (d.years) setYears(d.years);
        if (d.step && d.step < 4) setStep(d.step);
      }
    } catch {}
  }, []);

  // Save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem("wizard_state", JSON.stringify({
        propertyValue, equity, apartmentStatus, goals, income, borrowers, years, step,
      }));
    } catch {}
  }, [propertyValue, equity, apartmentStatus, goals, income, borrowers, years, step]);

  const loanAmount =
    parseFloat(propertyValue) && parseFloat(equity)
      ? Math.max(0, parseFloat(propertyValue) - parseFloat(equity))
      : null;

  const ltv =
    loanAmount && parseFloat(propertyValue)
      ? (loanAmount / parseFloat(propertyValue)) * 100
      : null;

  const maxLtv = APARTMENT_STATUS.find((a) => a.id === apartmentStatus)?.maxLtv;
  const ltvOk = ltv && maxLtv ? ltv <= maxLtv : true;

  const step1Valid = propertyValue && equity && apartmentStatus && ltvOk;
  const step2Valid = goals.length > 0;
  const step3Valid = income && years;

  function toggleGoal(id) {
    setGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function fetchRatesAndProceed() {
    setLoading(true);
    try {
      const loan = loanAmount || 1000000;
      const yrsParam = parseInt(years) || 25;
      const res = await fetch(`/api/rates?loan=${loan}&years=${yrsParam}`);
      const data = await res.json();
      setRatesInfo(data);
    } catch {
      setRatesInfo(null);
    } finally {
      setLoading(false);
      setStep(4);
    }
  }

  // Results
  const loan = loanAmount || 0;
  const yrs = parseInt(years) || 25;
  const totalIncome = parseFloat(income) * parseInt(borrowers || 1);
  const mix = recommendMix(goals);

  // Top 3 banks ranked by score
  const top3 = ratesInfo?.banks
    ? ratesInfo.banks
        .map((bank) => scoreBank(bank, goals, loan, yrs))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
    : [];

  // Best bank mix details
  const bestBank = top3[0]?.bank;
  const mixDetails = mix.map(({ track, pct }) => {
    const rate = bestBank ? (bestBank[track] || 0.06) : 0.06;
    const portion = (loan * pct) / 100;
    const monthly = calcMonthly(portion, rate, yrs);
    return { track, pct, portion, monthly, rate };
  });
  const totalMonthly = mixDetails.reduce((s, d) => s + d.monthly, 0);
  // Estimated monthly add-ons: life insurance + property insurance
  const monthlyInsurance = loan > 0 ? Math.round(loan * 0.00007 + 90) : 0;
  const totalWithExtras = totalMonthly + monthlyInsurance;
  // One-time opening fee estimate
  const openingFee = loan > 0 ? Math.round(Math.min(Math.max(loan * 0.002, 3600), 7500)) : 0;
  const paymentToIncome = totalIncome > 0 ? (totalWithExtras / totalIncome) * 100 : null;
  const affordabilityOk = paymentToIncome ? paymentToIncome <= 40 : true;

  return (
    <div dir="rtl" style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>מחשבון משכנתא חכם</h1>

        {/* Stepper */}
        {!loading && (
          <div style={s.stepper}>
            {[...STEPS].reverse().map((st, i, arr) => (
              <div key={st.id} style={s.stepWrapper}>
                <div style={s.stepItem}>
                  <div
                    style={{
                      ...s.stepCircle,
                      backgroundColor: step === st.id ? "#3182ce" : step > st.id ? "#38a169" : "#e2e8f0",
                      color: step >= st.id ? "#fff" : "#a0aec0",
                    }}
                  >
                    {step > st.id ? "✓" : st.id}
                  </div>
                  <span
                    style={{
                      ...s.stepLabel,
                      color: step === st.id ? "#3182ce" : step > st.id ? "#38a169" : "#a0aec0",
                      fontWeight: step === st.id ? "700" : "400",
                    }}
                  >
                    {st.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ ...s.stepLine, backgroundColor: step > st.id ? "#38a169" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading screen */}
        {loading && (
          <div style={{ ...s.card, textAlign: "center", padding: "60px 24px" }}>
            <div style={s.spinner} />
            <h2 style={{ color: "#2d3748", marginTop: "24px", marginBottom: "10px" }}>מעדכן ריביות בזמן אמת</h2>
            <p style={{ color: "#718096", fontSize: "14px", marginBottom: "6px" }}>
              מחפש נתונים עדכניים מ-8 בנקים...
            </p>
            <p style={{ color: "#a0aec0", fontSize: "13px" }}>
              פועלים · לאומי · מזרחי-טפחות · דיסקונט · יהב · אגוד · אוצר החייל · מרכנתיל
            </p>
          </div>
        )}

        {/* Step 1 */}
        {!loading && step === 1 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>פרטי ההלוואה</h2>
            <p style={s.cardSub}>נחשב את גובה המשכנתא ויחס המימון בשבילך</p>

            <div style={s.fieldGroup}>
              <Field label="שווי הנכס (₪)" placeholder="לדוגמה: 2,000,000" value={propertyValue} onChange={setPropertyValue} />
              <Field label="הון עצמי (₪)" placeholder="לדוגמה: 500,000" value={equity} onChange={setEquity} />
            </div>

            {loanAmount !== null && (
              <div style={s.calcRow}>
                <CalcBox label="גובה המשכנתא" value={`₪${fmt(loanAmount)}`} color="#2b6cb0" />
                <CalcBox
                  label="יחס מימון (LTV)"
                  value={`${ltv.toFixed(1)}%`}
                  color={ltvOk ? "#38a169" : "#e53e3e"}
                  note={maxLtv ? `מקסימום ${maxLtv}% לסטטוס שנבחר` : ""}
                />
              </div>
            )}

            <div style={{ marginTop: "24px" }}>
              <label style={s.label}>סטטוס דירה</label>
              <div style={s.statusGrid}>
                {APARTMENT_STATUS.map((a) => (
                  <button
                    key={a.id}
                    style={{
                      ...s.statusBtn,
                      borderColor: apartmentStatus === a.id ? "#3182ce" : "#e2e8f0",
                      backgroundColor: apartmentStatus === a.id ? "#ebf8ff" : "#fff",
                      color: apartmentStatus === a.id ? "#2b6cb0" : "#4a5568",
                      fontWeight: apartmentStatus === a.id ? "700" : "400",
                    }}
                    onClick={() => setApartmentStatus(a.id)}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {ltv && maxLtv && !ltvOk && (
              <div style={s.errorBox}>
                ⚠️ יחס המימון ({ltv.toFixed(1)}%) חורג מהמקסימום המותר ({maxLtv}%) עבור{" "}
                {APARTMENT_STATUS.find((a) => a.id === apartmentStatus)?.label}. יש להגדיל את ההון העצמי.
              </div>
            )}

            <button
              style={{ ...s.nextBtn, opacity: step1Valid ? 1 : 0.4, cursor: step1Valid ? "pointer" : "not-allowed" }}
              onClick={() => step1Valid && setStep(2)}
            >
              המשך ←
            </button>
          </div>
        )}

        {/* Step 2 – Goals */}
        {!loading && step === 2 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>מה הכי חשוב לך?</h2>
            <p style={s.cardSub}>ה-AI יבנה תמהיל שמתאים בדיוק למה שאתם מחפשים</p>

            <div style={s.goalsGrid}>
              {GOALS.map((g) => {
                const selected = goals.includes(g.id);
                return (
                  <button
                    key={g.id}
                    style={{
                      ...s.goalCard,
                      borderColor: selected ? g.color : "#e2e8f0",
                      backgroundColor: selected ? g.bg : "#fff",
                      boxShadow: selected ? `0 0 0 2px ${g.color}` : "none",
                    }}
                    onClick={() => toggleGoal(g.id)}
                  >
                    <div style={s.goalIcon}>{g.icon}</div>
                    <div style={{ ...s.goalLabel, color: selected ? g.color : "#2d3748" }}>{g.label}</div>
                    <div style={s.goalSub}>{g.sub}</div>
                  </button>
                );
              })}
            </div>

            <div style={s.navRow}>
              <button style={s.backBtn} onClick={() => setStep(1)}>→ חזרה</button>
              <button
                style={{ ...s.nextBtn, opacity: step2Valid ? 1 : 0.4, cursor: step2Valid ? "pointer" : "not-allowed" }}
                onClick={() => step2Valid && setStep(3)}
              >
                המשך ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3 – Income */}
        {!loading && step === 3 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>פרטי הכנסה</h2>
            <p style={s.cardSub}>נוודא שההחזר החודשי מתאים לכושר ההחזר שלך</p>

            <div style={s.fieldGroup}>
              <Field label="הכנסה חודשית נטו (₪)" placeholder="לדוגמה: 15,000" value={income} onChange={setIncome} />
              <div style={s.field}>
                <label style={s.label}>מספר לווים</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "2px" }}>
                  {["1", "2"].map((n) => (
                    <button
                      key={n}
                      style={{
                        ...s.statusBtn,
                        flex: "1",
                        borderColor: borrowers === n ? "#3182ce" : "#e2e8f0",
                        backgroundColor: borrowers === n ? "#ebf8ff" : "#fff",
                        color: borrowers === n ? "#2b6cb0" : "#4a5568",
                        fontWeight: borrowers === n ? "700" : "400",
                      }}
                      onClick={() => setBorrowers(n)}
                    >
                      {n === "1" ? "לווה יחיד" : "שני לווים"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={s.label}>תקופת ההלוואה</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {["15", "20", "25", "30"].map((y) => (
                  <button
                    key={y}
                    style={{
                      ...s.statusBtn,
                      flex: "1",
                      minWidth: "60px",
                      borderColor: years === y ? "#3182ce" : "#e2e8f0",
                      backgroundColor: years === y ? "#ebf8ff" : "#fff",
                      color: years === y ? "#2b6cb0" : "#4a5568",
                      fontWeight: years === y ? "700" : "400",
                      fontSize: "14px",
                    }}
                    onClick={() => setYears(y)}
                  >
                    {y} שנה
                  </button>
                ))}
              </div>
            </div>

            <div style={s.navRow}>
              <button style={s.backBtn} onClick={() => setStep(2)}>→ חזרה</button>
              <button
                style={{ ...s.nextBtn, opacity: step3Valid ? 1 : 0.4, cursor: step3Valid ? "pointer" : "not-allowed" }}
                onClick={() => step3Valid && fetchRatesAndProceed()}
              >
                חשב ←
              </button>
            </div>
          </div>
        )}

        {/* Step 4 – Results */}
        {!loading && step === 4 && (
          <div>
            {/* Live rates badge */}
            {ratesInfo && (
              <div style={ratesInfo.live ? s.liveBadge : s.defaultBadge}>
                {ratesInfo.live ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      <span style={s.liveDot} />
                      <span style={{ fontWeight: "700", fontSize: "13px" }}>ריביות עודכנו בזמן אמת ✓ &nbsp;·&nbsp; {ratesInfo.date}</span>
                    </div>

                    {/* טבלת ריביות לפי בנק */}
                    {ratesInfo.surveyDate && (
                      <div style={{ fontSize: "12px", color: "#718096", marginBottom: "6px" }}>
                        ריביות משכנתא מומלצות לפי מסלול, סכום ותקופה &nbsp;|&nbsp; סקר {ratesInfo.surveyDate}
                      </div>
                    )}
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                    <div style={{ ...s.bankRatesTable, minWidth: "420px" }}>
                      <div style={s.bankRatesHeader}>
                        <span>בנק</span>
                        <span>פריים</span>
                        <span>קבועה צמודה</span>
                        <span>קבועה לא צמודה</span>
                        <span>משתנה צמודה כל 5 שנים</span>
                        <span>משתנה צמודה כל שנה</span>
                        <span>משתנה לא צמודה</span>
                      </div>
                      {ratesInfo.banks.map((bank, i) => (
                        <div key={bank.name} style={{ ...s.bankRatesRow, backgroundColor: i % 2 === 0 ? "#f0fff4" : "#fff" }}>
                          <span style={{ fontWeight: "600", color: "#1a202c" }}>{bank.name.replace("בנק ", "")}</span>
                          <span>{(bank.prime * 100).toFixed(2)}%</span>
                          <span>{(bank.fixed_cpi * 100).toFixed(2)}%</span>
                          <span>{(bank.fixed_unlinked * 100).toFixed(2)}%</span>
                          <span>{((bank.variable_cpi     || 0.028) * 100).toFixed(2)}%</span>
                          <span>{((bank.variable_cpi_1yr || 0.026) * 100).toFixed(2)}%</span>
                          <span>{((bank.variable_unlinked|| 0.048) * 100).toFixed(2)}%</span>
                        </div>
                      ))}
                    </div>
                    </div>
                  </>
                ) : (
                  <>⚠️ ריביות ברירת מחדל (לא עודכנו בזמן אמת){ratesInfo.error ? ` — ${ratesInfo.error}` : ""}</>
                )}
              </div>
            )}

            {/* Top 3 banks */}
            {top3.length > 0 && (
              <div style={s.card}>
                <h2 style={s.cardTitle}>3 הבנקים המובילים עבורך</h2>
                <p style={s.cardSub}>מדורגים לפי ההעדפות שציינת</p>

                {top3.map(({ bank, totalMonthly: m, totalInterest: ti }, idx) => (
                  <div
                    key={bank.name}
                    style={{
                      ...s.bankCard,
                      borderColor: idx === 0 ? "#f6ad55" : "#e2e8f0",
                      backgroundColor: idx === 0 ? "#fffbf0" : "#fff",
                    }}
                  >
                    <div style={s.bankRank}>
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.bankName}>{bank.name}</div>
                      <div style={s.bankRates}>
                        פריים {(bank.prime * 100).toFixed(2)}% &nbsp;|&nbsp;
                        קבועה לא צמודה {(bank.fixed_unlinked * 100).toFixed(2)}% &nbsp;|&nbsp;
                        קבועה צמודה {(bank.fixed_cpi * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={s.bankMonthly}>₪{fmt(m)}<span style={s.bankMonthlyLabel}>/חודש</span></div>
                      <div style={s.bankInterest}>סה"כ ריבית: ₪{fmt(ti)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mix detail for best bank */}
            <div style={{ ...s.card, marginTop: "16px" }}>
              <h2 style={s.cardTitle}>
                התמהיל המומלץ{bestBank ? ` — ${bestBank.name}` : ""}
              </h2>
              <p style={s.cardSub}>פילוח המסלולים בהתאם לעדפות שלך</p>

              <div style={s.summaryBar}>
                <div style={s.summaryBarFill}>
                  {mixDetails.map(({ track, pct }, i) => (
                    <div
                      key={track}
                      style={{
                        flex: pct,
                        backgroundColor: TRACK_META[track].color,
                        height: "100%",
                        borderRadius: i === 0 ? "6px 0 0 6px" : i === mixDetails.length - 1 ? "0 6px 6px 0" : "0",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "20px 0" }}>
                {mixDetails.map(({ track, pct, portion, monthly, rate }) => {
                  const t = TRACK_META[track];
                  return (
                    <div key={track} style={{ ...s.trackCard, borderColor: t.color }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ ...s.trackName, color: t.color }}>
                            {t.name}
                            <span style={{ ...s.riskBadge, backgroundColor: t.color + "22", color: t.color, marginRight: "8px" }}>
                              {(rate * 100).toFixed(2)}%
                            </span>
                          </div>
                          <div style={s.trackDesc}>{t.desc}</div>
                        </div>
                        <div style={{ textAlign: "left" }}>
                          <div style={s.trackPct}>{pct}%</div>
                          <div style={s.trackAmount}>₪{fmt(portion)}</div>
                        </div>
                      </div>
                      <div style={s.trackMonthly}>
                        החזר חודשי: <strong>₪{fmt(monthly)}</strong>
                        <span style={{ ...s.riskBadge, backgroundColor: t.color + "22", color: t.color }}>
                          סיכון {t.risk}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={s.totalBox}>
                <div style={s.totalRow}>
                  <span>החזר משכנתא חודשי</span>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "#2b6cb0" }}>₪{fmt(totalMonthly)}</span>
                </div>
                <div style={{ ...s.totalRow, color: "#718096", fontSize: "13px" }}>
                  <span>ביטוח חיים + מבנה (הערכה)</span>
                  <span>+ ₪{fmt(monthlyInsurance)}</span>
                </div>
                <div style={{ ...s.totalRow, borderTop: "1px solid #e2e8f0", paddingTop: "8px" }}>
                  <span style={{ fontWeight: "700" }}>סה"כ עלות חודשית משוערת</span>
                  <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a202c" }}>₪{fmt(totalWithExtras)}</span>
                </div>
                <div style={{ ...s.totalRow, color: "#718096", fontSize: "13px" }}>
                  <span>עמלת פתיחת תיק (חד-פעמי)</span>
                  <span>~₪{fmt(openingFee)}</span>
                </div>
                {paymentToIncome !== null && (
                  <div style={s.totalRow}>
                    <span>יחס החזר להכנסה</span>
                    <span style={{ fontWeight: "700", color: affordabilityOk ? "#38a169" : "#e53e3e" }}>
                      {paymentToIncome.toFixed(1)}% {affordabilityOk ? "✓ תקין" : "⚠️ גבוה מ-40%"}
                    </span>
                  </div>
                )}
                <div style={s.totalRow}>
                  <span>תקופת הלוואה</span>
                  <span style={{ fontWeight: "600" }}>{years} שנים</span>
                </div>
              </div>

              {!affordabilityOk && (
                <div style={s.errorBox}>
                  ⚠️ ההחזר החודשי גבוה ביחס להכנסה. מומלץ להגדיל הון עצמי, להאריך את התקופה, או לפנות ליועץ משכנתאות.
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button
                style={{ ...s.backBtn, flex: 1, boxSizing: "border-box", cursor: "pointer" }}
                onClick={() => { setStep(1); setRatesInfo(null); try { localStorage.removeItem("wizard_state"); } catch {} }}
              >
                התחל מחדש
              </button>
              <button
                className="no-print"
                style={{ ...s.nextBtn, flex: 1, boxSizing: "border-box", fontSize: "14px" }}
                onClick={() => window.print()}
              >
                📄 שמור כ-PDF
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input
        style={s.input}
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CalcBox({ label, value, color, note }) {
  return (
    <div style={s.calcBox}>
      <div style={s.calcLabel}>{label}</div>
      <div style={{ ...s.calcValue, color }}>{value}</div>
      {note && <div style={s.calcNote}>{note}</div>}
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#edf2f7", fontFamily: "Arial, sans-serif", padding: "32px 16px" },
  container: { maxWidth: "600px", margin: "0 auto" },
  title: { textAlign: "center", fontSize: "26px", color: "#1a202c", marginBottom: "28px" },

  stepper: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "28px" },
  stepWrapper: { display: "flex", alignItems: "center" },
  stepItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  stepCircle: {
    width: "36px", height: "36px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "15px",
  },
  stepLabel: { fontSize: "12px" },
  stepLine: { width: "48px", height: "3px", margin: "0 4px", marginBottom: "20px", borderRadius: "2px" },

  card: { backgroundColor: "#fff", borderRadius: "14px", padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.09)" },
  cardTitle: { fontSize: "20px", color: "#1a202c", marginBottom: "6px" },
  cardSub: { color: "#718096", fontSize: "14px", marginBottom: "24px" },

  fieldGroup: { display: "flex", gap: "16px", flexWrap: "wrap" },
  field: { flex: "1", minWidth: "140px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#4a5568" },
  input: {
    width: "100%", padding: "10px 12px", fontSize: "15px",
    border: "1px solid #cbd5e0", borderRadius: "8px",
    outline: "none", boxSizing: "border-box", textAlign: "right",
  },

  calcRow: { display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" },
  calcBox: { flex: "1", minWidth: "120px", backgroundColor: "#f7fafc", borderRadius: "10px", padding: "12px 16px", textAlign: "center" },
  calcLabel: { fontSize: "12px", color: "#718096", marginBottom: "4px" },
  calcValue: { fontSize: "20px", fontWeight: "700" },
  calcNote: { fontSize: "11px", color: "#a0aec0", marginTop: "4px" },

  statusGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "8px" },
  statusBtn: { padding: "12px", border: "2px solid", borderRadius: "10px", fontSize: "15px", cursor: "pointer", transition: "all 0.15s", background: "none" },

  errorBox: { marginTop: "16px", padding: "12px 16px", backgroundColor: "#fff5f5", border: "1px solid #fc8181", borderRadius: "8px", color: "#c53030", fontSize: "13px" },

  goalsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  goalCard: { padding: "18px 14px", border: "2px solid", borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.15s", background: "none" },
  goalIcon: { fontSize: "28px", marginBottom: "8px" },
  goalLabel: { fontSize: "15px", fontWeight: "600", marginBottom: "4px" },
  goalSub: { fontSize: "12px", color: "#718096" },

  navRow: { display: "flex", justifyContent: "space-between", marginTop: "24px", gap: "12px" },
  nextBtn: {
    flex: "1", padding: "13px", backgroundColor: "#3182ce", color: "#fff",
    fontSize: "16px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer",
  },
  backBtn: {
    flex: "1", padding: "13px", backgroundColor: "#fff", color: "#4a5568",
    fontSize: "15px", fontWeight: "600", border: "2px solid #e2e8f0", borderRadius: "10px", cursor: "pointer",
  },

  // Live badge
  liveBadge: {
    display: "flex", alignItems: "center", gap: "6px",
    backgroundColor: "#f0fff4", border: "1px solid #9ae6b4",
    borderRadius: "10px", padding: "10px 16px",
    fontSize: "13px", color: "#276749", fontWeight: "600",
    marginBottom: "16px",
  },
  defaultBadge: {
    backgroundColor: "#fffff0", border: "1px solid #fbd38d",
    borderRadius: "10px", padding: "10px 16px",
    fontSize: "13px", color: "#744210", fontWeight: "600",
    marginBottom: "16px",
  },
  bankRatesTable: {
    borderTop: "1px solid #9ae6b4",
    paddingTop: "8px",
    fontSize: "11px",
    width: "100%",
  },
  bankRatesHeader: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.7fr 0.9fr 1fr 0.8fr 1fr",
    fontWeight: "700",
    color: "#276749",
    fontSize: "10px",
    padding: "5px 8px",
    backgroundColor: "#c6f6d5",
    borderRadius: "6px 6px 0 0",
    textAlign: "center",
  },
  bankRatesRow: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.7fr 0.9fr 1fr 0.8fr 1fr",
    padding: "5px 8px",
    color: "#2d3748",
    textAlign: "center",
    fontSize: "11px",
  },

  liveDot: {
    display: "inline-block", width: "8px", height: "8px",
    borderRadius: "50%", backgroundColor: "#38a169",
    animation: "pulse 1.5s infinite",
    flexShrink: 0,
  },

  // Bank cards
  bankCard: {
    display: "flex", alignItems: "center", gap: "12px",
    border: "2px solid", borderRadius: "12px", padding: "14px 16px",
    marginBottom: "10px",
  },
  bankRank: { fontSize: "28px", flexShrink: 0 },
  bankName: { fontSize: "16px", fontWeight: "700", color: "#1a202c", marginBottom: "4px" },
  bankRates: { fontSize: "11px", color: "#718096" },
  bankMonthly: { fontSize: "18px", fontWeight: "800", color: "#2b6cb0" },
  bankMonthlyLabel: { fontSize: "12px", fontWeight: "400", color: "#718096" },
  bankInterest: { fontSize: "12px", color: "#718096", marginTop: "2px", textAlign: "left" },

  // Mix
  summaryBar: { height: "16px", borderRadius: "8px", overflow: "hidden", backgroundColor: "#e2e8f0", marginBottom: "4px" },
  summaryBarFill: { display: "flex", height: "100%" },

  trackCard: { border: "2px solid", borderRadius: "12px", padding: "14px 16px" },
  trackName: { fontSize: "16px", fontWeight: "700", marginBottom: "2px" },
  trackDesc: { fontSize: "12px", color: "#718096" },
  trackPct: { fontSize: "22px", fontWeight: "800", color: "#2d3748", textAlign: "left" },
  trackAmount: { fontSize: "13px", color: "#718096", textAlign: "left" },
  trackMonthly: { marginTop: "10px", fontSize: "14px", color: "#4a5568", display: "flex", alignItems: "center", gap: "10px" },
  riskBadge: { fontSize: "11px", padding: "2px 8px", borderRadius: "20px", fontWeight: "600" },

  totalBox: { backgroundColor: "#f7fafc", borderRadius: "12px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "10px" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "15px", color: "#4a5568" },

  spinner: {
    width: "52px", height: "52px", borderRadius: "50%",
    border: "5px solid #e2e8f0", borderTopColor: "#3182ce",
    animation: "spin 0.9s linear infinite",
    margin: "0 auto",
  },
};
