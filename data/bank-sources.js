/**
 * מקורות מורשים לנתוני ריביות משכנתא בישראל
 * מבוסס על: "רשימת קישורים למשכנתאות בישראל לפי בנק"
 *
 * סדר עדיפות:
 * 1. בנק ישראל (קו המשווה) — הכי אמין, מבוסס על דיווחי הבנקים
 * 2. אתרי הבנקים הרשמיים — אמת תפעולית לעמלות ומסמכים
 * 3. מקורות פרטיים (קנטה, משכנתא גורו) — אינדיקטיבי בלבד
 */

// דומיינים מורשים לחיפוש — Tavily יחפש רק בתוכם
export const APPROVED_DOMAINS = [
  // בנק ישראל — עדיפות עליונה
  "boi.org.il",

  // בנק הפועלים
  "bankhapoalim.co.il",

  // בנק לאומי
  "mortgage.leumi.co.il",
  "leumi.co.il",
  "bankleumi.co.il",

  // בנק מזרחי-טפחות (כולל בנק אגוד שמוזג אליו)
  "mizrahi-tefahot.co.il",
  "mizrahitefahot.co.il",

  // בנק דיסקונט
  "discountbank.co.il",
  "mortgage.discountbank.co.il",

  // בנק יהב
  "bank-yahav.co.il",
  "bankyahav.co.il",

  // בנק אוצר החייל
  "bankotsar.co.il",

  // בנק מרכנתיל
  "mercantile.co.il",
  "mortgage.mercantile.co.il",
];

// קישורים ישירים לדפי ריביות ותעריפונים לפי בנק
export const BANK_SOURCES = {
  "בנק ישראל — קו המשווה": {
    priority: 1,
    urls: [
      "https://www.boi.org.il/information/bank-paymnts/financial-education/campaigns/boi-equator/mortgage/",
      "https://www.boi.org.il/roles/statistics/mortgage-avg-int-activity/",
      "https://www.boi.org.il/information/interestrates/",
      "https://www.boi.org.il/boi_files/Pikuah/TamInt010.xls",
    ],
    note: "המקור הרשמי הכי אמין — מבוסס על דיווחי הבנקים לפיקוח על הבנקים",
  },

  "בנק הפועלים": {
    priority: 2,
    urls: [
      "https://www.bankhapoalim.co.il/he/mortgage",
      "https://www.bankhapoalim.co.il/he/mortgage/types-of-mortgages",
      "https://www.bankhapoalim.co.il/he/interest-update",
    ],
    pdfs: [
      "https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/Taarifon/uniteddec2025.pdf",
      "https://www.bankhapoalim.co.il/sites/default/files/media/PDFS/early_repayment_types.pdf",
    ],
  },

  "בנק לאומי": {
    priority: 2,
    urls: [
      "https://www.mortgage.leumi.co.il/",
      "https://www.mortgage.leumi.co.il/all-about-mortgage/category/about/options",
      "https://www.leumi.co.il/he/savings/interest-rate-table",
    ],
    pdfs: [
      "https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotMekuzarL.pdf",
      "https://www.bankleumi.co.il/static-files/Commissions_Leumi/AmlotYechidimL.pdf",
      "https://mortgage.leumi.co.il/mortgage/s3fs-public/complex_link_file/06-25/malmash_6541_Acc.pdf",
    ],
  },

  "בנק מזרחי-טפחות": {
    priority: 2,
    note: "כולל גם בנק אגוד שמוזג לתוכו",
    urls: [
      "https://www.mizrahitefahot.co.il/mortgages/",
      "https://www.mizrahitefahot.co.il/brokerage/index-table/",
    ],
    pdfs: [
      "https://www.mizrahi-tefahot.co.il/media/mashkanta.pdf",
      "https://www.mizrahitefahot.co.il/media/hodaa01.pdf",
    ],
  },

  "בנק דיסקונט": {
    priority: 2,
    urls: [
      "https://www.discountbank.co.il/private/mortgage/",
      "https://mortgage.discountbank.co.il/discount-mortgage/mortgage-loans",
      "https://www.discountbank.co.il/private/general-information/interest/interest-prime/",
    ],
    pdfs: [
      "https://www.discountbank.co.il/media/gqibniig/concentrated_taarif_mortgage_-07-02-2025.pdf",
    ],
  },

  "בנק יהב": {
    priority: 2,
    urls: [
      "https://www.bankyahav.co.il/loans/mortgage-in-tefahot/",
      "https://www.bank-yahav.co.il/forms-download/",
    ],
    pdfs: [
      "https://www.bank-yahav.co.il/media/pdfashrai.pdf",
      "https://www.bank-yahav.co.il/media/2-2025_taarifon_male.pdf",
    ],
  },

  "בנק אוצר החייל": {
    priority: 2,
    urls: [
      "https://www.bankotsar.co.il/private/loansandmortgages/mortgages/",
      "https://www.bankotsar.co.il/private/loansandmortgages/mortgages/rate/",
    ],
    pdfs: [
      "https://www.bankotsar.co.il/media/ibdn0zc2/mashkanta-07022025.pdf",
      "https://www.bankotsar.co.il/media/irafkpaz/mashkanta-24122025.xls",
    ],
  },

  "בנק מרכנתיל": {
    priority: 2,
    urls: [
      "https://www.mercantile.co.il/private/mortage/",
      "https://mortgage.mercantile.co.il/mortgage-types/tracks",
    ],
    pdfs: [
      "https://www.mercantile.co.il/media/chnjkdmn/taarifon_private_short_mortgage.pdf",
      "https://mortgage.mercantile.co.il/sites/mortgage.mercantile.co.il/files/pdf/borrow_guide_nagish2.pdf",
    ],
  },
};
