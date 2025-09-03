'use client';
import { useEffect, useState } from "react";
import ScenesTable from "@/components/ScenesTable";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ScenesPage() {
  const router = useRouter();
  const [script, setScript] = useState("");
  const [scenes, setScenes] = useState<any[]>([]);
  const [loading, setLoading] = useState<string>("");

  useEffect(() => {
    const s = sessionStorage.getItem("esg-script");
    if (!s) {
      router.replace("/");
      return; // return void
    }
    setScript(s);
  }, [router]);

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
    router.push("/images");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Step 2 — Scenes</h1>
        <p className="text-sm text-muted-foreground">Convert the script into tight, visual scenes and edit as needed.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Generate Scenes</CardTitle>
          <CardDescription>We’ll produce 6–8 concise scenes with prompts for images.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button onClick={genScenes}>Generate Scenes</Button>
          {loading && <span className="text-sm text-muted-foreground">{loading}</span>}
        </CardContent>
      </Card>

      {scenes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scenes</CardTitle>
            <CardDescription>Edit timings, text, and prompts before rendering images.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScenesTable scenes={scenes} onChange={setScenes} />
            <Button onClick={goImages} variant="secondary">Continue → Images</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
