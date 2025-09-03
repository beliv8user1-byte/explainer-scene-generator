import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeUrl } from "@/lib/scrape";

const BodySchema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = BodySchema.parse(body);

    if (/linkedin\.com/i.test(url)) {
      return NextResponse.json(
        { error: "LinkedIn scraping is not allowed." },
        { status: 400 }
      );
    }

    const result = await scrapeUrl(url);
    return NextResponse.json(result);
  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

