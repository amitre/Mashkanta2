export default function Mockup() {
  const goals = [
    { id: "stability", label: "יציבות ודאות",   sub: "ריבית קבועה — ידוע מה משלמים כל חודש", icon: "🛡️" },
    { id: "balanced",  label: "תמהיל מאוזן",    sub: "שילוב סביר בין ודאות לחיסכון",          icon: "⚖️" },
    { id: "flexible",  label: "גמישות מקסימלית", sub: "צפוי להחזיר מוקדם, מוכן לסיכון ריבית", icon: "🚀" },
  ];

  const tracks = [
    { name: "קבועה לא צמודה", desc: "ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר", pct: 33, rate: "4.80%", amount: "₪495,000", monthly: "₪2,610", risk: "נמוך" },
    { name: "פריים",           desc: "ריבית משתנה צמודה לריבית בנק ישראל",            pct: 34, rate: "4.65%", amount: "₪510,000", monthly: "₪2,640", risk: "בינוני" },
    { name: "משתנה לא צמודה", desc: "ריבית משתנה כל 5 שנים, ללא הצמדה",             pct: 33, rate: "5.10%", amount: "₪495,000", monthly: "₪2,690", risk: "בינוני-גבוה" },
  ];

  const TRACK_COLORS = {
    "קבועה לא צמודה": "#38a169",
    "פריים":           "#3182ce",
    "משתנה לא צמודה": "#dd6b20",
  };

  return (
    <div dir="rtl" style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", fontFamily: "system-ui, -apple-system, sans-serif", padding: "32px 16px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: "700", color: "#1a202c", marginBottom: "8px" }}>
          השוואת עיצוב — לפני ואחרי
        </h1>
        <p style={{ textAlign: "center", color: "#718096", fontSize: "14px", marginBottom: "40px" }}>
          זהו דף זמני לבחינת כיוון עיצובי בלבד
        </p>

        {/* ── SECTION: Goal Cards ── */}
        <div style={sec.header}>שלב 2 — בחירת גישה</div>
        <div style={sec.cols}>

          {/* BEFORE */}
          <div style={sec.col}>
            <div style={sec.tag}>לפני</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {[
                { id: "stability", label: "יציבות ודאות",   sub: "לא אוהב הפתעות בהחזר",              icon: "🛡️", color: "#805ad5", bg: "#faf5ff" },
                { id: "balanced",  label: "תמהיל מאוזן",    sub: "שילוב סביר בין ודאות לחיסכון",       icon: "⚖️", color: "#3182ce", bg: "#ebf8ff" },
                { id: "flexible",  label: "גמישות מקסימלית", sub: "צפוי להחזיר מוקדם",                 icon: "🚀", color: "#38a169", bg: "#f0fff4" },
              ].map((g, i) => (
                <div key={g.id} style={{
                  border: `2px solid ${i === 1 ? g.color : "#e2e8f0"}`,
                  backgroundColor: i === 1 ? g.bg : "#fff",
                  boxShadow: i === 1 ? `0 0 0 2px ${g.color}` : "none",
                  borderRadius: "12px", padding: "16px 12px", textAlign: "center", cursor: "pointer",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{g.icon}</div>
                  <div style={{ fontWeight: "700", fontSize: "13px", color: i === 1 ? g.color : "#2d3748", marginBottom: "4px" }}>{g.label}</div>
                  <div style={{ fontSize: "11px", color: "#718096", lineHeight: "1.4" }}>{g.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER */}
          <div style={sec.col}>
            <div style={{ ...sec.tag, backgroundColor: "#ebf8ff", color: "#2b6cb0" }}>אחרי</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
              {goals.map((g, i) => (
                <div key={g.id} style={{
                  border: `1.5px solid ${i === 1 ? "#2b6cb0" : "#d1d9e0"}`,
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  padding: "16px 12px",
                  textAlign: "center",
                  cursor: "pointer",
                  boxShadow: i === 1 ? "0 2px 8px rgba(43,108,176,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
                  position: "relative",
                }}>
                  {i === 1 && (
                    <div style={{
                      position: "absolute", top: "8px", left: "8px",
                      width: "16px", height: "16px", borderRadius: "50%",
                      backgroundColor: "#2b6cb0", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px", color: "#fff", fontWeight: "700",
                    }}>✓</div>
                  )}
                  <div style={{ fontSize: "26px", marginBottom: "8px" }}>{g.icon}</div>
                  <div style={{
                    fontWeight: "700", fontSize: "13px",
                    color: i === 1 ? "#2b6cb0" : "#2d3748",
                    marginBottom: "4px",
                  }}>{g.label}</div>
                  <div style={{ fontSize: "11px", color: "#8896a5", lineHeight: "1.4" }}>{g.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION: Track Cards ── */}
        <div style={{ ...sec.header, marginTop: "48px" }}>שלב 4 — מסלולי תמהיל</div>
        <div style={sec.cols}>

          {/* BEFORE */}
          <div style={sec.col}>
            <div style={sec.tag}>לפני</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tracks.map((t) => {
                const color = TRACK_COLORS[t.name];
                return (
                  <div key={t.name} style={{ border: `1px solid ${color}33`, borderRadius: "10px", padding: "14px", backgroundColor: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "700", color, fontSize: "14px" }}>
                          {t.name}
                          <span style={{ marginRight: "8px", fontSize: "12px", backgroundColor: color + "22", color, padding: "2px 8px", borderRadius: "20px" }}>
                            {t.rate}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>ריבית משתנה צמודה לריבית בנק ישראל</div>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#2d3748" }}>{t.pct}%</div>
                        <div style={{ fontSize: "11px", color: "#718096" }}>{t.amount}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#4a5568" }}>
                      החזר חודשי: <strong>{t.monthly}</strong>
                      <span style={{ marginRight: "8px", fontSize: "11px", backgroundColor: color + "22", color, padding: "2px 8px", borderRadius: "20px" }}>
                        סיכון {t.risk}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AFTER */}
          <div style={sec.col}>
            <div style={{ ...sec.tag, backgroundColor: "#ebf8ff", color: "#2b6cb0" }}>אחרי</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tracks.map((t) => (
                <div key={t.name} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px", color: "#1a202c" }}>{t.name}</span>
                        <span style={{ fontSize: "12px", color: "#4a5568", backgroundColor: "#edf2f7", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>
                          {t.rate}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096", marginTop: "3px" }}>{t.desc}</div>
                    </div>
                    <div style={{ textAlign: "left", flexShrink: 0, paddingRight: "12px" }}>
                      <div style={{ fontWeight: "800", fontSize: "16px", color: "#2b6cb0" }}>{t.pct}%</div>
                      <div style={{ fontSize: "11px", color: "#a0aec0" }}>{t.amount}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#718096" }}>החזר חודשי: <strong style={{ color: "#1a202c" }}>{t.monthly}</strong></span>
                    <span style={{ fontSize: "11px", color: "#a0aec0" }}>סיכון {t.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION: Summary Box ── */}
        <div style={{ ...sec.header, marginTop: "48px" }}>תיבת סיכום — סה״כ עלות חודשית</div>
        <div style={sec.cols}>

          {/* BEFORE */}
          <div style={sec.col}>
            <div style={sec.tag}>לפני</div>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
              {[
                ["החזר משכנתא חודשי", "₪7,940", "#2b6cb0", "20px"],
                ["ביטוח חיים + מבנה", "+ ₪190", "#718096", "13px"],
              ].map(([label, val, color, size]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f7fafc" }}>
                  <span style={{ fontSize: "14px", color: "#4a5568" }}>{label}</span>
                  <span style={{ fontSize: size, fontWeight: "800", color }}>{val}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0" }}>
                <span style={{ fontWeight: "700", fontSize: "14px" }}>סה"כ עלות חודשית משוערת</span>
                <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a202c" }}>₪8,130</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", color: "#718096", fontSize: "13px" }}>
                <span>יחס החזר להכנסה נטו</span>
                <span style={{ color: "#38a169", fontWeight: "700" }}>32.5% ✓ תקין</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px" }}>
                <span style={{ color: "#718096" }}>תקופת הלוואה</span>
                <span style={{ fontWeight: "600" }}>25 שנים</span>
              </div>
            </div>
          </div>

          {/* AFTER */}
          <div style={sec.col}>
            <div style={{ ...sec.tag, backgroundColor: "#ebf8ff", color: "#2b6cb0" }}>אחרי</div>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "14px", borderBottom: "1px solid #edf2f7" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>סה״כ עלות חודשית משוערת</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a202c", lineHeight: 1 }}>₪8,130</div>
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "#a0aec0", marginBottom: "2px" }}>יחס להכנסה</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#2f855a" }}>32.5% ✓</div>
                </div>
              </div>
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  ["החזר משכנתא", "₪7,940"],
                  ["ביטוח חיים + מבנה", "₪190"],
                  ["תקופת הלוואה", "25 שנים"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#718096" }}>{label}</span>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "#2d3748" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "48px", fontSize: "12px", color: "#a0aec0" }}>
          דף זה זמני — ניתן למחיקה לאחר בחינת הכיוון העיצובי
        </div>
      </div>
    </div>
  );
}

const sec = {
  header: {
    fontSize: "13px", fontWeight: "700", color: "#718096", textTransform: "uppercase",
    letterSpacing: "0.08em", marginBottom: "16px", paddingBottom: "8px",
    borderBottom: "1px solid #e2e8f0",
  },
  cols: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  col:  { display: "flex", flexDirection: "column", gap: "12px" },
  tag:  {
    display: "inline-block", fontSize: "11px", fontWeight: "700",
    backgroundColor: "#f7fafc", color: "#718096", padding: "3px 10px",
    borderRadius: "20px", border: "1px solid #e2e8f0",
  },
};
