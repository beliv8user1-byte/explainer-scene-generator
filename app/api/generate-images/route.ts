import { NextRequest, NextResponse } from "next/server";
import { OPENROUTER_IMAGE_MODEL } from "@/lib/openrouter";

// Pull from env or fall back to defaults
const OR_BASE = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OR_KEY = process.env.OPENROUTER_API_KEY!;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Explainer Scene Generator";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Safely extract a base64 data URL from OpenRouter's response
function extractDataUrl(json: any): string | null {
  const msg = json?.choices?.[0]?.message;
  // Preferred field per docs
  const img = msg?.images?.[0]?.image_url?.url;
  if (typeof img === "string" && img.startsWith("data:image")) return img;

  // Sometimes the model sticks it into content as a plain data URL string
  const content = msg?.content;
  if (typeof content === "string" && content.startsWith("data:image")) return content;

  // Occasionally wrapped in a tiny JSON blob
  try {
    const parsed = typeof content === "string" ? JSON.parse(content) : null;
    if (parsed?.image && String(parsed.image).startsWith("data:image")) return parsed.image;
  } catch {}

  return null;
}

async function renderOne(prompt: string) {
  const payload: any = {
    model: OPENROUTER_IMAGE_MODEL,
    messages: [{ role: "user", content: prompt }],
    // Required for image-generation models on OpenRouter
    modalities: ["image", "text"],
  };

  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OR_KEY}`,
      "Content-Type": "application/json",
      // Optional attribution headers recommended by OpenRouter
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || res.statusText;
    throw new Error(`OpenRouter image error: ${msg}`);
  }

  const dataUrl = extractDataUrl(json);
  if (!dataUrl) throw new Error("No image in response");
  return dataUrl;
}

export async function POST(req: NextRequest) {
  const { scenes } = await req.json();
  if (!Array.isArray(scenes) || scenes.length === 0) {
    return NextResponse.json({ ok: false, error: "scenes required" }, { status: 400 });
  }

  try {
    // Build prompts and render sequentially (gentler on free rate limits)
    const images: string[] = [];
    for (const s of scenes) {
      const base = (s?.imagePrompt || s?.visual || "").toString().trim();
      const prompt = `Explainer storyboard frame, ${base}. 16:9, cinematic lighting, clean graphic style.`;
      images.push(await renderOne(prompt));
    }

    return NextResponse.json({ ok: true, images });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Image generation failed" }, { status: 500 });
  }
}
