const DEFAULT_RATES = {
  prime: 0.056,
  fixed_cpi: 0.035,
  fixed_unlinked: 0.055,
  variable_unlinked: 0.048,
};

const BANKS = [
  "בנק הפועלים",
  "בנק לאומי",
  "בנק מזרחי-טפחות",
  "בנק דיסקונט",
  "בנק יהב",
  "בנק אגוד",
  "אוצר החייל",
  "בנק מרכנתיל",
];

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(200).json({
      banks: buildDefaultBanks(),
      live: false,
      source: "ברירת מחדל (אין מפתח API)",
      date: new Date().toLocaleDateString("he-IL"),
    });
  }

  const today = new Date().toLocaleDateString("he-IL");

  const prompt = `אתה מומחה משכנתאות בישראל. חפש באינטרנט את ריביות המשכנתא העדכניות ביותר (${today}) עבור הבנקים הבאים:
${BANKS.join(", ")}.

מקורות מועדפים לחיפוש: אתרי הבנקים עצמם, אתר קנטה (canta.co.il), משכנתא גורו (mashkanta.guru).

עבור כל בנק, ספק את הריביות הממוצעות הטובות ביותר עבור 4 מסלולים:
1. פריים (prime) - ריבית פריים + מרווח
2. קבועה צמודה למדד (fixed_cpi)
3. קבועה לא צמודה (fixed_unlinked)
4. משתנה לא צמודה כל 5 שנים (variable_unlinked)

החזר JSON בדיוק בפורמט הזה (ריביות כמספר עשרוני, לדוגמה 5.6% = 0.056):
{
  "banks": [
    {
      "name": "שם הבנק",
      "prime": 0.056,
      "fixed_cpi": 0.035,
      "fixed_unlinked": 0.055,
      "variable_unlinked": 0.048
    }
  ],
  "source": "שמות המקורות שנמצאו",
  "date": "${today}"
}

אם לא מצאת נתונים לבנק מסוים, השתמש בערכים ממוצעים סבירים בשוק. החזר רק JSON, ללא טקסט נוסף.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text || "";

    // Extract JSON block
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in Gemini response");

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.banks || !Array.isArray(parsed.banks) || parsed.banks.length === 0) {
      throw new Error("Invalid banks data");
    }

    // Ensure all 8 banks are present, fill missing with defaults
    const bankMap = {};
    parsed.banks.forEach((b) => { bankMap[b.name] = b; });

    const banks = BANKS.map((name) => {
      const b = bankMap[name] || {};
      return {
        name,
        prime: sanitizeRate(b.prime, DEFAULT_RATES.prime),
        fixed_cpi: sanitizeRate(b.fixed_cpi, DEFAULT_RATES.fixed_cpi),
        fixed_unlinked: sanitizeRate(b.fixed_unlinked, DEFAULT_RATES.fixed_unlinked),
        variable_unlinked: sanitizeRate(b.variable_unlinked, DEFAULT_RATES.variable_unlinked),
      };
    });

    return res.status(200).json({
      banks,
      live: true,
      source: parsed.source || "Gemini + Google Search",
      date: parsed.date || today,
    });
  } catch (err) {
    console.error("Rates fetch error:", err.message);
    return res.status(200).json({
      banks: buildDefaultBanks(),
      live: false,
      source: "ברירת מחדל (שגיאה בעדכון)",
      date: today,
      error: err.message,
    });
  }
}

function sanitizeRate(val, fallback) {
  const n = parseFloat(val);
  if (isNaN(n) || n <= 0 || n > 0.3) return fallback;
  return n;
}

function buildDefaultBanks() {
  return BANKS.map((name) => ({ name, ...DEFAULT_RATES }));
}
