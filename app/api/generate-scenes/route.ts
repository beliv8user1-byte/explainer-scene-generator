import { NextRequest, NextResponse } from "next/server";
import { SCENE_SYSTEM } from "@/lib/prompts";
import { SceneSetSchema } from "@/lib/schemas";
import { jsonrepair } from "jsonrepair";

// OpenRouter config
const OR_BASE = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OR_KEY = process.env.OPENROUTER_API_KEY!;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Explainer Scene Generator";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ---------- helpers ----------
function stripCodeFences(s: string) {
  return s.replace(/```[a-z]*\n?([\s\S]*?)```/gi, (_m, p1) => p1 || "");
}
function extractJson(s: string) {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return s;
}
function fixQuotes(s: string) {
  return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}
function tidyJson(raw: string) {
  let t = raw?.trim() ?? "";
  t = stripCodeFences(t);
  t = fixQuotes(t);
  t = extractJson(t);
  try { return JSON.parse(t); } catch {}
  try { return JSON.parse(jsonrepair(t)); } catch {}
  return null;
}
function normalizeTime(t: string) {
  const dash = t.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/);
  if (dash) {
    const mm = String(parseInt(dash[1], 10)).padStart(2, "0");
    const ss = String(parseInt(dash[2], 10)).padStart(2, "0");
    return `${mm}:${ss}`;
  }
  const colon = t.match(/(\d{1,2}):(\d{1,2})/);
  if (colon) {
    const mm = String(parseInt(colon[1], 10)).padStart(2, "0");
    const ss = String(parseInt(colon[2], 10)).padStart(2, "0");
    return `${mm}:${ss}`;
  }
  const secs = t.match(/(\d{1,2})\s*s/);
  if (secs) return `00:${String(parseInt(secs[1], 10)).padStart(2, "0")}`;
  return t;
}
function normalizeScenesShape(input: any) {
  if (!input || typeof input !== "object") return null;
  const scenes = Array.isArray(input.scenes) ? input.scenes : [];
  const fixed = scenes.map((s: any, i: number) => ({
    index: Number(s.index ?? i + 1),
    start: normalizeTime(String(s.start ?? "00:00")),
    end: normalizeTime(String(s.end ?? "00:08")),
    visual: String(s.visual ?? "").trim(),
    text: String(s.text ?? "").trim(),
    vo: String(s.vo ?? "").trim(),
    imagePrompt: String(s.imagePrompt ?? "").trim()
  }));
  return { scenes: fixed };
}

async function callScenesViaOpenRouter(script: string, style?: string, forceJson = false) {
  const userContent = `Make concise, cinematic scenes from this script.${style ? ` Style: ${style}` : ""}\n\nSCRIPT:\n${script}`;

  const body: any = {
    model: process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free",
    messages: [
      { role: "system", content: SCENE_SYSTEM },
      { role: "user", content: userContent },
    ],
    temperature: 0.3,
  };
  if (forceJson) body.response_format = { type: "json_object" };

  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OR_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME,
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || res.statusText;
    throw new Error(`OpenRouter text error: ${msg}`);
  }
  return json?.choices?.[0]?.message?.content || "";
}

// ---------- route ----------
export async function POST(req: NextRequest) {
  const { script, style } = await req.json();
  if (!script) return NextResponse.json({ error: "script required" }, { status: 400 });

  try {
    // Try with JSON response_format first
    let raw = await callScenesViaOpenRouter(script, style, true);
    let obj = tidyJson(raw);
    let normalized = normalizeScenesShape(obj);

    // Fallback: normal completion (some models format better this way)
    if (!normalized) {
      raw = await callScenesViaOpenRouter(script, style, false);
      obj = tidyJson(raw);
      normalized = normalizeScenesShape(obj);
    }

    if (!normalized) throw new Error("Invalid scenes JSON");

    // Final validation gate
    const parsed = SceneSetSchema.safeParse(normalized);
    if (!parsed.success) {
      // Soft fix: clamp to max 8 scenes
      const compact = { scenes: normalized.scenes.slice(0, 8) };
      const recheck = SceneSetSchema.safeParse(compact);
      if (!recheck.success) throw new Error("Invalid scenes JSON");
      return NextResponse.json({ ok: true, scenes: compact.scenes });
    }

    return NextResponse.json({ ok: true, scenes: parsed.data.scenes });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Invalid scenes JSON" }, { status: 500 });
  }
}
