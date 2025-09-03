import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenRouterClient } from "@/lib/openrouter";
import { SCENES_SYSTEM_PROMPT } from "@/lib/prompts";
import { ScenesSchema } from "@/lib/schemas";

const BodySchema = z.object({
  script: z.string().min(1, "script is required"),
  model: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { script, model } = BodySchema.parse(await request.json());
    const client = getOpenRouterClient();
    const selectedModel = model ?? process.env.OPENROUTER_DEFAULT_TEXT_MODEL ?? "anthropic/claude-3.5-sonnet";

    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: SCENES_SYSTEM_PROMPT },
        {
          role: "user",
          content:
            "Turn this 60s script into 6-10 concise scenes with ids, captions, and optional voiceover. Return ONLY JSON.\n\n" +
            script,
        },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices?.[0]?.message?.content ?? "{}";

    // Best-effort JSON parse + validate against schema
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Some models wrap JSON in backticks or extra text; attempt to extract JSON block
      const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    const scenes = ScenesSchema.parse(parsed);
    return NextResponse.json({ scenes, model: selectedModel });
  } catch (err: any) {
    const message = err?.message ?? "Failed to generate scenes";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

