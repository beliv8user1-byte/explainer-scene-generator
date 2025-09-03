'use client';
import { useState } from "react";
import Editor from "@/components/Editor";

export default function Page() {
  const [businessName, setBusinessName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scraped, setScraped] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState<string>("");

  async function doScrape() {
    if (!websiteUrl) return alert("Enter a website URL");
    setLoading("Scraping website…");
    const r = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: websiteUrl })
    });
    const j = await r.json();
    setLoading("");
    if (!j.ok) return alert(j.error || "Scrape failed");
    setScraped(j.data);
  }

  async function genScript() {
    setLoading("Generating script…");
    const r = await fetch("/api/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, websiteUrl, notes, scraped })
    });
    const j = await r.json();
    setLoading("");
    if (!j.ok) return alert(j.error || "Script failed");
    setScript(j.script);
  }

  function goScenes() {
    if (!script) return alert("Generate a script first.");
    sessionStorage.setItem("esg-script", script);
    sessionStorage.setItem("esg-ctx", JSON.stringify({ businessName, websiteUrl, scraped }));
    window.location.href = "/scenes";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Step 1 — Script</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm">Business Name</label>
          <input className="w-full rounded border p-2"
                 value={businessName}
                 onChange={(e)=>setBusinessName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Website URL</label>
          <input className="w-full rounded border p-2"
                 placeholder="https://example.com"
                 value={websiteUrl}
                 onChange={(e)=>setWebsiteUrl(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={doScrape} className="px-3 py-2 rounded border">Scrape site</button>
        {loading && <span className="text-sm text-gray-500">{loading}</span>}
      </div>

      {scraped && (
        <div className="rounded border p-3 space-y-2">
          <div className="text-sm font-medium">Scrape Preview</div>
          <div className="text-sm text-gray-600">Title: {scraped.title}</div>
          <Editor label="About (editable)" initial={scraped.about || scraped.desc || ""} onChange={(v)=>{
            setScraped({...scraped, about: v});
          }} />
        </div>
      )}

      <Editor label="Regeneration notes (optional)" initial={notes} onChange={setNotes} />

      <div className="flex gap-2">
        <button onClick={genScript} className="px-3 py-2 rounded border">Generate Script</button>
      </div>

      {script && (
        <div className="rounded border p-3 space-y-3">
          <div className="text-sm font-medium">Script</div>
          <Editor label="Script (editable)" initial={script} onChange={setScript} />
          <div className="flex gap-2">
            <button onClick={goScenes} className="px-3 py-2 rounded border">Continue → Scenes</button>
          </div>
        </div>
      )}
    </div>
  );
}
