import { useRouter } from "next/router";

const TEAL = "#0d9488";
const TEAL_DARK = "#0f766e";

export default function SampleReport() {
  const router = useRouter();

  return (
    <div dir="rtl" style={s.page}>
      {/* Toolbar — hidden on print */}
      <div style={s.toolbar} className="no-print">
        <button style={s.backBtn} onClick={() => router.push("/")}>→ חזרה לדף הבית</button>
      </div>

      <div style={s.container}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerTop}>
            <div>
              <div style={s.reportTitle}>דוח משכנתא אישי</div>
              <div style={s.reportSub}>הוכן עבור: ישראל ישראלי &nbsp;|&nbsp; תאריך: 27.03.2026</div>
            </div>
            <div style={s.logo}>🏦 משכנתא חכמה</div>
          </div>
          <div style={s.sampleWatermark}>לדוגמא בלבד</div>
        </div>

        {/* Summary */}
        <div style={s.section}>
          <div style={s.sectionTitle}>סיכום הנכס וההלוואה</div>
          <div style={s.summaryGrid}>
            <SummaryBox label="שווי הנכס" value="₪2,000,000" />
            <SummaryBox label="הון עצמי" value="₪500,000" color={TEAL} />
            <SummaryBox label="סכום המשכנתא" value="₪1,500,000" color="#2b6cb0" />
            <SummaryBox label="יחס מימון (LTV)" value="75%" />
            <SummaryBox label="תקופה" value="25 שנה" />
            <SummaryBox label="סטטוס דירה" value="דירה ראשונה" />
          </div>
        </div>

        {/* Recommended Mix */}
        <div style={s.section}>
          <div style={s.sectionTitle}>התמהיל המומלץ</div>
          <div style={s.mixBar}>
            <div style={{ ...s.mixSegment, flex: 33, backgroundColor: "#3182ce" }} />
            <div style={{ ...s.mixSegment, flex: 34, backgroundColor: "#38a169" }} />
            <div style={{ ...s.mixSegment, flex: 33, backgroundColor: "#805ad5" }} />
          </div>
          <div style={s.mixLegend}>
            <MixLegendItem color="#3182ce" label="פריים" pct="33%" />
            <MixLegendItem color="#38a169" label="קבועה לא צמודה" pct="34%" />
            <MixLegendItem color="#805ad5" label="קבועה צמודה" pct="33%" />
          </div>

          <div style={s.trackList}>
            <TrackRow
              color="#3182ce" name="פריים (33%)"
              amount="₪495,000" rate="5.60%" monthly="₪3,024"
              desc="ריבית משתנה צמודה לריבית בנק ישראל" risk="בינוני"
            />
            <TrackRow
              color="#38a169" name="קבועה לא צמודה (34%)"
              amount="₪510,000" rate="5.50%" monthly="₪3,133"
              desc="ריבית קבועה, ללא הצמדה — הוודאות הגבוהה ביותר" risk="נמוך"
            />
            <TrackRow
              color="#805ad5" name="קבועה צמודה (33%)"
              amount="₪495,000" rate="3.50%" monthly="₪2,477"
              desc="ריבית קבועה, קרן צמודה למדד" risk="בינוני-נמוך"
            />
          </div>
        </div>

        {/* Totals */}
        <div style={s.section}>
          <div style={s.sectionTitle}>סיכום עלויות חודשיות</div>
          <div style={s.totalsBox}>
            <TotalRow label="החזר משכנתא חודשי" value="₪8,634" bold />
            <TotalRow label="ביטוח חיים + מבנה (הערכה)" value="+ ₪195" small />
            <div style={s.divider} />
            <TotalRow label="סה״כ עלות חודשית משוערת" value="₪8,829" big />
            <TotalRow label="עמלת פתיחת תיק (חד-פעמי)" value="~₪3,600" small />
            <TotalRow label="יחס החזר להכנסה (הכנסה: ₪25,000)" value="35.3% ✓ תקין" color="#38a169" />
            <TotalRow label="סה״כ ריבית לאורך חיי ההלוואה" value="₪1,089,400" />
          </div>
        </div>

        {/* Bank Comparison */}
        <div style={s.section}>
          <div style={s.sectionTitle}>השוואת בנקים מובילים</div>
          <div style={{ overflowX: "auto" }}>
            <table style={s.table}>
              <thead>
                <tr style={s.tableHead}>
                  <th style={s.th}>דירוג</th>
                  <th style={s.th}>בנק</th>
                  <th style={s.th}>פריים</th>
                  <th style={s.th}>קבועה לא צמודה</th>
                  <th style={s.th}>קבועה צמודה</th>
                  <th style={s.th}>החזר חודשי</th>
                  <th style={s.th}>סה״כ ריבית</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: "🥇", name: "בנק מזרחי-טפחות", prime: "5.40%", fixed_u: "5.80%", fixed_c: "3.40%", monthly: "₪8,598", total: "₪1,079,400" },
                  { rank: "🥈", name: "בנק הפועלים",      prime: "5.60%", fixed_u: "5.50%", fixed_c: "3.50%", monthly: "₪8,634", total: "₪1,089,400" },
                  { rank: "🥉", name: "בנק לאומי",         prime: "5.50%", fixed_u: "5.30%", fixed_c: "3.70%", monthly: "₪8,651", total: "₪1,093,100" },
                ].map((b, i) => (
                  <tr key={b.name} style={{ backgroundColor: i === 0 ? "#fffbf0" : i % 2 === 0 ? "#f7fafc" : "#fff" }}>
                    <td style={{ ...s.td, fontSize: "20px" }}>{b.rank}</td>
                    <td style={{ ...s.td, fontWeight: "700" }}>{b.name}</td>
                    <td style={s.td}>{b.prime}</td>
                    <td style={s.td}>{b.fixed_u}</td>
                    <td style={s.td}>{b.fixed_c}</td>
                    <td style={{ ...s.td, fontWeight: "700", color: "#2b6cb0" }}>{b.monthly}</td>
                    <td style={{ ...s.td, color: "#718096" }}>{b.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div style={s.section}>
          <div style={s.sectionTitle}>המלצות אישיות</div>
          <div style={s.recList}>
            {[
              "בנק מזרחי-טפחות מציע את התנאים הטובים ביותר עבור הפרופיל שלך — מומלץ לפתוח שם משא ומתן.",
              "התמהיל המומלץ מאזן בין יציבות לגמישות — 34% בריבית קבועה לא צמודה מגן מפני עליות ריבית.",
              "יחס ההחזר להכנסה עומד על 35.3% — תקין ומתחת לסף ה-40% הנהוג בבנקים.",
              "מומלץ לבדוק אפשרות לפירעון מוקדם חלקי אחרי 5 שנים אם תגדל ההכנסה.",
            ].map((rec, i) => (
              <div key={i} style={s.recItem}>
                <span style={s.recIcon}>💡</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <div style={s.footerName}>אוריה שמוקלר — יועצת משכנתאות מוסמכת</div>
          <div style={s.footerNote}>
            דוח זה הינו לדוגמא בלבד. הנתונים המוצגים הם אינדיקטיביים ואינם מהווים ייעוץ פיננסי מחייב.
            לדוח מלא ומדויק עבורך, מלא את השאלון באתר.
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
        @media (max-width: 600px) {
          table { font-size: 11px; }
        }
      `}</style>
    </div>
  );
}

function SummaryBox({ label, value, color = "#1a202c" }) {
  return (
    <div style={s.summaryBox}>
      <div style={s.summaryLabel}>{label}</div>
      <div style={{ ...s.summaryValue, color }}>{value}</div>
    </div>
  );
}

function MixLegendItem({ color, label, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
      <div style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: color, flexShrink: 0 }} />
      <span style={{ fontWeight: "600" }}>{label}</span>
      <span style={{ color: "#718096" }}>{pct}</span>
    </div>
  );
}

function TrackRow({ color, name, amount, rate, monthly, desc, risk }) {
  return (
    <div style={{ ...s.trackRow, borderColor: color }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontWeight: "700", color, fontSize: "15px" }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#718096", marginTop: "2px" }}>{desc}</div>
        </div>
        <div style={{ textAlign: "left", flexShrink: 0 }}>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#2b6cb0" }}>{monthly}<span style={{ fontSize: "12px", color: "#718096" }}>/חודש</span></div>
          <div style={{ fontSize: "12px", color: "#718096" }}>ריבית: {rate} &nbsp;|&nbsp; קרן: {amount}</div>
        </div>
      </div>
      <div style={{ marginTop: "8px", fontSize: "12px", color: "#718096" }}>
        רמת סיכון:&nbsp;
        <span style={{ backgroundColor: color + "22", color, padding: "2px 8px", borderRadius: "20px", fontWeight: "600" }}>{risk}</span>
      </div>
    </div>
  );
}

function TotalRow({ label, value, bold, big, small, color = "#4a5568" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
      <span style={{ fontSize: small ? "13px" : "15px", color: small ? "#718096" : "#4a5568" }}>{label}</span>
      <span style={{
        fontSize: big ? "22px" : small ? "13px" : "15px",
        fontWeight: big || bold ? "800" : "600",
        color: big ? "#1a202c" : color,
      }}>{value}</span>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", backgroundColor: "#edf2f7", fontFamily: "Arial, sans-serif", padding: "0 0 40px" },
  toolbar: {
    backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0",
    padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
    position: "sticky", top: 0, zIndex: 10,
  },
  backBtn: {
    background: "none", border: "1px solid #e2e8f0", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontSize: "14px", color: "#4a5568",
  },
  sampleBadge: {
    backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "20px",
    padding: "4px 14px", fontSize: "13px", fontWeight: "600",
  },
  printBtn: {
    backgroundColor: TEAL, color: "#fff", border: "none", borderRadius: "8px",
    padding: "8px 18px", cursor: "pointer", fontSize: "14px", fontWeight: "700",
  },

  container: { maxWidth: "800px", margin: "0 auto", padding: "24px 16px" },

  header: {
    background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DARK} 100%)`,
    borderRadius: "16px", padding: "28px 32px", marginBottom: "20px", position: "relative", overflow: "hidden",
  },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" },
  reportTitle: { fontSize: "26px", fontWeight: "800", color: "#fff" },
  reportSub: { fontSize: "13px", color: "rgba(255,255,255,0.8)", marginTop: "4px" },
  logo: { fontSize: "18px", fontWeight: "700", color: "#fff", opacity: 0.9 },
  sampleWatermark: {
    position: "absolute", bottom: "10px", left: "20px",
    fontSize: "11px", color: "rgba(255,255,255,0.4)", fontStyle: "italic",
  },

  section: {
    backgroundColor: "#fff", borderRadius: "14px", padding: "24px",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)", marginBottom: "16px",
  },
  sectionTitle: { fontSize: "17px", fontWeight: "800", color: "#1a202c", marginBottom: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" },

  summaryGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" },
  summaryBox: { backgroundColor: "#f7fafc", borderRadius: "10px", padding: "12px 16px", textAlign: "center" },
  summaryLabel: { fontSize: "11px", color: "#718096", marginBottom: "4px" },
  summaryValue: { fontSize: "18px", fontWeight: "800" },

  mixBar: { display: "flex", height: "16px", borderRadius: "8px", overflow: "hidden", marginBottom: "10px" },
  mixSegment: { height: "100%" },
  mixLegend: { display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px" },

  trackList: { display: "flex", flexDirection: "column", gap: "10px" },
  trackRow: { border: "2px solid", borderRadius: "12px", padding: "14px 16px" },

  totalsBox: { backgroundColor: "#f7fafc", borderRadius: "12px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "6px" },
  divider: { borderTop: "1px solid #e2e8f0", margin: "4px 0" },

  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  tableHead: { backgroundColor: TEAL, color: "#fff" },
  th: { padding: "10px 12px", textAlign: "right", fontWeight: "700", whiteSpace: "nowrap" },
  td: { padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #e2e8f0" },

  recList: { display: "flex", flexDirection: "column", gap: "10px" },
  recItem: { display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "14px", color: "#2d3748", lineHeight: "1.6" },
  recIcon: { fontSize: "18px", flexShrink: 0, marginTop: "1px" },

  footer: { backgroundColor: "#fff", borderRadius: "14px", padding: "20px 24px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
  footerName: { fontSize: "15px", fontWeight: "700", color: TEAL, marginBottom: "8px" },
  footerNote: { fontSize: "12px", color: "#a0aec0", lineHeight: "1.6" },
};
