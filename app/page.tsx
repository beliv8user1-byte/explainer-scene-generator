'use client';
import { useState } from "react";
import Editor from "@/components/Editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Step 1 — Script</h1>
        <p className="text-sm text-muted-foreground">Scrape a website and generate a tight 60s script.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Context</CardTitle>
          <CardDescription>Provide a URL to scrape and an optional business name.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={businessName} onChange={(e)=>setBusinessName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input placeholder="https://example.com" value={websiteUrl} onChange={(e)=>setWebsiteUrl(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Button onClick={doScrape}>Scrape site</Button>
            {loading && <span className="ml-3 text-sm text-muted-foreground">{loading}</span>}
          </div>
        </CardContent>
      </Card>

      {scraped && (
        <Card>
          <CardHeader>
            <CardTitle>Scrape Preview</CardTitle>
            <CardDescription className="truncate">Title: {scraped.title}</CardDescription>
          </CardHeader>
          <CardContent>
            <Editor label="About (editable)" initial={scraped.about || scraped.desc || ""} onChange={(v)=>{
              setScraped({...scraped, about: v});
            }} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Regeneration Notes</CardTitle>
          <CardDescription>Optional guidance to steer the script’s tone and focus.</CardDescription>
        </CardHeader>
        <CardContent>
          <Editor label="Notes" initial={notes} onChange={setNotes} />
          <div className="pt-4">
            <Button onClick={genScript}>Generate Script</Button>
            {loading && <span className="ml-3 text-sm text-muted-foreground">{loading}</span>}
          </div>
        </CardContent>
      </Card>

      {script && (
        <Card>
          <CardHeader>
            <CardTitle>Script</CardTitle>
            <CardDescription>Review and edit before moving to Scenes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Editor label="Script (editable)" initial={script} onChange={setScript} />
            <Button onClick={goScenes} variant="secondary">Continue → Scenes</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
