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

    // 3. Specific test: פריים, 5 years (Years=1), 750,000₪, בנק הבינלאומי
    const testUrl = `https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx?Years=1&Product=5&SUM=750000`;
    const testRes  = await fetch(testUrl, { headers: BROWSER_HEADERS, redirect: "follow" });
    const testHtml = await testRes.text();

    // Parse mortgageHover rows
    const testRows = [];
    const rowRe2 = /<tr[^>]+class="[^"]*mortgageHover[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
    let trm;
    while ((trm = rowRe2.exec(testHtml)) !== null) {
      const rowHtml = trm[1];
      const altM  = rowHtml.match(/alt="([^"]+)"/i);
      const rateM = rowHtml.match(/<td[^>]+ribit2Compare[^>]*>([\s\S]*?)<\/td>/i);
      const payM  = rowHtml.match(/<td[^>]+monthlyPayment[^>]*>([\s\S]*?)<\/td>/i);
      testRows.push({
        bank:    altM  ? decodeEntities(altM[1])  : null,
        rate:    rateM ? rateM[1].replace(/<[^>]+>/g,"").trim() : null,
        monthly: payM  ? payM[1].replace(/<[^>]+>/g,"").trim()  : null,
      });
    }

    return res.status(200).json({ testUrl, testStatus: testRes.status, testRows });
    // eslint-disable-next-line no-unreachable

    // 3. Extract all JS string literals that look like API endpoints
    const endpoints = new Set();
    const strRe = /["'`]([^"'`]*(?:\.ashx|\.asmx|\.aspx|WebService|Handler|Service|GetData|GetRate|SearchMortgage|Compare)[^"'`]*)["'`]/gi;
    let sm2;
    while ((sm2 = strRe.exec(postHtml)) !== null) endpoints.add(sm2[1]);

    // 4. Extract $.ajax / $.post / $.get / fetch( patterns
    const ajaxCalls = [];
    const ajaxRe = /(?:\$\.ajax|\$\.post|\$\.get|fetch|axios)\s*\(\s*["'`]([^"'`]{5,100})["'`]/gi;
    let am;
    while ((am = ajaxRe.exec(postHtml)) !== null && ajaxCalls.length < 15) {
      ajaxCalls.push(am[1]);
    }

    // 5. Look for function calls around the search button id "calcMortgage"
    const btnIdx = postHtml.indexOf("calcMortgage");
    const btnSnippet = btnIdx >= 0
      ? postHtml.slice(Math.max(0, btnIdx - 100), btnIdx + 600)
      : "calcMortgage not found";

    // 6. Look for any URL with "Result" or "Search" or "GetMortgage" in JS
    const urlMatches = [];
    const urlRe = /["'`](\/[^"'`\s]{3,80}(?:Result|Search|Rates|GetMortgage|Compare)[^"'`\s]*)["'`]/gi;
    let um;
    while ((um = urlRe.exec(postHtml)) !== null && urlMatches.length < 15) {
      urlMatches.push(um[1]);
    }

    return res.status(200).json({
      endpoints: [...endpoints],
      ajaxCalls,
      urlMatches,
      btnSnippet,
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
