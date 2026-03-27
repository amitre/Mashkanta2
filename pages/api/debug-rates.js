/**
 * Temporary debug endpoint — DELETE after fixing scraper
 * GET /api/debug-rates
 * POSTs to themarker (קבועה צמודה, 1M₪, 15yr) and returns parsed structure.
 */
const SCRAPE_URL =
  "https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8",
};

function decodeEntities(str) {
  return str
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/gi, "&").replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"').replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function extractHiddenInputs(html) {
  const fields = {};
  const re = /<input([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    if (!/type=["']?hidden["']?/i.test(tag)) continue;
    const nameM = tag.match(/\bname=["']([^"']*)["']/i);
    const valM  = tag.match(/\bvalue=["']([^"']*)["']/i);
    if (nameM) fields[nameM[1]] = valM ? valM[1] : "";
  }
  return fields;
}

function parseCookies(res) {
  const raw = res.headers.get("set-cookie") || "";
  return raw.split(/,(?=\s*\w+=)/).map((c) => c.split(";")[0].trim()).filter(Boolean).join("; ");
}

export default async function handler(req, res) {
  try {
    // 1. GET the page
    const pageRes = await fetch(SCRAPE_URL, { headers: BROWSER_HEADERS, redirect: "follow" });
    const pageHtml = await pageRes.text();
    const cookies = parseCookies(pageRes);
    const hidden = extractHiddenInputs(pageHtml);

    // 2. POST: קבועה צמודה (value=3), 1,000,000₪, 15 years (value=3)
    const body = new URLSearchParams({
      ...hidden,
      "ctl00$ContentPlaceHolder1$tbSum": "1000000",
      "ctl00$ContentPlaceHolder1$selectTkufatHalvaa": "3",
      "ctl00$ContentPlaceHolder1$selectKodMutzar": "3",
    });

    const postRes = await fetch(SCRAPE_URL, {
      method: "POST",
      headers: {
        ...BROWSER_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookies,
        Referer: SCRAPE_URL,
      },
      body: body.toString(),
      redirect: "follow",
    });

    const postHtml = await postRes.text();

    // 3. Find snippet around first bank name in decoded HTML
    const decoded = decodeEntities(postHtml);
    const bankIdx = decoded.search(/לאומי|פועלים|מזרחי/);
    const bankSnippet = bankIdx >= 0
      ? decoded.slice(Math.max(0, bankIdx - 300), bankIdx + 1000)
      : "bank names not found in decoded HTML";

    // 4. Collect tables that seem to contain rate data
    const tables = [];
    const tableRe = /<table[^>]*>[\s\S]*?<\/table>/gi;
    let tm;
    while ((tm = tableRe.exec(postHtml)) !== null) {
      const raw = tm[0];
      const dec = decodeEntities(raw);
      if (/פועלים|לאומי|מזרחי|דיסקונט/.test(dec)) {
        // Extract rows as plain text
        const rows = [];
        const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
        let rm;
        while ((rm = rowRe.exec(raw)) !== null) {
          const cellRe = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
          let cm;
          const cells = [];
          while ((cm = cellRe.exec(rm[1])) !== null) {
            cells.push(decodeEntities(cm[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()));
          }
          if (cells.length) rows.push(cells);
        }
        tables.push(rows);
      }
    }

    return res.status(200).json({
      postStatus: postRes.status,
      postHtmlLength: postHtml.length,
      bankSnippet,
      tables,
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
