import { useRouter } from "next/router";

export default function Landing() {
  const router = useRouter();

  return (
    <div dir="rtl" style={{ fontFamily: "Arial, sans-serif", color: "#1a202c" }}>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.badge}>🏦 המערכת החכמה למשכנתאות בישראל</div>
        <h1 style={s.heroTitle}>
          רוצה לדעת מה תנאי המשכנתא<br />
          שתוכל לקבל –{" "}
          <span style={{ color: "#f6ad55" }}>לפני שאתה מתחיל<br />להתרוצץ בין בנקים?</span>
        </h1>
        <p style={s.heroSub}>
          תהליך מהיר ופשוט בסיומו תקבל כל המידע הנחוץ בר״ח אישי הניתן להורדה
        </p>
        <div style={s.heroBtns}>
          <button style={s.btnPrimary} onClick={() => router.push("/wizard")}>
            📋 לקיחת משכנתא חדשה
          </button>
          <button style={s.btnSecondary} onClick={() => router.push("/wizard")}>
            ← מיחזור משכנתא קיימת
          </button>
        </div>
        <a href="#" style={s.heroLink}>⬇ להורדת דוח לדוגמא לחץ כאן</a>
      </div>

      {/* WHY */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>למה כדאי להתחיל כאן?</h2>
        <div style={s.cardsRow}>
          {[
            { icon: "⏱️", title: "חוסך זמן", sub: "תהליך של 3 דקות בלבד במקום שבועות של פגישות" },
            { icon: "📊", title: "כל האפשרויות במקום אחד", sub: "השוואה בין כל הבנקים והתנאים הטובים ביותר" },
            { icon: "📄", title: "דוח מקצועי", sub: "דוח מפורט עם הסברים פשוטים והמלצות אישיות" },
            { icon: "🛡️", title: "בטוח ופרטי", sub: "המידע שלך מאובטח ומשמש בצורה חסויה" },
          ].map((c) => (
            <div key={c.title} style={s.featureCard}>
              <div style={s.featureIcon}>{c.icon}</div>
              <div style={s.featureTitle}>{c.title}</div>
              <div style={s.featureSub}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT YOU GET */}
      <div style={s.sectionBlue}>
        <h2 style={s.sectionTitle}>מה תקבל בתהליך?</h2>
        <div style={s.checkGrid}>
          {[
            "תדע בדיוק מה תנאי המשכנתא שאתה יכול לקבל",
            "קבל דוח מקצועי בעברית פשוטה",
            "חוסך ביורוקרטיה ובפגישות מיותרות",
            "השוואה בין כל הבנקים במקום אחד",
          ].map((item) => (
            <div key={item} style={s.checkItem}>
              <span style={s.checkMark}>✅</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <div style={s.section}>
        <h2 style={s.sectionTitle}>מי מאחורי השירות?</h2>
        <div style={s.aboutCard}>
          <div style={{ flex: 1 }}>
            <h3 style={s.aboutName}>אוריה שמוקלר</h3>
            <p style={s.aboutRole}>יועצת משכנתאות מוסמכת ולשעבר מנהלת סניף בבנק.</p>
            <p style={s.aboutDesc}>
              עם ניסיון של שנים בתעשיית הבנקאות, אני מביאה עמוקה של תהליכי המשכנתאות והאישורי.
              המטרה שלי היא ללוות אתכם בתהליך קבלת המשכנתא, להנגיש את התנאים הטובים ביותר בזמן ובכסף.
            </p>
            <div style={s.aboutServices}>
              <strong>בין השירותים שאני מציעה:</strong>
              <div>✅ ייעוץ משכנתאות מותאם אישית</div>
              <div>✅ איחוד הלוואות</div>
              <div>✅ מחזור משכנתא קיימת</div>
              <div>✅ ייעוץ פיננסי וליווי השקעות</div>
            </div>
          </div>
          <div style={s.aboutPhoto}>
            <div style={s.photoPlaceholder}>
              <div style={{ fontSize: "48px" }}>👩‍💼</div>
              <div style={{ fontSize: "13px", color: "#4a5568", marginTop: "8px", fontWeight: "700" }}>אוריה שמוקלר</div>
              <div style={{ fontSize: "11px", color: "#718096" }}>ייעוץ פיננסי ומשכנתאות</div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div style={s.footerCta}>
        <h2 style={s.footerTitle}>מוכן להתחיל? זה לוקח רק 3 דקות</h2>
        <p style={s.footerSub}>ענה על כמה שאלות פשוטות וקבל את הדוח המלא שלך</p>
        <button style={s.btnPrimary} onClick={() => router.push("/wizard")}>
          בדוק זכאות עכשיו ←
        </button>
      </div>

    </div>
  );
}

const TEAL = "#0d9488";
const TEAL_DARK = "#0f766e";

const s = {
  hero: {
    background: `linear-gradient(135deg, ${TEAL} 0%, #134e4a 100%)`,
    color: "#fff",
    textAlign: "center",
    padding: "60px 24px 80px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "20px",
    padding: "6px 18px",
    fontSize: "13px",
    marginBottom: "24px",
  },
  heroTitle: {
    fontSize: "clamp(22px, 4vw, 34px)",
    fontWeight: "800",
    lineHeight: "1.4",
    margin: "0 auto 20px",
    maxWidth: "700px",
  },
  heroSub: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.85)",
    marginBottom: "32px",
    maxWidth: "500px",
    margin: "0 auto 32px",
  },
  heroBtns: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  btnPrimary: {
    backgroundColor: "#fff",
    color: TEAL_DARK,
    border: "none",
    borderRadius: "10px",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.7)",
    borderRadius: "10px",
    padding: "14px 28px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  heroLink: {
    display: "block",
    color: "rgba(255,255,255,0.75)",
    fontSize: "13px",
    textDecoration: "underline",
    marginTop: "8px",
  },

  section: {
    backgroundColor: "#fff",
    padding: "60px 24px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  sectionBlue: {
    backgroundColor: "#f0f9ff",
    padding: "60px 24px",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "800",
    marginBottom: "36px",
    color: "#1a202c",
  },

  cardsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  featureCard: {
    backgroundColor: "#f7fafc",
    borderRadius: "14px",
    padding: "24px 16px",
    textAlign: "center",
    border: "1px solid #e2e8f0",
  },
  featureIcon: { fontSize: "36px", marginBottom: "12px" },
  featureTitle: { fontSize: "15px", fontWeight: "700", marginBottom: "6px", color: "#1a202c" },
  featureSub: { fontSize: "12px", color: "#718096", lineHeight: "1.5" },

  checkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  checkItem: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "14px 18px",
    fontSize: "14px",
    color: "#2d3748",
    fontWeight: "600",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  checkMark: { fontSize: "16px", flexShrink: 0 },

  aboutCard: {
    display: "flex",
    gap: "32px",
    alignItems: "flex-start",
    backgroundColor: "#f7fafc",
    borderRadius: "16px",
    padding: "32px",
    flexWrap: "wrap",
  },
  aboutName: { fontSize: "20px", fontWeight: "800", marginBottom: "4px", color: "#1a202c" },
  aboutRole: { fontSize: "13px", color: TEAL_DARK, fontWeight: "600", marginBottom: "12px" },
  aboutDesc: { fontSize: "13px", color: "#4a5568", lineHeight: "1.7", marginBottom: "16px" },
  aboutServices: { fontSize: "13px", color: "#2d3748", lineHeight: "2" },
  aboutPhoto: { flexShrink: 0 },
  photoPlaceholder: {
    width: "180px",
    height: "220px",
    backgroundColor: "#e2e8f0",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `2px solid ${TEAL}`,
  },

  footerCta: {
    background: `linear-gradient(135deg, ${TEAL} 0%, #134e4a 100%)`,
    color: "#fff",
    textAlign: "center",
    padding: "60px 24px",
  },
  footerTitle: { fontSize: "26px", fontWeight: "800", marginBottom: "10px" },
  footerSub: { fontSize: "14px", color: "rgba(255,255,255,0.8)", marginBottom: "28px" },
};
