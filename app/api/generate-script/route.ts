import { NextRequest, NextResponse } from "next/server";
import { openrouter, OPENROUTER_TEXT_MODEL } from "@/lib/openrouter";
import { SCRIPT_SYSTEM } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const { businessName, websiteUrl, notes, scraped } = await req.json();
  const contextBlob = JSON.stringify({ businessName, websiteUrl, scraped, notes }).slice(0, 6000);

  try {
    const completion = await openrouter.chat.completions.create({
      model: OPENROUTER_TEXT_MODEL,
      messages: [
        { role: "system", content: SCRIPT_SYSTEM },
        { role: "user", content: `Using this business context, write a 60s explainer script with timestamps.\n\nContext:\n${contextBlob}` }
      ],
      temperature: 0.6
    });

    const content = completion.choices?.[0]?.message?.content || "";
    if (!content) throw new Error("Empty script");
    return NextResponse.json({ ok: true, script: content });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
