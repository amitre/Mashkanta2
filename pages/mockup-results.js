const DATA = {
  primeRate: "5.50%", boiRate: "4.00%", updated: "מאי 2025", nextDecision: "23.6.2025",
  banks: [
    { name: "בנק לאומי",        prime: "4.65%", fixedCpi: "3.80%", fixedUnlinked: "4.80%", varCpi: "2.80%", varCpi1: "2.60%", varUnlinked: "4.80%" },
    { name: "בנק הפועלים",      prime: "4.65%", fixedCpi: "3.85%", fixedUnlinked: "4.85%", varCpi: "2.85%", varCpi1: "2.65%", varUnlinked: "4.85%" },
    { name: "בנק מזרחי-טפחות", prime: "4.65%", fixedCpi: "3.90%", fixedUnlinked: "4.90%", varCpi: "2.90%", varCpi1: "2.70%", varUnlinked: "4.90%" },
    { name: "בנק דיסקונט",      prime: "4.65%", fixedCpi: "3.88%", fixedUnlinked: "4.88%", varCpi: "2.88%", varCpi1: "2.68%", varUnlinked: "4.88%" },
    { name: "בנק מרכנתיל",      prime: "4.65%", fixedCpi: "3.92%", fixedUnlinked: "4.92%", varCpi: "2.92%", varCpi1: "2.72%", varUnlinked: "4.92%" },
  ],
  top3: [
    { name: "בנק לאומי",        monthly: "₪7,940", interest: "₪831,000", rates: "פריים 4.65% | קל\"צ 4.80% | ק\"צ 3.80%" },
    { name: "בנק הפועלים",      monthly: "₪7,980", interest: "₪856,000", rates: "פריים 4.65% | קל\"צ 4.85% | ק\"צ 3.85%" },
    { name: "בנק מזרחי-טפחות", monthly: "₪8,050", interest: "₪871,000", rates: "פריים 4.65% | קל\"צ 4.90% | ק\"צ 3.90%" },
  ],
  tracks: [
    { name: "קבועה לא צמודה", desc: "ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר", pct: 33, rate: "4.80%", amount: "₪495,000", monthly: "₪2,610", risk: "נמוך",        color: "#38a169" },
    { name: "פריים",           desc: "ריבית משתנה צמודה לריבית בנק ישראל",            pct: 34, rate: "4.65%", amount: "₪510,000", monthly: "₪2,640", risk: "בינוני",       color: "#3182ce" },
    { name: "משתנה לא צמודה", desc: "ריבית משתנה כל 5 שנים, ללא הצמדה",             pct: 33, rate: "5.10%", amount: "₪495,000", monthly: "₪2,690", risk: "בינוני-גבוה", color: "#dd6b20" },
  ],
  mixPcts: [33, 34, 33],
  mixColors: ["#38a169", "#3182ce", "#dd6b20"],
  totalMonthly: "₪7,940", insurance: "₪195", totalWithExtras: "₪8,135",
  openingFee: "₪300", pti: "32.5%", years: 25, income: "₪25,000",
};

export default function MockupResults() {
  return (
    <div dir="rtl" style={{ minHeight: "100vh", backgroundColor: "#e8edf2", fontFamily: "system-ui,-apple-system,sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>

        <h1 style={{ textAlign: "center", fontSize: "20px", fontWeight: "700", color: "#1a202c", marginBottom: "4px" }}>
          עמוד תוצאות — לפני ואחרי
        </h1>
        <p style={{ textAlign: "center", color: "#718096", fontSize: "13px", marginBottom: "32px" }}>
          אותו מידע בדיוק — רק עיצוב שונה
        </p>

        {/* ══ BEFORE ══ */}
        <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={tag.before}>לפני</div>
          <div style={{ height: "1px", flex: 1, backgroundColor: "#d1d9e0" }} />
        </div>
        <ResultsPage variant="before" />

        <div style={{ height: "40px" }} />

        {/* ══ AFTER ══ */}
        <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={tag.after}>אחרי</div>
          <div style={{ height: "1px", flex: 1, backgroundColor: "#bee3f8" }} />
        </div>
        <ResultsPage variant="after" />

        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "11px", color: "#a0aec0" }}>
          דף זה זמני — ניתן למחיקה לאחר בחינת הכיוון העיצובי
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ variant: v }) {
  const after = v === "after";
  const c = after ? palette.after : palette.before;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* 1. Prime rate banner */}
      <div style={{ backgroundColor: after ? "#fff" : "#f0fff4", border: `1px solid ${after ? "#e2e8f0" : "#9ae6b4"}`, borderRadius: after ? "10px" : "12px", padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: after ? "26px" : "28px", fontWeight: "800", color: after ? "#1a202c" : "#276749" }}>5.50%</span>
          <span style={{ fontSize: "13px", fontWeight: after ? "600" : "700", color: after ? "#4a5568" : "#276749" }}>ריבית פריים</span>
          <span style={{ fontSize: "11px", color: "#718096" }}>ריבית בנק ישראל 4.00% + 1.5%</span>
        </div>
        <div style={{ fontSize: "11px", color: "#a0aec0" }}>עודכן: מאי 2025 | החלטה הבאה: 23.6.2025</div>

        {/* Rates table */}
        <div style={{ marginTop: "10px", overflowX: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr 1fr 1fr", gap: "4px", minWidth: "480px", fontSize: "10px" }}>
            <div style={after ? th.after : th.before}>בנק</div>
            {["פריים","קבועה צמודה","קבועה לא צמודה","משתנה צמודה 5שנ","משתנה צמודה שנה","משתנה לא צמודה"].map(h => (
              <div key={h} style={after ? th.after : th.before}>{h}</div>
            ))}
            {DATA.banks.map((b, i) => (
              [b.name.replace("בנק ",""), b.prime, b.fixedCpi, b.fixedUnlinked, b.varCpi, b.varCpi1, b.varUnlinked].map((cell, j) => (
                <div key={`${i}-${j}`} style={{
                  padding: "4px 6px", fontSize: "10px",
                  backgroundColor: after ? (i%2===0 ? "#f7fafc" : "#fff") : (i%2===0 ? "#f0fff4" : "#fff"),
                  color: j===0 ? (after ? "#1a202c" : "#276749") : "#4a5568",
                  fontWeight: j===0 ? "600" : "400",
                }}>{cell}</div>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top 3 banks */}
      <div style={cardStyle(after)}>
        <div style={c.cardTitle}>3 הבנקים המובילים עבורך</div>
        <div style={c.cardSub}>מדורגים לפי ההעדפות שציינת</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
          {DATA.top3.map(({ name, monthly, interest, rates }, i) => (
            <div key={name} style={{
              border: `${after ? "1.5px" : "2px"} solid ${i===0 ? (after ? "#2b6cb0" : "#f6ad55") : "#e2e8f0"}`,
              borderRadius: after ? "10px" : "12px",
              padding: "12px 14px",
              backgroundColor: i===0 ? (after ? "#fff" : "#fffbf0") : "#fff",
              boxShadow: i===0 ? (after ? "0 2px 8px rgba(43,108,176,0.1)" : "none") : "none",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: i===0 ? (after ? "#2b6cb0" : "#f6ad55") : (after ? "#edf2f7" : "#e2e8f0"),
                color: i===0 ? "#fff" : (after ? "#718096" : "#4a5568"),
                fontWeight: "800", fontSize: "13px",
              }}>{after ? (i+1) : ["🥇","🥈","🥉"][i]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", fontSize: "14px", color: after ? "#1a202c" : (i===0 ? "#92400e" : "#2d3748") }}>{name}</div>
                <div style={{ fontSize: "11px", color: "#718096", marginTop: "2px" }}>{rates}</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: after ? "#1a202c" : "#2b6cb0" }}>{monthly}<span style={{ fontSize: "11px", fontWeight: "400", color: "#a0aec0" }}>/חודש</span></div>
                <div style={{ fontSize: "11px", color: "#a0aec0" }}>סה"כ ריבית: {interest}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mix detail */}
      <div style={cardStyle(after)}>
        <div style={c.cardTitle}>התמהיל המומלץ — בנק לאומי</div>
        <div style={c.cardSub}>פילוח המסלולים בהתאם לעדפות שלך</div>

        {/* Color bar */}
        <div style={{ height: "10px", borderRadius: "6px", overflow: "hidden", display: "flex", marginTop: "14px", marginBottom: "18px" }}>
          {DATA.tracks.map((t, i) => (
            <div key={t.name} style={{ flex: t.pct, backgroundColor: after ? ["#2b6cb0","#4a5568","#718096"][i] : t.color }} />
          ))}
        </div>

        {/* Track cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {DATA.tracks.map((t, i) => (
            <div key={t.name} style={{
              border: `1px solid ${after ? "#e2e8f0" : t.color + "55"}`,
              borderRadius: after ? "10px" : "10px",
              padding: "12px 14px", backgroundColor: "#fff",
              boxShadow: after ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: after ? "#1a202c" : t.color }}>{t.name}</span>
                    <span style={{
                      fontSize: "11px", padding: "1px 7px", borderRadius: after ? "5px" : "20px", fontWeight: "600",
                      backgroundColor: after ? "#edf2f7" : t.color + "22",
                      color: after ? "#4a5568" : t.color,
                    }}>{t.rate}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#718096", marginTop: "2px" }}>{t.desc}</div>
                </div>
                <div style={{ textAlign: "left", paddingRight: "10px", flexShrink: 0 }}>
                  <div style={{ fontWeight: "800", fontSize: "15px", color: after ? "#2b6cb0" : "#2d3748" }}>{t.pct}%</div>
                  <div style={{ fontSize: "11px", color: "#a0aec0" }}>{t.amount}</div>
                </div>
              </div>
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${after ? "#f0f4f8" : "#f7fafc"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#718096" }}>החזר חודשי: <strong style={{ color: after ? "#1a202c" : "#2d3748" }}>{t.monthly}</strong></span>
                <span style={{
                  fontSize: "11px", padding: "1px 7px", borderRadius: after ? "5px" : "20px",
                  backgroundColor: after ? "#edf2f7" : t.color + "22",
                  color: after ? "#718096" : t.color,
                }}>סיכון {t.risk}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sliders */}
        <div style={{
          backgroundColor: after ? "#fff" : "#ebf8ff",
          border: `1px solid ${after ? "#e2e8f0" : "#90cdf4"}`,
          borderRadius: "12px", padding: "14px 16px", marginBottom: "12px",
        }}>
          {[["תקופת הלוואה", "25 שנים"], ["החזר חודשי (משכנתא)", "₪7,940"]].map(([label, val], i) => (
            <div key={label} style={{ marginBottom: i===0 ? "14px" : "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", color: "#4a5568" }}>{label}</span>
                <span style={{ fontWeight: "800", fontSize: "16px", color: after ? "#1a202c" : "#2b6cb0" }}>{val}</span>
              </div>
              <input type="range" defaultValue={i===0?"25":"7940"} min={i===0?"5":"3000"} max={i===0?"30":"10000"} style={{ width: "100%", accentColor: after ? "#2b6cb0" : "#3182ce", display: "block" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#a0aec0", marginTop: "2px" }}>
                {i===0 ? <><span>5 שנים</span><span>30 שנה</span></> : <><span>₪3,500 (30 שנה)</span><span>₪10,000 (מקס׳ לפי 40%)</span></>}
              </div>
            </div>
          ))}
          <div style={{ marginTop: "10px", padding: "8px 10px", backgroundColor: after ? "#fff" : "#fffbeb", border: `1px solid ${after ? "#e8c84a" : "#f6e05e"}`, borderRadius: "8px", fontSize: "11px", color: "#744210" }}>
            ⚠️ <strong>תקרת ההחזר לפי בנק ישראל:</strong> מקסימום ₪10,000 (משכנתא) + ₪195 (ביטוח) = 40% מהכנסה של ₪25,000. הבנק לא יאשר החזר גבוה יותר.
          </div>
        </div>

        {/* Summary */}
        {after ? (
          <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "12px", borderBottom: "1px solid #edf2f7" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>סה״כ עלות חודשית משוערת</div>
                <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a202c", lineHeight: 1 }}>₪8,135</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "10px", color: "#a0aec0", marginBottom: "2px" }}>יחס להכנסה</div>
                <div style={{ fontSize: "14px", fontWeight: "700", color: "#2f855a" }}>32.5% ✓</div>
              </div>
            </div>
            <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
              {[["החזר משכנתא חודשי","₪7,940"],["ביטוח חיים + מבנה","₪195"],["עמלת פתיחת תיק (חד-פעמי)","~₪300"],["יחס להכנסה פנויה","32.5% ✓"],["תקופת הלוואה","25 שנים"]].map(([l,v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "12px", color: "#718096" }}>{l}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: v.includes("✓") ? "#2f855a" : "#2d3748" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f7fafc" }}>
              <span style={{ fontSize: "13px", color: "#4a5568" }}>החזר משכנתא חודשי</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#2b6cb0" }}>₪7,940</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f7fafc" }}>
              <span style={{ fontSize: "13px", color: "#718096" }}>ביטוח חיים + מבנה (הערכה)</span>
              <span style={{ fontSize: "13px", color: "#718096" }}>+ ₪195</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontWeight: "700", fontSize: "13px" }}>סה"כ עלות חודשית משוערת</span>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a202c" }}>₪8,135</span>
            </div>
            {[["עמלת פתיחת תיק (חד-פעמי)","~₪300","#718096"],["יחס החזר להכנסה נטו","32.5% ✓ תקין","#38a169"],["יחס החזר להכנסה פנויה","32.5% ✓ תקין","#38a169"],["תקופת הלוואה","25 שנים","#2d3748"]].map(([l,v,col])=>(
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: "12px" }}>
                <span style={{ color: "#718096" }}>{l}</span>
                <span style={{ fontWeight: "700", color: col }}>{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Buttons */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{
          flex: 1, padding: "12px", borderRadius: after ? "8px" : "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
          border: `1.5px solid ${after ? "#d1d9e0" : "#e2e8f0"}`,
          backgroundColor: "#fff", color: after ? "#374151" : "#4a5568",
        }}>→ התחל מחדש</button>
        <button style={{
          flex: 1, padding: "12px", borderRadius: after ? "8px" : "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer",
          border: "none",
          backgroundColor: after ? "#1e40af" : "#3182ce", color: "#fff",
          boxShadow: after ? "0 1px 4px rgba(30,64,175,0.25)" : "none",
        }}>📄 שמור כ-PDF</button>
      </div>
    </div>
  );
}

function cardStyle(after) {
  return {
    backgroundColor: "#fff",
    border: `1px solid ${after ? "#e2e8f0" : "#e2e8f0"}`,
    borderRadius: after ? "12px" : "16px",
    padding: "16px 18px",
    boxShadow: after ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
  };
}

const palette = {
  before: {
    cardTitle: { fontSize: "17px", fontWeight: "800", color: "#1a202c", marginBottom: "2px" },
    cardSub:   { fontSize: "13px", color: "#718096", marginBottom: "4px" },
  },
  after: {
    cardTitle: { fontSize: "16px", fontWeight: "700", color: "#1a202c", marginBottom: "2px", letterSpacing: "-0.01em" },
    cardSub:   { fontSize: "12px", color: "#a0aec0", marginBottom: "4px" },
  },
};

const th = {
  before: { padding: "4px 6px", backgroundColor: "#f0fff4", fontWeight: "700", fontSize: "10px", color: "#276749" },
  after:  { padding: "4px 6px", backgroundColor: "#f7fafc", fontWeight: "700", fontSize: "10px", color: "#4a5568" },
};

const tag = {
  before: { display: "inline-block", fontSize: "11px", fontWeight: "700", backgroundColor: "#f7fafc", color: "#718096", padding: "3px 12px", borderRadius: "20px", border: "1px solid #e2e8f0" },
  after:  { display: "inline-block", fontSize: "11px", fontWeight: "700", backgroundColor: "#ebf8ff", color: "#2b6cb0",  padding: "3px 12px", borderRadius: "20px", border: "1px solid #bee3f8" },
};
