import OpenAI from "openai";

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
});

export const OPENROUTER_TEXT_MODEL =
  process.env.OPENROUTER_MODEL || "openai/gpt-oss-120b:free";

export const OPENROUTER_IMAGE_MODEL =
  "google/gemini-2.5-flash-image-preview:free";
