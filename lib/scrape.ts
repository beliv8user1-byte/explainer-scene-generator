import * as cheerio from "cheerio";

export async function scrapePublicPage(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr("content") ||
    $("title").text() ||
    "";
  const desc =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";
  const h1 = $("h1").first().text();
  const about =
    $('[id*="about" i], section:contains("About")').text().slice(0, 4000) ||
    desc;

  return { title, desc, h1, about };
}
