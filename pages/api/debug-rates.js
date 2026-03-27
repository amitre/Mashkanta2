/**
 * Temporary debug endpoint — DELETE after fixing scraper
 * GET /api/debug-rates
 * Returns info about what the themarker page contains.
 */
const SCRAPE_URL =
  "https://www.supermarker.themarker.com/Mortgage/CompareMortgage.aspx";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8",
};

export default async function handler(req, res) {
  try {
    const pageRes = await fetch(SCRAPE_URL, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });

    const html = await pageRes.text();
    const status = pageRes.status;
    const finalUrl = pageRes.url;

    // Extract all select elements
    const selects = [];
    const selectRe = /<select([^>]*)>([\s\S]*?)<\/select>/gi;
    let sm;
    while ((sm = selectRe.exec(html)) !== null) {
      const nameM = sm[1].match(/\bname=["']([^"']*)["']/i);
      const idM   = sm[1].match(/\bid=["']([^"']*)["']/i);
      const opts  = [];
      const optRe = /<option([^>]*)>([\s\S]*?)<\/option>/gi;
      let om;
      while ((om = optRe.exec(sm[2])) !== null) {
        const valM = om[1].match(/\bvalue=["']([^"']*)["']/i);
        opts.push({ value: valM?.[1], text: om[2].replace(/<[^>]+>/g,"").trim() });
      }
      selects.push({ name: nameM?.[1], id: idM?.[1], options: opts });
    }

    // Extract visible inputs
    const inputs = [];
    const inputRe = /<input([^>]*)>/gi;
    let im;
    while ((im = inputRe.exec(html)) !== null) {
      const tag  = im[1];
      const typeM = tag.match(/\btype=["']?(\w+)["']?/i);
      const type  = typeM?.[1]?.toLowerCase() ?? "text";
      if (type === "hidden") continue;
      const nameM = tag.match(/\bname=["']([^"']*)["']/i);
      const idM   = tag.match(/\bid=["']([^"']*)["']/i);
      inputs.push({ name: nameM?.[1], id: idM?.[1], type });
    }

    // First 2000 chars of HTML
    const htmlSnippet = html.slice(0, 2000);

    return res.status(200).json({
      status,
      finalUrl,
      htmlLength: html.length,
      selects,
      inputs,
      htmlSnippet,
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
