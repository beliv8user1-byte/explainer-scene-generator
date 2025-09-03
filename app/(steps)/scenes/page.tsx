'use client';
import { useEffect, useState } from "react";
import ScenesTable from "@/components/ScenesTable";

export default function ScenesPage() {
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [loading, setLoading] = useState<string>("");

  useEffect(() => {
    const s = sessionStorage.getItem("esg-script");
    if (!s) return (window.location.href = "/");
    setScript(s);
  }, []);

  async function genScenes() {
    setLoading("Generating scenes…");
    const r = await fetch("/api/generate-scenes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ script })
    });
    const j = await r.json();
    setLoading("");
    if (!j.ok) return alert(j.error || "Scenes failed");
    setScenes(j.scenes || []);
  }

  function goImages() {
    if (!scenes.length) return alert("Generate scenes first.");
    sessionStorage.setItem("esg-scenes", JSON.stringify(scenes));
    window.location.href = "/images";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Step 2 — Scenes</h1>
      <div className="flex gap-2">
        <button onClick={genScenes} className="px-3 py-2 rounded border">Generate Scenes</button>
        {loading && <span className="text-sm text-gray-500">{loading}</span>}
      </div>

      {scenes.length > 0 && (
        <>
          <ScenesTable scenes={scenes} onChange={setScenes} />
          <button onClick={goImages} className="px-3 py-2 rounded border">Continue → Images</button>
        </>
      )}
    </div>
  );
}
