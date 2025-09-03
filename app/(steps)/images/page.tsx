"use client";
import TopBar from "@/components/TopBar";
import ImageCard from "@/components/ImageCard";
import { useState } from "react";

export default function StepImagesPage() {
  const [scenes, setScenes] = useState<any[]>([]);
  const [frames, setFrames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setFrames(data.frames || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Step 3: Images" />
      <main className="mx-auto max-w-6xl p-4 space-y-4">
        <p className="text-sm text-gray-600">Paste scenes JSON from Step 2 (or wire up state sharing) and generate frames.</p>
        <textarea
          className="w-full border rounded p-2 h-40"
          placeholder='[{"id":"1","caption":"..."}]'
          onChange={(e) => {
            try { setScenes(JSON.parse(e.target.value || "[]")); setError(null); }
            catch { setError("Invalid JSON"); }
          }}
        />
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={generateImages} disabled={loading}>
          {loading ? "Generating..." : "Generate Frames"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {frames.map((f) => (
            <ImageCard key={f.id} src={f.url} alt={f.alt || f.id} caption={f.id} />
          ))}
        </div>
      </main>
    </div>
  );
}

