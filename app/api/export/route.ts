import { NextResponse } from "next/server";
import { z } from "zod";

// Minimal placeholder: returns a simple JSON instead of a real ZIP.
// Replace with JSZip or streaming zip when needed.
const BodySchema = z.object({
  frames: z.array(z.object({ id: z.string(), url: z.string().url(), alt: z.string().optional() })),
  script: z.string().optional(),
  scenes: z.any().optional(),
});

export async function POST(request: Request) {
  try {
    const { frames, script, scenes } = BodySchema.parse(await request.json());
    return NextResponse.json({
      status: "ok",
      message: "ZIP export not implemented in this stub.",
      summary: { frames: frames.length, hasScript: !!script, hasScenes: !!scenes },
    });
  } catch (err: any) {
    const message = err?.message ?? "Failed to export";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

