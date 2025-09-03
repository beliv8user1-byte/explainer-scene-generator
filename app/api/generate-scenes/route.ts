import { NextRequest, NextResponse } from "next/server";
import { openrouter, OPENROUTER_TEXT_MODEL } from "@/lib/openrouter";
import { SCENE_SYSTEM } from "@/lib/prompts";
import { SceneSetSchema } from "@/lib/schemas";
import { jsonrepair } from "jsonrepair";

// --- helpers ----------------------------------------------------
function stripCodeFences(s: string) {
  // remove ```json ... ``` or ``` ... ```
  return s.replace(/```[a-z]*\n?([\s\S]*?)```/gi, (_m, p1) => p1 || "");
}

function extractJson(s: string) {
  // best-effort: grab the largest {...} block
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end > start) return s.slice(start, end + 1);
  return s;
}

function fixQuotes(s: string) {
  // convert curly quotes to straight quotes
  return s.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
}

function tidyJson(raw: string) {
  let t = raw.trim();
  t = stripCodeFences(t);
  t = fixQuotes(t);
  t = extractJson(t);
  try {
    // try straight parse
    return JSON.parse(t);
  } catch {
    // try repair then parse
    try {
      const repaired = jsonrepair(t);
      return JSON.parse(repaired);
    } catch {
      return null;
    }
  }
}

function normalizeTime(t: string) {
  // Accept "0–8s", "0-8s", "00:08", "0:8" → "00:08"
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
  if (secs) {
    return `00:${String(parseInt(secs[1], 10)).padStart(2, "0")}`;
  }
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

// --- call wrappers ----------------------------------------------
async function callScenes(script: string, style?: string, forceJson?: boolean) {
  const msgs = [
    { role: "system", content: SCENE_SYSTEM },
    { role: "user", content: `Make concise, cinematic scenes from this script.${style ? ` Style: ${style}` : ""}\n\nSCRIPT:\n${script}` }
  ];

  // Try with JSON response_format first (if the model supports it)
  if (forceJson) {
    try {
      const completion = await openrouter.chat.completions.create({
        model: OPENROUTER_TEXT_MODEL,
        messages: msgs,
        temperature: 0.3,
        response_format: { type: "json_object" } as any
      });
      return completion.choices?.[0]?.message?.content || "";
    } catch {
      // fall through to non-JSON mode
    }
  }

  const completion = await openrouter.chat.completions.create({
    model: OPENROUTER_TEXT_MODEL,
    messages: msgs,
    temperature: 0.3
  });
  return completion.choices?.[0]?.message?.content || "";
}

// --- route -------------------------------------------------------
export async function POST(req: NextRequest) {
  const { script, style } = await req.json();
  if (!script) return NextResponse.json({ error: "script required" }, { status: 400 });

  try {
    // Attempt 1: ask for JSON mode explicitly
    let raw = await callScenes(script, style, true);
    let obj = tidyJson(raw);
    let normalized = normalizeScenesShape(obj);

    // Attempt 2: repair pass (without response_format, often cleaner)
    if (!normalized) {
      raw = await callScenes(script, style, false);
      obj = tidyJson(raw);
      normalized = normalizeScenesShape(obj);
    }

    // Validate with Zod (final gate)
    if (!normalized) throw new Error("Could not parse scenes JSON");
    const parsed = SceneSetSchema.safeParse(normalized);
    if (!parsed.success) {
      // Try a soft normalization: slice to max 8, require at least 6
      const compact = { scenes: normalized.scenes.slice(0, 8) };
      const recheck = SceneSetSchema.safeParse(compact);
      if (!recheck.success) {
        throw new Error("Invalid scenes JSON");
      }
      return NextResponse.json({ ok: true, scenes: compact.scenes });
    }

    return NextResponse.json({ ok: true, scenes: parsed.data.scenes });
  } catch (e: any) {
    // Return raw to help the UI show a “Fix JSON” option if you want later
    return NextResponse.json({ ok: false, error: e.message || "Invalid scenes JSON" }, { status: 500 });
  }
}
