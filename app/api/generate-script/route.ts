import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpenRouterClient } from "@/lib/openrouter";
import { SCRIPT_SYSTEM_PROMPT } from "@/lib/prompts";

const BodySchema = z.object({
  context: z.string().min(1, "context is required"),
  model: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { context, model } = BodySchema.parse(await request.json());

    const client = getOpenRouterClient();
    const selectedModel = model ?? process.env.OPENROUTER_DEFAULT_TEXT_MODEL ?? "anthropic/claude-3.5-sonnet";

    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: SCRIPT_SYSTEM_PROMPT },
        { role: "user", content: context },
      ],
      temperature: 0.7,
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ script: content, model: selectedModel });
  } catch (err: any) {
    const message = err?.message ?? "Failed to generate script";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

