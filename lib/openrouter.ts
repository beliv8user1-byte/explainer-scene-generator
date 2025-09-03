import OpenAI from "openai";

export function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // Still return a client to keep call sites simple; calls will fail if invoked.
    console.warn("OPENROUTER_API_KEY is not set. Using placeholder client.");
  }
  return new OpenAI({
    apiKey: apiKey || "",
    baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Explainer Scene Generator",
    },
  });
}

