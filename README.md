# Explainer Scene Generator

60-second explainer **Script → Scenes → Images**. Text + images via **OpenRouter** (free models). Minimal email sign-in via **Supabase**. Deployable on **Netlify**.

## Stack
- Next.js (App Router), Tailwind
- OpenRouter: `openai/gpt-oss-120b:free` (text), `google/gemini-2.5-flash-image-preview:free` (images)
- Supabase Auth (email OTP)
- Netlify hosting

## Quick start
1. `cp .env.example .env.local` and fill values
2. `npm i`
3. `npm run dev`
4. Visit `/` → enter Business + Website → **Scrape** → **Generate Script** → **Scenes** → **Images**

## Deploy (Netlify)
- Add env vars from `.env.local` to Netlify site → Environment.
- `netlify.toml` pins Node `20.18.1` and installs Next plugin.
- Click **Clear cache and deploy** after changes.

## Notes
- LinkedIn scraping disabled by default.
- Scenes JSON is validated with Zod and auto-retried if invalid.
- Images return as **data URLs** you can download immediately.

---
MIT
