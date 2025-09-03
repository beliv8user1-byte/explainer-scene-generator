'use client';
import { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";

export default function ImagesPage() {
  const [scenes, setScenes] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<string>("");

  useEffect(() => {
    const s = sessionStorage.getItem("esg-scenes");
    if (!s) return (window.location.href = "/scenes");
    setScenes(JSON.parse(s));
  }, []);

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
    // minimal: let users right-click download each; export zip can be added later
    alert("Export ZIP not implemented yet. Download images individually for now.");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Step 3 — Images</h1>
      {loading && <div className="text-sm text-gray-500">{loading}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        {scenes.map((s, i) => (
          <ImageCard
            key={i}
            index={i}
            scene={s}
            src={images[i]}
            onRegenerate={regenOne}
          />
        ))}
      </div>

      {images.length > 0 && (
        <div className="flex gap-2">
          <button onClick={exportZip} className="px-3 py-2 rounded border">Export ZIP</button>
          <a href="/" className="px-3 py-2 rounded border">Start Over</a>
        </div>
      )}
    </div>
  );
}
