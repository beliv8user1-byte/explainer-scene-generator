'use client';
import { useState, useEffect } from "react";

export default function Editor({
  label,
  initial,
  onChange
}: {
  label: string;
  initial?: string;
  onChange: (v: string) => void;
}) {
  const [val, setVal] = useState(initial || "");

  useEffect(() => { setVal(initial || ""); }, [initial]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      <textarea
        value={val}
        onChange={(e) => { setVal(e.target.value); onChange(e.target.value); }}
        className="w-full h-48 rounded-xl border p-3"
      />
    </div>
  );
}
