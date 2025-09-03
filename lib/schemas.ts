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

/** Loose schemas: accept whatever, then we coerce + trim later */
export const SceneLooseSchema = z.object({
  index: z.coerce.number().int().min(1).optional(),
  start: z.string().optional(),
  end: z.string().optional(),
  visual: z.string().optional(),
  text: z.string().optional(),
  vo: z.string().optional(),
  imagePrompt: z.string().optional()
});

export const SceneSetLooseSchema = z.object({
  scenes: z.array(SceneLooseSchema).min(3).max(12)
});

/** Small helpers shared by the route */
export function clampWords(s: string, maxWords = 8) {
  const words = s.trim().split(/\s+/);
  return words.slice(0, maxWords).join(" ");
}

export function clampChars(s: string, max = 240) {
  s = s.trim();
  return s.length > max ? s.slice(0, max) : s;
}
