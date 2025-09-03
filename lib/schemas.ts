import { z } from "zod";

export const SceneSchema = z.object({
  index: z.number().int().min(1),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  visual: z.string().min(5).max(240),
  text: z.string().min(1).max(32),
  vo: z.string().min(5).max(240),
  imagePrompt: z.string().min(5).max(240)
});

export const SceneSetSchema = z.object({
  scenes: z.array(SceneSchema).min(6).max(8)
});
