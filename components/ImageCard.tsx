'use client';
import { useState } from "react";

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
    <div className="rounded border p-3 space-y-2">
      <div className="text-sm font-medium">
        Scene {index + 1} ({scene.start}–{scene.end})
      </div>
      {src ? (
        <img src={src} alt={`Scene ${index + 1}`} className="w-full aspect-video object-cover rounded" />
      ) : (
        <div className="w-full aspect-video bg-gray-100 rounded grid place-items-center text-gray-400">
          Rendering…
        </div>
      )}
      <div className="text-sm text-gray-600">Text: {scene.text}</div>
      <input
        className="w-full rounded border p-2"
        placeholder="Prompt tweak (optional)"
        value={tweak}
        onChange={(e) => setTweak(e.target.value)}
      />
      <div className="flex gap-2">
        <button onClick={() => onRegenerate(index, tweak)} className="px-3 py-2 rounded border">
          Regenerate
        </button>
        {src && (
          <a className="px-3 py-2 rounded border" download={`scene-${index + 1}.png`} href={src}>
            Download
          </a>
        )}
      </div>
    </div>
  );
}
