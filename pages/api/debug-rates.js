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

    // 3. Look for rate values (e.g. "3.00%", "2.88%") near bank names
    // Find first occurrence of a percentage-like pattern in decoded HTML
    const rateIdx = decoded.search(/\d{1,2}\.\d{2}%/);
    const rateSnippet = rateIdx >= 0
      ? decoded.slice(Math.max(0, rateIdx - 500), rateIdx + 1000)
      : "no X.XX% pattern found";

    // 4. Look for result divs or list items containing bank data
    const resultDivs = [];
    const divRe = /<(?:div|li|tr)[^>]*class=["'][^"']*result[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|li|tr)>/gi;
    let dm;
    while ((dm = divRe.exec(postHtml)) !== null) {
      const text = decodeEntities(dm[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
      if (text.length > 10) resultDivs.push(text.slice(0, 300));
    }

    // 5. Search for JSON embedded in the page
    const jsonMatches = [];
    const jsonRe = /\{[^{}]{20,}"(?:rate|ריבית|interest|bank)[^{}]*\}/gi;
    let jm;
    while ((jm = jsonRe.exec(postHtml)) !== null && jsonMatches.length < 5) {
      jsonMatches.push(jm[0].slice(0, 200));
    }

    // 6. 500-char snippet around first %.XX pattern in raw HTML
    const rawRateIdx = postHtml.search(/\d{1,2}\.\d{2}%/);
    const rawRateSnippet = rawRateIdx >= 0
      ? postHtml.slice(Math.max(0, rawRateIdx - 300), rawRateIdx + 500)
      : "no rate pattern in raw HTML";

    return res.status(200).json({
      postStatus: postRes.status,
      postHtmlLength: postHtml.length,
      rateSnippet,
      resultDivs,
      jsonMatches,
      rawRateSnippet,
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
