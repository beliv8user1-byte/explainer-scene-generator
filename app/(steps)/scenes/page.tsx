"use client";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Editor from "@/components/Editor";
import ScenesTable from "@/components/ScenesTable";
import { useState } from "react";

export default function StepScenesPage() {
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateScenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setScenes(data.scenes?.scenes || data.scenes || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Step 2: Scenes" />
      <main className="mx-auto max-w-5xl p-4 space-y-4">
        <Editor label="Script" value={script} onChange={setScript} placeholder="Paste the script from Step 1..." />
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={generateScenes} disabled={loading}>
          {loading ? "Generating..." : "Generate Scenes JSON"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        <ScenesTable scenes={scenes} />
        <div className="pt-2">
          <Link className="text-blue-700 underline" href="/images">Next: Generate Images →</Link>
        </div>
      </main>
    </div>
  );
}

