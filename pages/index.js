import { useState } from "react";

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

// Mortgage track definitions
const TRACKS = {
  prime: { name: "פריים", desc: "ריבית משתנה צמודה לריבית בנק ישראל", color: "#3182ce", risk: "בינוני" },
  fixed_cpi: { name: "קבועה צמודה", desc: "ריבית קבועה, קרן צמודה למדד", color: "#805ad5", risk: "בינוני-נמוך" },
  fixed_unlinked: { name: "קבועה לא צמודה", desc: "ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר", color: "#38a169", risk: "נמוך" },
  variable_unlinked: { name: "משתנה לא צמודה", desc: "ריבית משתנה כל 5 שנים, ללא הצמדה", color: "#dd6b20", risk: "בינוני-גבוה" },
};

// Recommend a mix based on goals
function recommendMix(goals) {
  const has = (g) => goals.includes(g);
  if (has("stability") && !has("low_total")) {
    return [
      { track: "fixed_unlinked", pct: 50 },
      { track: "fixed_cpi", pct: 33 },
      { track: "prime", pct: 17 },
    ];
  }
  if (has("low_monthly") && !has("stability")) {
    return [
      { track: "prime", pct: 33 },
      { track: "variable_unlinked", pct: 33 },
      { track: "fixed_cpi", pct: 34 },
    ];
  }
  if (has("early_repay")) {
    return [
      { track: "prime", pct: 33 },
      { track: "fixed_unlinked", pct: 34 },
      { track: "fixed_cpi", pct: 33 },
    ];
  }
  if (has("low_total")) {
    return [
      { track: "prime", pct: 33 },
      { track: "fixed_unlinked", pct: 34 },
      { track: "variable_unlinked", pct: 33 },
    ];
  }
  // default balanced
  return [
    { track: "fixed_unlinked", pct: 33 },
    { track: "fixed_cpi", pct: 34 },
    { track: "prime", pct: 33 },
  ];
}

// Simple monthly payment calc (flat rate approximation per track)
const TRACK_RATES = {
  prime: 0.056,
  fixed_cpi: 0.035,
  fixed_unlinked: 0.055,
  variable_unlinked: 0.048,
};

function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n) {
  if (!n && n !== 0) return "";
  return Math.round(n).toLocaleString("he-IL");
}

export default function Home() {
  const [step, setStep] = useState(1);

  // Step 1
  const [propertyValue, setPropertyValue] = useState("");
  const [equity, setEquity] = useState("");
  const [apartmentStatus, setApartmentStatus] = useState("");

  // Step 2
  const [goals, setGoals] = useState([]);

  // Step 3
  const [income, setIncome] = useState("");
  const [borrowers, setBorrowers] = useState("1");
  const [years, setYears] = useState("25");

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

  // Results calculation
  const mix = recommendMix(goals);
  const totalIncome = parseFloat(income) * parseInt(borrowers || 1);
  const yrs = parseInt(years) || 25;
  const loan = loanAmount || 0;

  const mixDetails = mix.map(({ track, pct }) => {
    const portion = (loan * pct) / 100;
    const monthly = calcMonthly(portion, TRACK_RATES[track], yrs);
    return { track, pct, portion, monthly };
  });

  const totalMonthly = mixDetails.reduce((s, d) => s + d.monthly, 0);
  const paymentToIncome = totalIncome > 0 ? (totalMonthly / totalIncome) * 100 : null;
  const affordabilityOk = paymentToIncome ? paymentToIncome <= 40 : true;

  return (
    <div dir="rtl" style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>מחשבון משכנתא חכם</h1>

        {/* Stepper */}
        <div style={s.stepper}>
          {[...STEPS].reverse().map((st, i, arr) => (
            <div key={st.id} style={s.stepWrapper}>
              <div style={s.stepItem}>
                <div
                  style={{
                    ...s.stepCircle,
                    backgroundColor:
                      step === st.id ? "#3182ce" : step > st.id ? "#38a169" : "#e2e8f0",
                    color: step >= st.id ? "#fff" : "#a0aec0",
                  }}
                >
                  {step > st.id ? "✓" : st.id}
                </div>
                <span
                  style={{
                    ...s.stepLabel,
                    color:
                      step === st.id ? "#3182ce" : step > st.id ? "#38a169" : "#a0aec0",
                    fontWeight: step === st.id ? "700" : "400",
                  }}
                >
                  {st.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    ...s.stepLine,
                    backgroundColor: step > st.id ? "#38a169" : "#e2e8f0",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 – Loan details */}
        {step === 1 && (
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
        {step === 2 && (
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
        {step === 3 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>פרטי הכנסה</h2>
            <p style={s.cardSub}>נוודא שההחזר החודשי מתאים לכושר ההחזר שלך</p>

            <div style={s.fieldGroup}>
              <Field
                label="הכנסה חודשית נטו (₪)"
                placeholder="לדוגמה: 15,000"
                value={income}
                onChange={setIncome}
              />
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
                onClick={() => step3Valid && setStep(4)}
              >
                חשב ←
              </button>
            </div>
          </div>
        )}

        {/* Step 4 – Results */}
        {step === 4 && (
          <div style={s.card}>
            <h2 style={s.cardTitle}>התמהיל המומלץ עבורך</h2>
            <p style={s.cardSub}>
              על בסיס העדפותיך, הנה הצעת המסלולים המותאמת לך — לא צריך להבין פיננסים
            </p>

            {/* Summary bar */}
            <div style={s.summaryBar}>
              <div style={s.summaryBarFill}>
                {mixDetails.map(({ track, pct }, i) => (
                  <div
                    key={track}
                    style={{
                      flex: pct,
                      backgroundColor: TRACKS[track].color,
                      height: "100%",
                      borderRadius:
                        i === 0 ? "6px 0 0 6px" : i === mixDetails.length - 1 ? "0 6px 6px 0" : "0",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Track cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "20px 0" }}>
              {mixDetails.map(({ track, pct, portion, monthly }) => {
                const t = TRACKS[track];
                return (
                  <div key={track} style={{ ...s.trackCard, borderColor: t.color }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ ...s.trackName, color: t.color }}>{t.name}</div>
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

            {/* Total */}
            <div style={s.totalBox}>
              <div style={s.totalRow}>
                <span>סה"כ החזר חודשי</span>
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#2b6cb0" }}>
                  ₪{fmt(totalMonthly)}
                </span>
              </div>
              {paymentToIncome !== null && (
                <div style={s.totalRow}>
                  <span>יחס החזר להכנסה</span>
                  <span
                    style={{
                      fontWeight: "700",
                      color: affordabilityOk ? "#38a169" : "#e53e3e",
                    }}
                  >
                    {paymentToIncome.toFixed(1)}%{" "}
                    {affordabilityOk ? "✓ תקין" : "⚠️ גבוה מהמקסימום המומלץ (40%)"}
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

            <button style={{ ...s.backBtn, marginTop: "20px", cursor: "pointer" }} onClick={() => setStep(1)}>
              התחל מחדש
            </button>
          </div>
        )}
      </div>
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
  container: { maxWidth: "580px", margin: "0 auto" },
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
  statusBtn: { padding: "12px", border: "2px solid", borderRadius: "10px", fontSize: "15px", cursor: "pointer", transition: "all 0.15s" },

  errorBox: { marginTop: "16px", padding: "12px 16px", backgroundColor: "#fff5f5", border: "1px solid #fc8181", borderRadius: "8px", color: "#c53030", fontSize: "13px" },

  goalsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  goalCard: { padding: "18px 14px", border: "2px solid", borderRadius: "12px", cursor: "pointer", textAlign: "center", transition: "all 0.15s" },
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

  // Results
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
};
