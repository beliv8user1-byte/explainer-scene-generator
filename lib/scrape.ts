import * as cheerio from "cheerio";

export async function scrapeUrl(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  return extractFromHtml(html, url);
}

export function extractFromHtml(html: string, url?: string) {
  const $ = cheerio.load(html);

  // Remove script/style/nav/footer to reduce noise
  ["script", "style", "noscript", "nav", "footer", "iframe"].forEach((sel) => $(sel).remove());

  const title = $("title").first().text().trim();
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const links = new Array<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !href.startsWith("javascript:")) links.push(href);
  });

  return { url, title, text, links };
}

