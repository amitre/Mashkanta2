const DATA = {
  top3: [
    { name: "בנק לאומי",        monthly: "₪7,940", interest: "₪831,000", rates: "פריים 4.65% | קל\"צ 4.80% | ק\"צ 3.80%" },
    { name: "בנק הפועלים",      monthly: "₪7,980", interest: "₪856,000", rates: "פריים 4.65% | קל\"צ 4.85% | ק\"צ 3.85%" },
    { name: "בנק מזרחי-טפחות", monthly: "₪8,050", interest: "₪871,000", rates: "פריים 4.65% | קל\"צ 4.90% | ק\"צ 3.90%" },
  ],
  tracks: [
    { name: "קבועה לא צמודה", desc: "ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר", pct: 33, rate: "4.80%", amount: "₪495,000", monthly: "₪2,610", risk: "נמוך",        riskColor: "#38a169", color: "#38a169" },
    { name: "פריים",           desc: "ריבית משתנה צמודה לריבית בנק ישראל",            pct: 34, rate: "4.65%", amount: "₪510,000", monthly: "₪2,640", risk: "בינוני",       riskColor: "#d97706", color: "#3182ce" },
    { name: "משתנה לא צמודה", desc: "ריבית משתנה כל 5 שנים, ללא הצמדה",             pct: 33, rate: "5.10%", amount: "₪495,000", monthly: "₪2,690", risk: "בינוני-גבוה", riskColor: "#e53e3e", color: "#dd6b20" },
  ],
  banks: [
    { name: "הפועלים",      prime: "4.65%", fixedCpi: "3.85%", fixedUnlinked: "4.85%", varCpi: "2.85%", varCpi1: "2.65%", varUnlinked: "4.85%" },
    { name: "לאומי",        prime: "4.65%", fixedCpi: "3.80%", fixedUnlinked: "4.80%", varCpi: "2.80%", varCpi1: "2.60%", varUnlinked: "4.80%" },
    { name: "הבינלאומי",   prime: "4.65%", fixedCpi: "3.90%", fixedUnlinked: "4.90%", varCpi: "2.90%", varCpi1: "2.70%", varUnlinked: "4.90%" },
    { name: "מזרחי-טפחות", prime: "4.65%", fixedCpi: "3.92%", fixedUnlinked: "4.92%", varCpi: "2.92%", varCpi1: "2.72%", varUnlinked: "4.92%" },
    { name: "דיסקונט",     prime: "4.65%", fixedCpi: "3.88%", fixedUnlinked: "4.88%", varCpi: "2.88%", varCpi1: "2.68%", varUnlinked: "4.88%" },
  ],
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

        <Divider label="לפני" after={false} />
        <ResultsPage variant="before" />

        <div style={{ height: "48px" }} />

        <Divider label="אחרי" after={true} />
        <ResultsPage variant="after" />

        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "11px", color: "#a0aec0" }}>
          דף זה זמני — ניתן למחיקה לאחר בחינת הכיוון העיצובי
        </div>
      </div>
    </div>
  );
}

function ResultsPage({ variant }) {
  const A = variant === "after";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* ── Prime banner + rates table ── */}
      <div style={A ? card.after : card.before}>

        {/* Prime rate row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "26px", fontWeight: "800", color: A ? "#1e40af" : "#276749" }}>5.50%</span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: A ? "#374151" : "#276749" }}>ריבית פריים</span>
          <span style={{ fontSize: "11px", color: "#9ca3af" }}>ריבית בנק ישראל 4.00% + 1.5%</span>
        </div>
        <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "12px" }}>
          עודכן: מאי 2025 &nbsp;|&nbsp; החלטה הבאה: 23.6.2025
        </div>

        {/* Rates table */}
        <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "5px" }}>
          ריביות משכנתא לפי מסלול | סקר מרץ 2026
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px", minWidth: "400px" }}>
            <thead>
              <tr style={{ backgroundColor: A ? "#f3f4f6" : "#f0fff4" }}>
                {["בנק","פריים","קבועה צמודה","קבועה לא צמודה","משתנה צמודה 5שנ","משתנה צמודה שנה","משתנה לא צמודה"].map(h => (
                  <th key={h} style={{ padding: "5px 6px", textAlign: "right", fontWeight: "700", color: A ? "#374151" : "#276749", borderBottom: `1px solid ${A ? "#e5e7eb" : "#9ae6b4"}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA.banks.map((b, i) => (
                <tr key={b.name} style={{ backgroundColor: A ? (i%2===0?"#fafafa":"#fff") : (i%2===0?"#f0fff4":"#fff") }}>
                  {[b.name, b.prime, b.fixedCpi, b.fixedUnlinked, b.varCpi, b.varCpi1, b.varUnlinked].map((v, j) => (
                    <td key={j} style={{ padding: "4px 6px", color: j===0 ? (A?"#111827":"#276749") : "#4b5563", fontWeight: j===0?"600":"400" }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Top 3 banks ── */}
      <div style={A ? card.after : card.before}>
        <div style={A ? ty.title.after : ty.title.before}>3 הבנקים המובילים עבורך</div>
        <div style={ty.sub}>מדורגים לפי ההעדפות שציינת</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
          {DATA.top3.map(({ name, monthly, interest, rates }, i) => (
            <div key={name} style={A ? bankCard.after(i) : bankCard.before(i)}>
              {/* rank */}
              <div style={A ? rankBadge.after(i) : rankBadge.before(i)}>
                {A ? (i+1) : ["🥇","🥈","🥉"][i]}
              </div>
              {/* info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", fontSize: "14px", color: A ? "#111827" : (i===0?"#92400e":"#2d3748") }}>{name}</div>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{rates}</div>
              </div>
              {/* numbers */}
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: "800", fontSize: "15px", color: A ? (i===0?"#1e40af":"#1f2937") : "#2b6cb0" }}>
                  {monthly}<span style={{ fontSize: "11px", fontWeight: "400", color: "#9ca3af" }}>/חודש</span>
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>סה"כ ריבית: {interest}</div>
              </div>
              {/* recommended badge — after only */}
              {A && i===0 && (
                <div style={{ position: "absolute", top: "10px", left: "12px", fontSize: "10px", fontWeight: "700", backgroundColor: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "4px" }}>
                  מומלץ
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Mix detail ── */}
      <div style={A ? card.after : card.before}>
        <div style={A ? ty.title.after : ty.title.before}>התמהיל המומלץ — בנק לאומי</div>
        <div style={ty.sub}>פילוח המסלולים בהתאם לעדפות שלך</div>

        {/* Color bar */}
        <div style={{ height: "8px", borderRadius: "6px", overflow: "hidden", display: "flex", marginTop: "14px", marginBottom: "18px" }}>
          {DATA.tracks.map(t => (
            <div key={t.name} style={{ flex: t.pct, backgroundColor: A ? t.color + "cc" : t.color }} />
          ))}
        </div>

        {/* Track cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {DATA.tracks.map(t => (
            <div key={t.name} style={A ? trackCard.after(t) : trackCard.before(t)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: "700", fontSize: "13px", color: A ? "#111827" : t.color }}>{t.name}</span>
                    <span style={A ? rateBadge.after : rateBadge.before(t)}>{t.rate}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{t.desc}</div>
                </div>
                <div style={{ textAlign: "left", paddingRight: "10px", flexShrink: 0 }}>
                  <div style={{ fontWeight: "800", fontSize: "15px", color: A ? t.color : "#2d3748" }}>{t.pct}%</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{t.amount}</div>
                </div>
              </div>
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  החזר חודשי: <strong style={{ color: "#1f2937" }}>{t.monthly}</strong>
                </span>
                {A ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#6b7280" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: t.riskColor, display: "inline-block" }} />
                    סיכון {t.risk}
                  </span>
                ) : (
                  <span style={{ fontSize: "11px", padding: "1px 8px", borderRadius: "20px", backgroundColor: t.color+"22", color: t.color }}>סיכון {t.risk}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sliders */}
        <div style={A ? slidersBox.after : slidersBox.before}>
          {[["תקופת הלוואה","25 שנים","5","30","5","30 שנה"],["החזר חודשי (משכנתא)","₪7,940","3000","10000","₪3,500 (30 שנה)","₪10,000 (מקס׳)"]].map(([label, val, mn, mx, lbl1, lbl2], si) => (
            <div key={label} style={{ marginBottom: si===0?"14px":"0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
                <span style={{ fontWeight: "800", fontSize: "16px", color: A ? "#1f2937" : "#2b6cb0" }}>{val}</span>
              </div>
              <input type="range" defaultValue={si===0?"25":"7940"} min={mn} max={mx}
                style={{ width: "100%", accentColor: A ? "#2563eb" : "#3182ce", display: "block" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>
                <span>{lbl1}</span><span>{lbl2}</span>
              </div>
            </div>
          ))}
          <div style={{ marginTop: "10px", padding: "8px 10px", backgroundColor: A?"#fffbeb":"#fffbeb", border: `1px solid ${A?"#fcd34d":"#f6e05e"}`, borderRadius: "6px", fontSize: "11px", color: "#92400e" }}>
            ⚠️ <strong>תקרת ההחזר לפי בנק ישראל:</strong> מקסימום ₪10,000 (משכנתא) + ₪195 (ביטוח) — 40% מהכנסה של ₪25,000.
          </div>
        </div>

        {/* Summary totals */}
        <div style={{ marginTop: "12px", backgroundColor: "#fff", border: `1px solid ${A?"#e5e7eb":"#e2e8f0"}`, borderRadius: A?"10px":"12px", padding: "14px 16px", ...(A && { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }) }}>
          {A ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "10px", borderBottom: "1px solid #f3f4f6" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "2px" }}>סה״כ עלות חודשית משוערת</div>
                  <div style={{ fontSize: "26px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>₪8,135</div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "10px", color: "#9ca3af" }}>יחס להכנסה</div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#059669" }}>32.5% ✓</div>
                </div>
              </div>
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {[["החזר משכנתא חודשי","₪7,940",false],["ביטוח חיים + מבנה","₪195",false],["עמלת פתיחת תיק (חד-פעמי)","~₪300",false],["יחס החזר להכנסה פנויה","32.5% ✓",true],["תקופת הלוואה","25 שנים",false]].map(([l,v,green])=>(
                  <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#9ca3af" }}>{l}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: green?"#059669":"#1f2937" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f7fafc" }}>
                <span style={{ fontSize: "13px", color: "#4a5568" }}>החזר משכנתא חודשי</span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#2b6cb0" }}>₪7,940</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f7fafc" }}>
                <span style={{ fontSize: "13px", color: "#718096" }}>ביטוח חיים + מבנה (הערכה)</span>
                <span style={{ fontSize: "13px", color: "#718096" }}>+ ₪195</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 6px", borderBottom: "1px solid #e2e8f0" }}>
                <span style={{ fontWeight: "700", fontSize: "13px" }}>סה"כ עלות חודשית משוערת</span>
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a202c" }}>₪8,135</span>
              </div>
              {[["עמלת פתיחת תיק (חד-פעמי)","~₪300","#718096"],["יחס החזר להכנסה נטו","32.5% ✓ תקין","#38a169"],["יחס החזר להכנסה פנויה","32.5% ✓ תקין","#38a169"],["תקופת הלוואה","25 שנים","#2d3748"]].map(([l,v,col])=>(
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "12px" }}>
                  <span style={{ color: "#718096" }}>{l}</span>
                  <span style={{ fontWeight: "700", color: col }}>{v}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Buttons ── */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ flex: 1, padding: "12px", borderRadius: A?"8px":"10px", fontSize: "14px", fontWeight: "600", cursor: "pointer", border: `1.5px solid ${A?"#d1d5db":"#e2e8f0"}`, backgroundColor: "#fff", color: A?"#374151":"#4a5568" }}>
          → התחל מחדש
        </button>
        <button style={{ flex: 1, padding: "12px", borderRadius: A?"8px":"10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", border: "none", backgroundColor: A?"#1e40af":"#3182ce", color: "#fff" }}>
          📄 שמור כ-PDF
        </button>
      </div>

    </div>
  );
}

/* ── Style helpers ── */

function Divider({ label, after }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
      <div style={after ? tag.after : tag.before}>{label}</div>
      <div style={{ height: "1px", flex: 1, backgroundColor: after ? "#bfdbfe" : "#d1d9e0" }} />
    </div>
  );
}

const card = {
  before: { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "16px 18px" },
  after:  { backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
};

const ty = {
  title: {
    before: { fontSize: "17px", fontWeight: "800", color: "#1a202c", marginBottom: "2px" },
    after:  { fontSize: "16px", fontWeight: "700", color: "#111827", marginBottom: "2px" },
  },
  sub: { fontSize: "12px", color: "#9ca3af" },
};

const bankCard = {
  before: (i) => ({
    position: "relative", display: "flex", alignItems: "center", gap: "10px",
    border: `2px solid ${i===0?"#f6ad55":"#e2e8f0"}`, borderRadius: "12px", padding: "12px 14px",
    backgroundColor: i===0?"#fffbf0":"#fff",
  }),
  after: (i) => ({
    position: "relative", display: "flex", alignItems: "center", gap: "10px",
    border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px 14px", backgroundColor: "#fff",
    borderRight: i===0 ? "3px solid #2563eb" : "1px solid #e5e7eb",
    boxShadow: i===0 ? "0 1px 4px rgba(37,99,235,0.08)" : "none",
  }),
};

const rankBadge = {
  before: (i) => ({
    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: i===0?"#f6ad55":"#e2e8f0", color: i===0?"#fff":"#4a5568",
    fontWeight: "800", fontSize: "13px",
  }),
  after: (i) => ({
    width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    backgroundColor: i===0?"#dbeafe":"#f3f4f6", color: i===0?"#1e40af":"#6b7280",
    fontWeight: "700", fontSize: "12px",
  }),
};

const trackCard = {
  before: (t) => ({
    border: `1px solid ${t.color}55`, borderRadius: "10px", padding: "12px 14px", backgroundColor: "#fff",
  }),
  after: (t) => ({
    borderRadius: "10px", padding: "12px 14px", backgroundColor: "#fff",
    border: "1px solid #e5e7eb",
    borderRight: `3px solid ${t.color}`,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  }),
};

const rateBadge = {
  before: (t) => ({ fontSize: "11px", padding: "1px 7px", borderRadius: "20px", fontWeight: "600", backgroundColor: t.color+"22", color: t.color }),
  after:  { fontSize: "11px", padding: "1px 7px", borderRadius: "5px", fontWeight: "600", backgroundColor: "#f3f4f6", color: "#374151" },
};

const slidersBox = {
  before: { backgroundColor: "#ebf8ff", border: "1px solid #90cdf4", borderRadius: "12px", padding: "14px 16px", marginBottom: "12px" },
  after:  { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 16px", marginBottom: "12px" },
};

const tag = {
  before: { display: "inline-block", fontSize: "11px", fontWeight: "700", backgroundColor: "#f7fafc", color: "#718096", padding: "3px 12px", borderRadius: "20px", border: "1px solid #e2e8f0" },
  after:  { display: "inline-block", fontSize: "11px", fontWeight: "700", backgroundColor: "#dbeafe", color: "#1e40af",  padding: "3px 12px", borderRadius: "20px", border: "1px solid #bfdbfe" },
};
