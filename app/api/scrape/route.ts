import { NextRequest, NextResponse } from "next/server";
import { scrapePublicPage } from "@/lib/scrape";

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
  if ((/linkedin\.com\//i).test(url)) {
    return NextResponse.json({ ok: false, error: "LinkedIn scraping disabled. Paste About text instead." }, { status: 400 });
  }

  try {
    const data = await scrapePublicPage(url);
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
