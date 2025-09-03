'use client';
import { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ImagesPage() {
  const router = useRouter();
  const [scenes, setScenes] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<string>("");

  useEffect(() => {
    const s = sessionStorage.getItem("esg-scenes");
    if (!s) {
      router.replace("/scenes");
      return; // return void
    }
    try {
      setScenes(JSON.parse(s));
    } catch {
      router.replace("/scenes");
      return;
    }
  }, [router]);

  async function genAll() {
    setLoading("Rendering all…");
    const r = await fetch("/api/generate-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes })
    });
    const j = await r.json();
    setLoading("");
    if (!j.ok) return alert(j.error || "Images failed");
    setImages(j.images || []);
  }

  useEffect(() => {
    if (scenes.length) genAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenes.length]);

  async function regenOne(idx: number, tweak: string) {
    const only = [{ ...scenes[idx], imagePrompt: (tweak || scenes[idx].imagePrompt) }];
    const r = await fetch("/api/generate-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenes: only })
    });
    const j = await r.json();
    if (!j.ok) return alert(j.error || "Regen failed");
    const copy = images.slice();
    copy[idx] = j.images?.[0];
    setImages(copy);
  }

  function exportZip() {
    alert("Export ZIP not implemented yet. Download images individually for now.");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Step 3 — Images</h1>
        <p className="text-sm text-muted-foreground">Render frames for each scene and optionally tweak prompts.</p>
      </div>

      {loading && <div className="text-sm text-muted-foreground">{loading}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {scenes.map((s, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-base">Scene {i + 1} ({s.start}–{s.end})</CardTitle>
              <CardDescription>{s.text}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ImageCard index={i} scene={s} src={images[i]} onRegenerate={regenOne} />
            </CardContent>
          </Card>
        ))}
      </div>

      {images.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={exportZip} variant="outline">Export ZIP</Button>
          <a href="/"><Button variant="secondary">Start Over</Button></a>
        </div>
      )}
    </div>
  );
}
