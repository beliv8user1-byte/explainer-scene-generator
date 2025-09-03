'use client';
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function ImageCard({
  index,
  scene,
  src,
  onRegenerate
}: {
  index: number;
  scene: any;
  src?: string;
  onRegenerate: (index: number, tweak: string) => void;
}) {
  const [tweak, setTweak] = useState("");

  return (
    <div className="space-y-3">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`Scene ${index + 1}`} className="w-full aspect-video object-cover rounded-md border" />
      ) : (
        <div className="w-full aspect-video rounded-md border grid place-items-center text-muted-foreground">
          Rendering…
        </div>
      )}
      <div className="text-sm text-muted-foreground">Text: {scene.text}</div>
      <Input
        placeholder="Prompt tweak (optional)"
        value={tweak}
        onChange={(e) => setTweak(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => onRegenerate(index, tweak)}>Regenerate</Button>
        {src && (
          <a download={`scene-${index + 1}.png`} href={src}>
            <Button variant="outline">Download</Button>
          </a>
        )}
      </div>
    </div>
  );
}
