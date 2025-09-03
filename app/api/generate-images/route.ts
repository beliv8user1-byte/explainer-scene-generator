import { NextResponse } from "next/server";
import { z } from "zod";
import { FramesSchema } from "@/lib/schemas";
import { getOpenRouterClient } from "@/lib/openrouter";

const BodySchema = z.object({
  scenes: z.array(
    z.object({ id: z.string(), caption: z.string(), prompt: z.string().optional() })
  ),
  model: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const { scenes, model } = BodySchema.parse(await request.json());

    // Placeholder implementation: if no OPENROUTER_API_KEY, return placeholder images.
    if (!process.env.OPENROUTER_API_KEY) {
      const frames = scenes.map((s, i) => ({
        id: s.id,
        url: `https://placehold.co/1024x576?text=Scene+${i + 1}`,
        alt: s.caption,
      }));
      return NextResponse.json({ frames });
    }

    // Example image generation sketch via OpenRouter (model must support image generation)
    // Many models expose different APIs; this is a best-effort placeholder using Chat Completions with image URLs.
    const client = getOpenRouterClient();
    const selectedModel = model ?? process.env.OPENROUTER_DEFAULT_IMAGE_MODEL ?? "google/gemini-2.0-flash-001";

    const frames: z.infer<typeof FramesSchema> = [];
    for (const [index, s] of scenes.entries()) {
      // NOTE: Replace with actual image-generation call once model details are confirmed.
      // Returning placeholder to keep flow unblocked.
      frames.push({
        id: s.id,
        url: `https://placehold.co/1024x576?text=Scene+${index + 1}`,
        alt: s.caption,
      });
    }

    return NextResponse.json({ frames, model: selectedModel });
  } catch (err: any) {
    const message = err?.message ?? "Failed to generate images";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

