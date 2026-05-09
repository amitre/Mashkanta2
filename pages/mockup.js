export default function Mockup() {
  const goals = [
    { id: "stability", label: "יציבות ודאות",    sub: "ריבית קבועה — ידוע מה משלמים כל חודש", icon: "🛡️", color: "#805ad5", bg: "#faf5ff" },
    { id: "balanced",  label: "תמהיל מאוזן",     sub: "שילוב סביר בין ודאות לחיסכון",          icon: "⚖️", color: "#3182ce", bg: "#ebf8ff" },
    { id: "flexible",  label: "גמישות מקסימלית", sub: "צפוי להחזיר מוקדם, מוכן לסיכון ריבית", icon: "🚀", color: "#38a169", bg: "#f0fff4" },
  ];

  const tracks = [
    { name: "קבועה לא צמודה", desc: "ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר", pct: 33, rate: "4.80%", amount: "₪495,000", monthly: "₪2,610", risk: "נמוך",        color: "#38a169" },
    { name: "פריים",           desc: "ריבית משתנה צמודה לריבית בנק ישראל",            pct: 34, rate: "4.65%", amount: "₪510,000", monthly: "₪2,640", risk: "בינוני",       color: "#3182ce" },
    { name: "משתנה לא צמודה", desc: "ריבית משתנה כל 5 שנים, ללא הצמדה",             pct: 33, rate: "5.10%", amount: "₪495,000", monthly: "₪2,690", risk: "בינוני-גבוה", color: "#dd6b20" },
  ];

  const banks = [
    { name: "בנק לאומי",       score: 1, monthly: "₪7,820", interest: "₪831,000" },
    { name: "בנק הפועלים",     score: 2, monthly: "₪7,940", interest: "₪856,000" },
    { name: "בנק מזרחי-טפחות", score: 3, monthly: "₪8,010", interest: "₪871,000" },
  ];

  return (
    <div dir="rtl" style={{ minHeight: "100vh", backgroundColor: "#f0f4f8", fontFamily: "system-ui,-apple-system,sans-serif", padding: "32px 16px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        <h1 style={{ textAlign: "center", fontSize: "22px", fontWeight: "700", color: "#1a202c", marginBottom: "4px" }}>
          השוואת עיצוב — לפני ואחרי
        </h1>
        <p style={{ textAlign: "center", color: "#718096", fontSize: "13px", marginBottom: "8px" }}>
          כל השינויים הם עיצובי בלבד — אותו מידע משני הצדדים
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "40px", fontSize: "12px" }}>
          <span style={{ ...t.tagBefore }}>לפני — צבעוני</span>
          <span style={{ ...t.tagAfter  }}>אחרי — מינימליסטי</span>
        </div>

        {/* ══ 1. שלב 1 — פרטי הלוואה ══ */}
        <SectionHeader>שלב 1 — פרטי הלוואה</SectionHeader>
        <div style={sec.cols}>
          <Col label="לפני" after={false}>
            {/* inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="שווי הנכס (₪)" value="2,000,000" />
              <Field label="הון עצמי (₪)"  value="500,000" />
              <div>
                <div style={t.label}>סטטוס הדירה</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {["דירה ראשונה", "דירה שנייה +", "משקיע"].map((s, i) => (
                    <div key={s} style={{
                      flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: "10px", fontSize: "13px", fontWeight: i === 0 ? "700" : "400", cursor: "pointer",
                      border: `2px solid ${i === 0 ? "#3182ce" : "#e2e8f0"}`,
                      backgroundColor: i === 0 ? "#ebf8ff" : "#fff",
                      color: i === 0 ? "#2b6cb0" : "#4a5568",
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#276749" }}>
                ✓ סכום ההלוואה: <strong>₪1,500,000</strong> &nbsp;|&nbsp; LTV: <strong>75%</strong> — תקין
              </div>
            </div>
          </Col>
          <Col label="אחרי" after={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <FieldAfter label="שווי הנכס (₪)" value="2,000,000" />
              <FieldAfter label="הון עצמי (₪)"  value="500,000" />
              <div>
                <div style={t.labelAfter}>סטטוס הדירה</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {["דירה ראשונה", "דירה שנייה +", "משקיע"].map((s, i) => (
                    <div key={s} style={{
                      flex: 1, textAlign: "center", padding: "10px 6px", borderRadius: "8px", fontSize: "13px", fontWeight: i === 0 ? "700" : "400", cursor: "pointer",
                      border: `1.5px solid ${i === 0 ? "#2b6cb0" : "#d1d9e0"}`,
                      backgroundColor: "#fff",
                      color: i === 0 ? "#2b6cb0" : "#4a5568",
                      boxShadow: i === 0 ? "0 1px 4px rgba(43,108,176,0.1)" : "none",
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div style={{ backgroundColor: "#fff", border: "1px solid #c6f6d5", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#276749" }}>
                ✓ סכום ההלוואה: <strong>₪1,500,000</strong> &nbsp;|&nbsp; LTV: <strong>75%</strong> — תקין
              </div>
            </div>
          </Col>
        </div>

        {/* ══ 2. שלב 2 — בחירת גישה ══ */}
        <SectionHeader>שלב 2 — בחירת גישה</SectionHeader>
        <div style={sec.cols}>
          <Col label="לפני" after={false}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {goals.map((g, i) => (
                <div key={g.id} style={{
                  border: `2px solid ${i === 1 ? g.color : "#e2e8f0"}`,
                  backgroundColor: i === 1 ? g.bg : "#fff",
                  boxShadow: i === 1 ? `0 0 0 2px ${g.color}` : "none",
                  borderRadius: "12px", padding: "14px 10px", textAlign: "center",
                }}>
                  <div style={{ fontSize: "26px", marginBottom: "6px" }}>{g.icon}</div>
                  <div style={{ fontWeight: "700", fontSize: "12px", color: i === 1 ? g.color : "#2d3748", marginBottom: "3px" }}>{g.label}</div>
                  <div style={{ fontSize: "10px", color: "#718096", lineHeight: 1.4 }}>{g.sub}</div>
                </div>
              ))}
            </div>
          </Col>
          <Col label="אחרי" after={true}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {goals.map((g, i) => (
                <div key={g.id} style={{
                  border: `1.5px solid ${i === 1 ? "#2b6cb0" : "#d1d9e0"}`,
                  backgroundColor: "#fff",
                  borderRadius: "10px", padding: "14px 10px", textAlign: "center",
                  boxShadow: i === 1 ? "0 2px 8px rgba(43,108,176,0.12)" : "0 1px 2px rgba(0,0,0,0.04)",
                  position: "relative",
                }}>
                  {i === 1 && <div style={t.checkmark}>✓</div>}
                  <div style={{ fontSize: "24px", marginBottom: "6px" }}>{g.icon}</div>
                  <div style={{ fontWeight: "700", fontSize: "12px", color: i === 1 ? "#2b6cb0" : "#2d3748", marginBottom: "3px" }}>{g.label}</div>
                  <div style={{ fontSize: "10px", color: "#8896a5", lineHeight: 1.4 }}>{g.sub}</div>
                </div>
              ))}
            </div>
          </Col>
        </div>

        {/* ══ 3. שלב 3 — הכנסה ותשלום ══ */}
        <SectionHeader>שלב 3 — הכנסה ותשלום חודשי מועדף</SectionHeader>
        <div style={sec.cols}>
          <Col label="לפני" after={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Field label="הכנסה חודשית נטו (₪)" value="15,000" />
              <div>
                <div style={t.label}>מספר לווים</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {["לווה יחיד", "שני לווים"].map((s, i) => (
                    <div key={s} style={{
                      flex: 1, textAlign: "center", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: i === 0 ? "700" : "400",
                      border: `2px solid ${i === 0 ? "#3182ce" : "#e2e8f0"}`,
                      backgroundColor: i === 0 ? "#ebf8ff" : "#fff",
                      color: i === 0 ? "#2b6cb0" : "#4a5568",
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={t.label}>החזר חודשי מועדף (₪)</span>
                  <span style={{ fontWeight: "800", fontSize: "18px", color: "#2b6cb0" }}>₪5,500</span>
                </div>
                <input type="range" min="3500" max="6000" defaultValue="5500" style={{ width: "100%", accentColor: "#3182ce" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#a0aec0", marginTop: "3px" }}>
                  <span>₪3,500 (30 שנה)</span><span>₪6,000 (מקס׳)</span>
                </div>
                <div style={{ marginTop: "10px", padding: "10px 12px", backgroundColor: "#fffbeb", border: "1px solid #f6e05e", borderRadius: "8px", fontSize: "12px", color: "#744210" }}>
                  ⚠️ <strong>תקרת ההחזר: ₪6,000</strong> — 40% מהכנסה של ₪15,000 לפי הנחיות בנק ישראל
                </div>
              </div>
            </div>
          </Col>
          <Col label="אחרי" after={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <FieldAfter label="הכנסה חודשית נטו (₪)" value="15,000" />
              <div>
                <div style={t.labelAfter}>מספר לווים</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {["לווה יחיד", "שני לווים"].map((s, i) => (
                    <div key={s} style={{
                      flex: 1, textAlign: "center", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: i === 0 ? "700" : "400",
                      border: `1.5px solid ${i === 0 ? "#2b6cb0" : "#d1d9e0"}`,
                      backgroundColor: "#fff",
                      color: i === 0 ? "#2b6cb0" : "#4a5568",
                      boxShadow: i === 0 ? "0 1px 4px rgba(43,108,176,0.1)" : "none",
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={t.labelAfter}>החזר חודשי מועדף (₪)</span>
                  <span style={{ fontWeight: "800", fontSize: "18px", color: "#1a202c" }}>₪5,500</span>
                </div>
                <input type="range" min="3500" max="6000" defaultValue="5500" style={{ width: "100%", accentColor: "#2b6cb0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#a0aec0", marginTop: "3px" }}>
                  <span>₪3,500 (30 שנה)</span><span>₪6,000 (מקס׳)</span>
                </div>
                <div style={{ marginTop: "10px", padding: "10px 12px", backgroundColor: "#fff", border: "1px solid #e8c84a", borderRadius: "8px", fontSize: "12px", color: "#744210" }}>
                  ⚠️ <strong>תקרת ההחזר: ₪6,000</strong> — 40% מהכנסה של ₪15,000 לפי הנחיות בנק ישראל
                </div>
              </div>
            </div>
          </Col>
        </div>

        {/* ══ 4. שלב 4 — דירוג בנקים ══ */}
        <SectionHeader>שלב 4 — דירוג בנקים</SectionHeader>
        <div style={sec.cols}>
          <Col label="לפני" after={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {banks.map((b, i) => (
                <div key={b.name} style={{
                  border: i === 0 ? "2px solid #3182ce" : "1px solid #e2e8f0",
                  borderRadius: "12px", padding: "14px",
                  backgroundColor: i === 0 ? "#ebf8ff" : "#fff",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: i === 0 ? "#3182ce" : "#e2e8f0", color: i === 0 ? "#fff" : "#718096", fontWeight: "800", fontSize: "13px",
                      }}>{b.score}</div>
                      <span style={{ fontWeight: "700", fontSize: "15px", color: i === 0 ? "#2b6cb0" : "#2d3748" }}>{b.name}</span>
                    </div>
                    {i === 0 && <span style={{ backgroundColor: "#3182ce", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px" }}>מומלץ</span>}
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "13px", color: "#4a5568" }}>
                    <span>החזר: <strong>{b.monthly}</strong></span>
                    <span>סה"כ ריבית: <strong>{b.interest}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col label="אחרי" after={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {banks.map((b, i) => (
                <div key={b.name} style={{
                  border: `1.5px solid ${i === 0 ? "#2b6cb0" : "#e2e8f0"}`,
                  borderRadius: "10px", padding: "14px", backgroundColor: "#fff",
                  boxShadow: i === 0 ? "0 2px 8px rgba(43,108,176,0.1)" : "0 1px 2px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "26px", height: "26px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        backgroundColor: i === 0 ? "#2b6cb0" : "#edf2f7", color: i === 0 ? "#fff" : "#718096", fontWeight: "700", fontSize: "12px",
                      }}>{b.score}</div>
                      <span style={{ fontWeight: "700", fontSize: "14px", color: "#1a202c" }}>{b.name}</span>
                    </div>
                    {i === 0 && <span style={{ backgroundColor: "#edf2f7", color: "#2b6cb0", fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "6px" }}>מומלץ</span>}
                  </div>
                  <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "13px", color: "#4a5568" }}>
                    <span>החזר: <strong style={{ color: "#1a202c" }}>{b.monthly}</strong></span>
                    <span>סה"כ ריבית: <strong style={{ color: "#1a202c" }}>{b.interest}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </div>

        {/* ══ 5. שלב 4 — מסלולי תמהיל ══ */}
        <SectionHeader>שלב 4 — מסלולי תמהיל</SectionHeader>
        <div style={sec.cols}>
          <Col label="לפני" after={false}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tracks.map((t2) => (
                <div key={t2.name} style={{ border: `1px solid ${t2.color}33`, borderRadius: "10px", padding: "14px", backgroundColor: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: t2.color, fontSize: "14px" }}>
                        {t2.name}
                        <span style={{ marginRight: "8px", fontSize: "12px", backgroundColor: t2.color + "22", color: t2.color, padding: "2px 8px", borderRadius: "20px" }}>{t2.rate}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>{t2.desc}</div>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "#2d3748" }}>{t2.pct}%</div>
                      <div style={{ fontSize: "11px", color: "#718096" }}>{t2.amount}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "13px", color: "#4a5568" }}>
                    החזר חודשי: <strong>{t2.monthly}</strong>
                    <span style={{ marginRight: "8px", fontSize: "11px", backgroundColor: t2.color + "22", color: t2.color, padding: "2px 8px", borderRadius: "20px" }}>סיכון {t2.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          <Col label="אחרי" after={true}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tracks.map((t2) => (
                <div key={t2.name} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "700", fontSize: "14px", color: "#1a202c" }}>{t2.name}</span>
                        <span style={{ fontSize: "12px", color: "#4a5568", backgroundColor: "#edf2f7", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>{t2.rate}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#718096", marginTop: "3px" }}>{t2.desc}</div>
                    </div>
                    <div style={{ textAlign: "left", flexShrink: 0, paddingRight: "12px" }}>
                      <div style={{ fontWeight: "800", fontSize: "16px", color: "#2b6cb0" }}>{t2.pct}%</div>
                      <div style={{ fontSize: "11px", color: "#a0aec0" }}>{t2.amount}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #f0f4f8", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#718096" }}>החזר חודשי: <strong style={{ color: "#1a202c" }}>{t2.monthly}</strong></span>
                    <span style={{ fontSize: "11px", color: "#a0aec0" }}>סיכון {t2.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </div>

        {/* ══ 6. שלב 4 — סליידרים וסיכום ══ */}
        <SectionHeader>שלב 4 — סליידרים וסיכום</SectionHeader>
        <div style={sec.cols}>
          <Col label="לפני" after={false}>
            <div style={{ backgroundColor: "#ebf8ff", border: "1px solid #90cdf4", borderRadius: "12px", padding: "16px 20px", marginBottom: "10px" }}>
              <SliderRow label="תקופת הלוואה" value="25 שנים" color="#2b6cb0" />
              <div style={{ marginBottom: "6px" }}><input type="range" min="5" max="30" defaultValue="25" style={{ width: "100%", accentColor: "#3182ce" }} /></div>
              <SliderRow label="החזר חודשי (משכנתא)" value="₪7,940" color="#2b6cb0" />
              <div><input type="range" min="3000" max="12000" defaultValue="7940" style={{ width: "100%", accentColor: "#3182ce" }} /></div>
            </div>
            <SummaryBefore />
          </Col>
          <Col label="אחרי" after={true}>
            <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", marginBottom: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <SliderRow label="תקופת הלוואה" value="25 שנים" color="#1a202c" />
              <div style={{ marginBottom: "6px" }}><input type="range" min="5" max="30" defaultValue="25" style={{ width: "100%", accentColor: "#2b6cb0" }} /></div>
              <SliderRow label="החזר חודשי (משכנתא)" value="₪7,940" color="#1a202c" />
              <div><input type="range" min="3000" max="12000" defaultValue="7940" style={{ width: "100%", accentColor: "#2b6cb0" }} /></div>
            </div>
            <SummaryAfter />
          </Col>
        </div>

        <div style={{ textAlign: "center", marginTop: "48px", fontSize: "12px", color: "#a0aec0" }}>
          דף זה זמני — ניתן למחיקה לאחר בחינת הכיוון העיצובי
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ── */

function SectionHeader({ children }) {
  return (
    <div style={{
      fontSize: "13px", fontWeight: "700", color: "#718096", textTransform: "uppercase",
      letterSpacing: "0.08em", marginBottom: "14px", marginTop: "48px", paddingBottom: "8px",
      borderBottom: "1px solid #e2e8f0",
    }}>{children}</div>
  );
}

function Col({ label, after, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={after ? t.tagAfter : t.tagBefore}>{label}</div>
      {children}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={t.label}>{label}</div>
      <div style={{ marginTop: "4px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", backgroundColor: "#fff", color: "#2d3748" }}>{value}</div>
    </div>
  );
}

function FieldAfter({ label, value }) {
  return (
    <div>
      <div style={t.labelAfter}>{label}</div>
      <div style={{ marginTop: "4px", border: "1px solid #d1d9e0", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", backgroundColor: "#fff", color: "#1a202c", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>{value}</div>
    </div>
  );
}

function SliderRow({ label, value, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
      <span style={{ fontSize: "13px", color: "#4a5568" }}>{label}</span>
      <span style={{ fontWeight: "800", fontSize: "16px", color }}>{value}</span>
    </div>
  );
}

function SummaryBefore() {
  const rows = [
    ["החזר משכנתא חודשי", "₪7,940", "#2b6cb0", "18px"],
    ["ביטוח חיים + מבנה", "+ ₪190", "#718096", "13px"],
  ];
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
      {rows.map(([l, v, c, s]) => (
        <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f7fafc" }}>
          <span style={{ fontSize: "13px", color: "#4a5568" }}>{l}</span>
          <span style={{ fontSize: s, fontWeight: "800", color: c }}>{v}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px" }}>
        <span style={{ fontWeight: "700", fontSize: "13px" }}>סה"כ עלות חודשית משוערת</span>
        <span style={{ fontSize: "22px", fontWeight: "800", color: "#1a202c" }}>₪8,130</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#718096" }}>
        <span>יחס החזר להכנסה נטו</span>
        <span style={{ color: "#38a169", fontWeight: "700" }}>32.5% ✓ תקין</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#718096", marginTop: "4px" }}>
        <span>תקופת הלוואה</span>
        <span style={{ fontWeight: "600", color: "#2d3748" }}>25 שנים</span>
      </div>
    </div>
  );
}

function SummaryAfter() {
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: "12px", borderBottom: "1px solid #edf2f7" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>סה״כ עלות חודשית משוערת</div>
          <div style={{ fontSize: "26px", fontWeight: "800", color: "#1a202c", lineHeight: 1 }}>₪8,130</div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "10px", color: "#a0aec0", marginBottom: "2px" }}>יחס להכנסה</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#2f855a" }}>32.5% ✓</div>
        </div>
      </div>
      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "7px" }}>
        {[["החזר משכנתא", "₪7,940"], ["ביטוח חיים + מבנה", "₪190"], ["תקופת הלוואה", "25 שנים"]].map(([l, v]) => (
          <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "#718096" }}>{l}</span>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#2d3748" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Shared token styles ── */
const t = {
  label:      { fontSize: "13px", fontWeight: "600", color: "#4a5568" },
  labelAfter: { fontSize: "13px", fontWeight: "600", color: "#374151" },
  tagBefore: { display: "inline-block", fontSize: "11px", fontWeight: "700", backgroundColor: "#f7fafc", color: "#718096", padding: "3px 10px", borderRadius: "20px", border: "1px solid #e2e8f0" },
  tagAfter:  { display: "inline-block", fontSize: "11px", fontWeight: "700", backgroundColor: "#ebf8ff", color: "#2b6cb0",  padding: "3px 10px", borderRadius: "20px", border: "1px solid #bee3f8" },
  checkmark: { position: "absolute", top: "7px", left: "7px", width: "15px", height: "15px", borderRadius: "50%", backgroundColor: "#2b6cb0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#fff", fontWeight: "700" },
};

const sec = {
  cols: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
};
