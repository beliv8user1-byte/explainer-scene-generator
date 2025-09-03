import { z } from "zod";

export const SceneSchema = z.object({
  id: z.string(),
  caption: z.string(),
  voiceover: z.string().optional(),
});

export const ScenesSchema = z.object({
  scenes: z.array(SceneSchema).min(1),
});

export const FrameSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string().optional(),
});

export const FramesSchema = z.array(FrameSchema);

export type Scene = z.infer<typeof SceneSchema>;
export type Scenes = z.infer<typeof ScenesSchema>;
export type Frame = z.infer<typeof FrameSchema>;
export type Frames = z.infer<typeof FramesSchema>;

