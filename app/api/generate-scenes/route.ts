import { NextRequest, NextResponse } from "next/server";
import { SCENE_SYSTEM } from "@/lib/prompts";
import {
  SceneSetSchema,
  SceneSetLooseSchema,
  clampWords,
  clampChars
} from "@/lib/schemas";
import { jsonrepair } from "jsonrepair";

// ---------- OpenRouter config ----------
const OR_BASE = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const OR_KEY = process.env.OPENROUTER_API_KEY!;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Explainer Scene Generator";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const TEXT_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

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
function normalizeTime(t: string | undefined, fallback = "00:00"): string {
  if (!t) return fallback;
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
  return fallback;
}

// A strongly-typed normalized scene shape for the rest of the pipeline
type NormScene = {
  index: number;
  start: string;
  end: string;
  visual: string;
  text: string;
  vo: string;
  imagePrompt: string;
};

function toSecs(t: string): number {
  const [m, s] = t.split(":").map((n) => parseInt(n, 10));
  return (m || 0) * 60 + (s || 0);
}
function span(sc: NormScene): number {
  return Math.max(1, toSecs(sc.end) - toSecs(sc.start));
}

/** Split one scene into two halves (time-only heuristic) */
function splitScene(scene: NormScene): [NormScene, NormScene] {
  const t1 = toSecs(scene.start);
  const t2 = toSecs(scene.end);
  const mid = Math.max(t1 + 1, Math.floor((t1 + t2) / 2));
  const midStr = `${String(Math.floor(mid / 60)).padStart(2, "0")}:${String(mid % 60).padStart(2, "0")}`;

  const A: NormScene = { ...scene, end: midStr };
  const B: NormScene = { ...scene, start: midStr };
  return [A, B];
}

/** Coerce loose scenes to strict-ish shape, then clamp count to 6–8 */
function normalizeScenes(loose: any): NormScene[] | null {
  const arr = Array.isArray(loose?.scenes) ? loose.scenes : [];
  if (!arr.length) return null;

  let fixed: NormScene[] = arr.map((s: any, i: number): NormScene => {
    const start = normalizeTime(String(s.start ?? ""), "00:00");
    const end = normalizeTime(String(s.end ?? ""), "00:08");
    // Scrub fields
    const text = clampWords(clampChars(String(s.text ?? "").replace(/[\"“”]/g, ""), 32), 8);
    const visual = clampChars(String(s.visual ?? ""), 240);
    const vo = clampChars(String(s.vo ?? ""), 240);
    const imagePrompt = clampChars(
      String(s.imagePrompt ?? s.visual ?? "").replace(/[\"“”]/g, ""),
      240
    );
    return {
      index: Number(s.index ?? i + 1),
      start,
      end,
      visual,
      text,
      vo,
      imagePrompt
    };
  });

  // If fewer than 6, split longest scenes until we reach 6
  while (fixed.length < 6 && fixed.length > 0) {
    let idx = 0;
    let best = -1;
    fixed.forEach((sc: NormScene, i: number) => {
      const sp = span(sc);
      if (sp > best) { best = sp; idx = i; }
    });
    const [A, B] = splitScene(fixed[idx]);
    fixed.splice(idx, 1, A, B);
  }

  // If more than 8, slice
  if (fixed.length > 8) fixed = fixed.slice(0, 8);

  // Reindex
  fixed = fixed.map((s, i) => ({ ...s, index: i + 1 }));

  return fixed;
}

async function callScenes(script: string, style?: string, forceJson = false): Promise<string> {
  const userContent =
    `Make concise, cinematic scenes from this script.` +
    (style ? ` Style: ${style}` : "") +
    `\n\nSCRIPT:\n${script}`;

  const body: any = {
    model: TEXT_MODEL,
    messages: [
      { role: "system", content: SCENE_SYSTEM },
      { role: "user", content: userContent }
    ],
    temperature: 0.3
  };
  if (forceJson) body.response_format = { type: "json_object" };

  const res = await fetch(`${OR_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OR_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": APP_URL,
      "X-Title": APP_NAME
    },
    body: JSON.stringify(body)
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
  if (!script) return NextResponse.json({ ok: false, error: "script required" }, { status: 400 });

  try {
    // Pass 1: ask for JSON mode
    let raw = await callScenes(script, style, true);
    let obj = tidyJson(raw);

    // Parse with loose schema first
    let looseParsed = obj ? SceneSetLooseSchema.safeParse(obj) : null;

    // Pass 2: fallback without response_format
    if (!looseParsed?.success) {
      raw = await callScenes(script, style, false);
      obj = tidyJson(raw);
      looseParsed = obj ? SceneSetLooseSchema.safeParse(obj) : null;
    }
    if (!looseParsed?.success) throw new Error("Invalid scenes JSON");

    const normalized = normalizeScenes(looseParsed.data);
    if (!normalized) throw new Error("Invalid scenes JSON");

    // Final strict gate
    const strict = SceneSetSchema.safeParse({ scenes: normalized });
    if (!strict.success) throw new Error("Invalid scenes JSON");

    return NextResponse.json({ ok: true, scenes: strict.data.scenes });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Invalid scenes JSON" }, { status: 500 });
  }
}
