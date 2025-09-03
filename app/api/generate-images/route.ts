import { NextRequest, NextResponse } from "next/server";
import { openrouter, OPENROUTER_IMAGE_MODEL } from "@/lib/openrouter";

function extractImageData(resp: any): string | null {
  // Try common spots where OpenRouter returns data URLs
  const msg = resp?.choices?.[0]?.message;
  // 1) Some models return content string with a data URL
  const maybeText = msg?.content;
  if (typeof maybeText === "string" && maybeText.startsWith("data:image")) return maybeText;

  // 2) Some return images array with url
  const imgUrl = msg?.images?.[0]?.image_url?.url;
  if (typeof imgUrl === "string" && imgUrl.startsWith("data:image")) return imgUrl;

  // 3) Some return a JSON object inside content
  try {
    const parsed = JSON.parse(maybeText || "{}");
    if (typeof parsed.image === "string" && parsed.image.startsWith("data:image")) return parsed.image;
  } catch {}

  return null;
}

export async function POST(req: NextRequest) {
  const { scenes } = await req.json();
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return NextResponse.json({ error: "scenes required" }, { status: 400 });
  }

  try {
    const images: string[] = [];
    for (const s of scenes) {
      const prompt = `Explainer storyboard frame, ${s?.imagePrompt || s?.visual || ""}. 16:9, cinematic lighting, clean graphic style.`;
      const resp = await openrouter.chat.completions.create({
        model: OPENROUTER_IMAGE_MODEL,
        messages: [{ role: "user", content: prompt }],
        // image-capable models on OpenRouter often need modalities
        modalities: ["image", "text"]
      });

      const dataUrl = extractImageData(resp);
      if (!dataUrl) throw new Error("No image in response");
      images.push(dataUrl);
    }

    return NextResponse.json({ ok: true, images });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
