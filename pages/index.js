import { useRouter } from "next/router";

export default function Landing() {
  const router = useRouter();

  return (
    <div dir="rtl" style={{ fontFamily: "'Arial', sans-serif", color: "#1a202c", margin: 0, padding: 0 }}>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.badge}>🏦 המערכת החכמה למשכנתאות בישראל</div>

        <h1 style={s.heroTitle}>
          רוצה לדעת מה תנאי המשכנתא שתוכל לקבל –{" "}
          <span style={{ color: "#f6ad55" }}>
            לפני שאתה מתחיל<br />להתרוצץ בין בנקים?
          </span>
        </h1>

        <p style={s.heroSub}>
          תהליך מהיר ופשוט בסיומו תקבל כל המידע הנחוץ בר״ח אישי הניתן להורדה
        </p>

        <div style={s.heroBtns}>
          <button style={s.btnPrimary} onClick={() => router.push("/wizard")}>
            <span style={{ marginLeft: "8px" }}>📋</span> לקיחת משכנתא חדשה
          </button>
          <button style={s.btnOutline} onClick={() => router.push("/wizard")}>
            מיחזור משכנתא קיימת ←
          </button>
        </div>

        <a href="#" style={s.heroLink}>⬇ להורדת דוח לדוגמא לחץ כאן</a>
      </div>

      {/* ── WHY ── */}
      <div style={s.whySection}>
        <h2 style={s.sectionTitle}>למה כדאי להתחיל כאן?</h2>
        <div style={s.featuresGrid}>
          {[
            { icon: "🛡️", title: "בטוח ופרטי",             sub: "המידע שלך מאובטח ומשמש בצורה חסויה" },
            { icon: "📄", title: "דוח מקצועי",              sub: "דוח מפורט עם הסברים פשוטים והמלצות אישיות" },
            { icon: "📊", title: "כל האפשרויות במקום אחד", sub: "השוואה בין כל הבנקים והתנאים הטובים ביותר" },
            { icon: "⏱️", title: "חוסך זמן",               sub: "תהליך של 3 דקות בלבד במקום שבועות של פגישות" },
          ].map((c) => (
            <div key={c.title} style={s.featureCard}>
              <div style={s.iconBox}>{c.icon}</div>
              <div style={s.featureTitle}>{c.title}</div>
              <div style={s.featureSub}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT YOU GET ── */}
      <div style={s.benefitsSection}>
        <h2 style={s.sectionTitle}>מה תקבל בתהליך?</h2>
        <div style={s.benefitsGrid}>
          {[
            "תדע בדיוק מה תנאי המשכנתא שאתה יכול לקבל",
            "קבל דוח מקצועי בעברית פשוטה",
            "חוסך ביורוקרטיה ובפגישות מיותרות",
            "השוואה בין כל הבנקים במקום אחד",
          ].map((item) => (
            <div key={item} style={s.benefitItem}>
              <span style={s.checkIcon}>✅</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ABOUT ── */}
      <div style={s.aboutSection}>
        <h2 style={s.sectionTitle}>מי מאחורי השירות?</h2>
        <div style={s.aboutCard}>
          {/* Text */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <h3 style={s.aboutName}>אוריה שמוקלר</h3>
            <p style={s.aboutRole}>יועצת משכנתאות מוסמכת ולשעבר מנהלת סניף בבנק.</p>
            <p style={s.aboutDesc}>
              עם ניסיון של שנים בתעשיית הבנקאות, אני מביאה הבנה עמוקה של תהליכי המשכנתאות והאישורים.
              המטרה שלי היא ללוות אתכם בתהליך קבלת המשכנתא, להנגיש את התנאים הטובים ביותר בזמן ובכסף.
            </p>
            <div style={s.servicesList}>
              <strong style={{ display: "block", marginBottom: "6px" }}>בין השירותים שאני מציעה:</strong>
              {[
                "ייעוץ משכנתאות מותאם אישית",
                "איחוד הלוואות",
                "מחזור משכנתא קיימת",
                "ייעוץ פיננסי וליווי השקעות",
              ].map((s2) => (
                <div key={s2} style={s.serviceItem}>
                  <span style={{ color: "#38a169", marginLeft: "6px" }}>✅</span> {s2}
                </div>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div style={s.photoWrap}>
            <div style={s.photoBox}>
              <img src="/oria.jpg" alt="אוריה שמוקלר" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
            </div>
            <div style={s.photoLabel}>
              <div style={{ fontWeight: "700", fontSize: "14px" }}>אוריה שמוקלר</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)" }}>ייעוץ פיננסי ומשכנתאות</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER CTA ── */}
      <div style={s.footerCta}>
        <h2 style={s.footerTitle}>מוכן להתחיל?</h2>
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
  /* HERO */
  hero: {
    background: `linear-gradient(160deg, #0d9488 0%, #134e4a 100%)`,
    color: "#fff",
    textAlign: "center",
    padding: "56px 24px 72px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: "20px",
    padding: "6px 20px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "28px",
    letterSpacing: "0.3px",
  },
  heroTitle: {
    fontSize: "clamp(20px, 3.5vw, 32px)",
    fontWeight: "800",
    lineHeight: "1.45",
    margin: "0 auto 20px",
    maxWidth: "680px",
  },
  heroSub: {
    fontSize: "15px",
    color: "rgba(255,255,255,0.82)",
    maxWidth: "480px",
    margin: "0 auto 36px",
    lineHeight: "1.6",
  },
  heroBtns: {
    display: "flex",
    gap: "14px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  btnPrimary: {
    backgroundColor: "#fff",
    color: TEAL_DARK,
    border: "none",
    borderRadius: "10px",
    padding: "14px 30px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  btnOutline: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "2px solid rgba(255,255,255,0.65)",
    borderRadius: "10px",
    padding: "14px 30px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  heroLink: {
    display: "block",
    color: "rgba(255,255,255,0.65)",
    fontSize: "13px",
    textDecoration: "underline",
    marginTop: "4px",
    cursor: "pointer",
  },

  /* WHY */
  whySection: {
    backgroundColor: "#fff",
    padding: "64px 24px",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "800",
    marginBottom: "36px",
    color: "#1a202c",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "18px",
    maxWidth: "880px",
    margin: "0 auto",
  },
  featureCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "28px 18px",
    textAlign: "center",
    backgroundColor: "#fff",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
  },
  iconBox: {
    width: "54px",
    height: "54px",
    borderRadius: "14px",
    backgroundColor: "#e6fffa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    margin: "0 auto 14px",
  },
  featureTitle: { fontSize: "15px", fontWeight: "700", marginBottom: "8px", color: "#1a202c" },
  featureSub:  { fontSize: "13px", color: "#718096", lineHeight: "1.55" },

  /* BENEFITS */
  benefitsSection: {
    backgroundColor: "#f0f9ff",
    padding: "64px 24px",
  },
  benefitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px",
    maxWidth: "820px",
    margin: "0 auto",
  },
  benefitItem: {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2d3748",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  checkIcon: { fontSize: "18px", flexShrink: 0 },

  /* ABOUT */
  aboutSection: {
    backgroundColor: "#fff",
    padding: "64px 24px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  aboutCard: {
    display: "flex",
    gap: "36px",
    alignItems: "flex-start",
    backgroundColor: "#f7fafc",
    borderRadius: "18px",
    padding: "36px",
    border: "1px solid #e2e8f0",
    flexWrap: "wrap",
  },
  aboutName: { fontSize: "20px", fontWeight: "800", color: "#1a202c", marginBottom: "4px" },
  aboutRole: { fontSize: "13px", color: TEAL, fontWeight: "600", marginBottom: "14px" },
  aboutDesc: { fontSize: "13px", color: "#4a5568", lineHeight: "1.75", marginBottom: "18px" },
  servicesList: { fontSize: "13px", color: "#2d3748" },
  serviceItem: { marginBottom: "6px", display: "flex", alignItems: "center" },

  photoWrap: { flexShrink: 0, textAlign: "center" },
  photoBox: {
    width: "180px",
    height: "210px",
    backgroundColor: "#e2e8f0",
    borderRadius: "14px",
    border: `2px solid ${TEAL}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoLabel: {
    marginTop: "10px",
    backgroundColor: TEAL,
    color: "#fff",
    borderRadius: "8px",
    padding: "8px 12px",
    textAlign: "center",
  },

  /* FOOTER CTA */
  footerCta: {
    background: `linear-gradient(160deg, #0d9488 0%, #134e4a 100%)`,
    color: "#fff",
    textAlign: "center",
    padding: "64px 24px",
  },
  footerTitle: { fontSize: "26px", fontWeight: "800", marginBottom: "10px" },
  footerSub:   { fontSize: "14px", color: "rgba(255,255,255,0.8)", marginBottom: "30px" },
};
