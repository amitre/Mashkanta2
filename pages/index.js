import { useState } from "react";

const TRACK_TYPES = [
  { id: "prime", label: "פריים", description: "משתנה כל חצי שנה" },
  { id: "kalatz", label: 'קל"צ', description: "קבועה לא צמודה" },
  { id: "katzam", label: 'קצ"מ', description: "קבועה צמודה מדד" },
  { id: "malatz", label: 'מל"צ', description: "משתנה לא צמודה" },
  { id: "matzam", label: 'מצ"מ', description: "משתנה צמודה מדד" },
];

const PRIME_RATE = 6.25; // Bank of Israel prime rate

function calcMonthlyPayment(principal, annualRate, years) {
  if (!principal || !annualRate || !years) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function fmt(n) {
  return Math.round(n).toLocaleString("he-IL");
}

const defaultTrack = () => ({
  id: Date.now(),
  type: "kalatz",
  amount: "",
  years: "",
  rate: "",
  spread: "",
});

export default function Home() {
  const [propertyValue, setPropertyValue] = useState("");
  const [tracks, setTracks] = useState([defaultTrack()]);
  const [results, setResults] = useState(null);

  const totalLoan = tracks.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const ltv = propertyValue ? ((totalLoan / parseFloat(propertyValue)) * 100).toFixed(1) : null;

  function updateTrack(id, field, value) {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [field]: value };
        if (field === "type" && value === "prime") {
          updated.rate = "";
          updated.spread = "";
        }
        return updated;
      })
    );
  }

  function addTrack() {
    setTracks((prev) => [...prev, defaultTrack()]);
  }

  function removeTrack(id) {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }

  function getEffectiveRate(track) {
    if (track.type === "prime") {
      return PRIME_RATE + (parseFloat(track.spread) || 0);
    }
    return parseFloat(track.rate) || 0;
  }

  function calculate() {
    const computed = tracks.map((t) => {
      const principal = parseFloat(t.amount) || 0;
      const years = parseFloat(t.years) || 0;
      const rate = getEffectiveRate(t);
      const monthly = calcMonthlyPayment(principal, rate, years);
      const total = monthly * years * 12;
      return { ...t, monthly, total, rate };
    });
    setResults(computed);
  }

  const totalMonthly = results ? results.reduce((s, r) => s + r.monthly, 0) : 0;
  const totalCost = results ? results.reduce((s, r) => s + r.total, 0) : 0;
  const totalInterest = results ? totalCost - totalLoan : 0;

  // Warnings
  const cpiLinkedPct = totalLoan
    ? (tracks
        .filter((t) => ["katzam", "matzam"].includes(t.type))
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0) /
        totalLoan) *
      100
    : 0;
  const variablePct = totalLoan
    ? (tracks
        .filter((t) => ["prime", "malatz", "matzam"].includes(t.type))
        .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0) /
        totalLoan) *
      100
    : 0;

  return (
    <div dir="rtl" style={s.page}>
      <div style={s.container}>
        <h1 style={s.title}>השוואת מסלולי משכנתא</h1>
        <p style={s.subtitle}>על פי הנחיות בנק ישראל</p>

        {/* Property Value */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>פרטי הנכס</h2>
          <div style={s.row}>
            <div style={s.field}>
              <label style={s.label}>שווי הנכס (₪)</label>
              <input
                style={s.input}
                type="number"
                placeholder="לדוגמה: 2,000,000"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>סה"כ הלוואה (₪)</label>
              <input style={{ ...s.input, backgroundColor: "#f7fafc" }} value={fmt(totalLoan)} readOnly />
            </div>
            {ltv && (
              <div style={s.field}>
                <label style={s.label}>יחס מימון (LTV)</label>
                <input
                  style={{
                    ...s.input,
                    backgroundColor: "#f7fafc",
                    color: parseFloat(ltv) > 75 ? "#e53e3e" : "#38a169",
                    fontWeight: "bold",
                  }}
                  value={`${ltv}%`}
                  readOnly
                />
              </div>
            )}
          </div>

          {/* Regulation warnings */}
          {totalLoan > 0 && (
            <div style={s.warnings}>
              <RegWarning
                ok={cpiLinkedPct <= 66.67}
                text={`צמוד מדד: ${cpiLinkedPct.toFixed(1)}% (מקסימום 66.67%)`}
              />
              <RegWarning
                ok={variablePct <= 33.33}
                text={`ריבית משתנה: ${variablePct.toFixed(1)}% (מקסימום 33.33%)`}
              />
              {ltv && <RegWarning ok={parseFloat(ltv) <= 75} text={`LTV: ${ltv}% (מקסימום 75% לדירה ראשונה)`} />}
            </div>
          )}
        </div>

        {/* Tracks */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>מסלולי ההלוואה</h2>
          {tracks.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              index={i}
              onUpdate={(field, val) => updateTrack(track.id, field, val)}
              onRemove={() => removeTrack(track.id)}
              canRemove={tracks.length > 1}
            />
          ))}
          <button style={s.addBtn} onClick={addTrack}>
            + הוסף מסלול
          </button>
        </div>

        <button style={s.calcBtn} onClick={calculate}>
          חשב והשווה
        </button>

        {/* Results */}
        {results && (
          <div style={s.card}>
            <h2 style={s.sectionTitle}>תוצאות</h2>
            <table style={s.table}>
              <thead>
                <tr>
                  {["מסלול", "סכום", "שנים", "ריבית", "תשלום חודשי", "סה״כ עלות"].map((h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const trackType = TRACK_TYPES.find((t) => t.id === r.type);
                  return (
                    <tr key={r.id} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                      <td style={s.td}>
                        <span style={s.trackBadge}>{trackType?.label}</span>
                        <br />
                        <small style={{ color: "#718096" }}>{trackType?.description}</small>
                      </td>
                      <td style={s.td}>₪{fmt(r.amount)}</td>
                      <td style={s.td}>{r.years}</td>
                      <td style={s.td}>{r.rate.toFixed(2)}%</td>
                      <td style={{ ...s.td, fontWeight: "600", color: "#2b6cb0" }}>₪{fmt(r.monthly)}</td>
                      <td style={s.td}>₪{fmt(r.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div style={s.summary}>
              <SummaryItem label="תשלום חודשי כולל" value={`₪${fmt(totalMonthly)}`} highlight />
              <SummaryItem label="סה״כ עלות ההלוואה" value={`₪${fmt(totalCost)}`} />
              <SummaryItem label="סה״כ ריבית ששולמה" value={`₪${fmt(totalInterest)}`} warn />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrackRow({ track, index, onUpdate, onRemove, canRemove }) {
  const isPrime = track.type === "prime";
  return (
    <div style={s.trackRow}>
      <div style={s.trackHeader}>
        <span style={s.trackNum}>מסלול {index + 1}</span>
        {canRemove && (
          <button style={s.removeBtn} onClick={onRemove}>
            הסר
          </button>
        )}
      </div>
      <div style={s.row}>
        <div style={s.field}>
          <label style={s.label}>סוג מסלול</label>
          <select style={s.input} value={track.type} onChange={(e) => onUpdate("type", e.target.value)}>
            {TRACK_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} — {t.description}
              </option>
            ))}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>סכום (₪)</label>
          <input
            style={s.input}
            type="number"
            placeholder="0"
            value={track.amount}
            onChange={(e) => onUpdate("amount", e.target.value)}
          />
        </div>
        <div style={s.field}>
          <label style={s.label}>תקופה (שנים)</label>
          <input
            style={s.input}
            type="number"
            placeholder="0"
            value={track.years}
            onChange={(e) => onUpdate("years", e.target.value)}
          />
        </div>
        {isPrime ? (
          <div style={s.field}>
            <label style={s.label}>מרווח מעל פריים (%)</label>
            <input
              style={s.input}
              type="number"
              step="0.01"
              placeholder={`פריים = ${PRIME_RATE}%`}
              value={track.spread}
              onChange={(e) => onUpdate("spread", e.target.value)}
            />
          </div>
        ) : (
          <div style={s.field}>
            <label style={s.label}>ריבית שנתית (%)</label>
            <input
              style={s.input}
              type="number"
              step="0.01"
              placeholder="0.00"
              value={track.rate}
              onChange={(e) => onUpdate("rate", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RegWarning({ ok, text }) {
  return (
    <div style={{ ...s.warning, backgroundColor: ok ? "#f0fff4" : "#fff5f5", borderColor: ok ? "#9ae6b4" : "#fc8181" }}>
      <span style={{ color: ok ? "#38a169" : "#e53e3e", marginLeft: "6px" }}>{ok ? "✓" : "✗"}</span>
      {text}
    </div>
  );
}

function SummaryItem({ label, value, highlight, warn }) {
  return (
    <div style={s.summaryItem}>
      <span style={s.summaryLabel}>{label}</span>
      <span
        style={{
          ...s.summaryValue,
          color: highlight ? "#2b6cb0" : warn ? "#c53030" : "#1a202c",
          fontSize: highlight ? "22px" : "18px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#edf2f7",
    fontFamily: "Arial, sans-serif",
    padding: "32px 16px",
  },
  container: { maxWidth: "860px", margin: "0 auto" },
  title: { textAlign: "center", fontSize: "28px", color: "#1a202c", marginBottom: "4px" },
  subtitle: { textAlign: "center", color: "#718096", marginBottom: "24px", fontSize: "14px" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  sectionTitle: { fontSize: "18px", color: "#2d3748", marginBottom: "16px", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px" },
  row: { display: "flex", gap: "16px", flexWrap: "wrap" },
  field: { flex: "1", minWidth: "160px" },
  label: { display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: "600", color: "#4a5568" },
  input: {
    width: "100%",
    padding: "9px 12px",
    fontSize: "15px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    textAlign: "right",
  },
  warnings: { marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" },
  warning: { padding: "6px 12px", borderRadius: "6px", border: "1px solid", fontSize: "13px", fontWeight: "500" },
  trackRow: { borderBottom: "1px solid #e2e8f0", paddingBottom: "16px", marginBottom: "16px" },
  trackHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  trackNum: { fontWeight: "700", color: "#4a5568", fontSize: "14px" },
  removeBtn: { background: "none", border: "1px solid #fc8181", color: "#e53e3e", borderRadius: "6px", padding: "3px 10px", cursor: "pointer", fontSize: "13px" },
  addBtn: { background: "none", border: "2px dashed #90cdf4", color: "#3182ce", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: "600", width: "100%", marginTop: "8px" },
  calcBtn: { width: "100%", padding: "14px", backgroundColor: "#2b6cb0", color: "#fff", fontSize: "17px", fontWeight: "700", border: "none", borderRadius: "10px", cursor: "pointer", marginBottom: "20px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: { padding: "10px 12px", backgroundColor: "#ebf8ff", color: "#2b6cb0", fontWeight: "700", textAlign: "right", borderBottom: "2px solid #bee3f8" },
  td: { padding: "10px 12px", textAlign: "right", borderBottom: "1px solid #e2e8f0" },
  rowEven: { backgroundColor: "#fff" },
  rowOdd: { backgroundColor: "#f7fafc" },
  trackBadge: { fontWeight: "700", color: "#2d3748" },
  summary: { display: "flex", justifyContent: "space-around", flexWrap: "wrap", marginTop: "20px", gap: "12px", backgroundColor: "#f7fafc", borderRadius: "10px", padding: "20px" },
  summaryItem: { textAlign: "center" },
  summaryLabel: { display: "block", fontSize: "13px", color: "#718096", marginBottom: "4px" },
  summaryValue: { fontWeight: "700" },
};
