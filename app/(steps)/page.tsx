"use client";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import Editor from "@/components/Editor";
import { useState } from "react";

export default function StepScriptPage() {
  const [context, setContext] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateScript = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setScript(data.script || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Step 1: Script" />
      <main className="mx-auto max-w-4xl p-4 space-y-4">
        <Editor
          label="Context / URL text"
          value={context}
          onChange={setContext}
          placeholder="Paste notes or scraped text here..."
        />
        <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={generateScript} disabled={loading}>
          {loading ? "Generating..." : "Generate 60s Script"}
        </button>
        {error && <p className="text-red-600">{error}</p>}
        <Editor label="Generated Script" value={script} onChange={setScript} placeholder="Script will appear here..." />
        <div className="pt-2">
          <Link className="text-blue-700 underline" href="/scenes">Next: Build Scenes →</Link>
        </div>
      </main>
    </div>
  );
}

