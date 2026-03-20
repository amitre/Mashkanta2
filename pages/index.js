export default function Home() {
  return (
    <div dir="rtl" style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>מחשבון משכנתא</h1>

        <div style={styles.field}>
          <label style={styles.label}>סכום ההלוואה (₪)</label>
          <input style={styles.input} type="number" placeholder="לדוגמה: 1,000,000" />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>תקופה (שנים)</label>
          <input style={styles.input} type="number" placeholder="לדוגמה: 25" />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>ריבית שנתית (%)</label>
          <input style={styles.input} type="number" placeholder="לדוגמה: 4.5" />
        </div>

        <button style={styles.button}>חשב</button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f8",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "32px",
    fontSize: "24px",
    color: "#1a202c",
  },
  field: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    fontSize: "16px",
    border: "1px solid #cbd5e0",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
    textAlign: "right",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    backgroundColor: "#3182ce",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
