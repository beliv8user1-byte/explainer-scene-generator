'use client';
import { useState, useEffect } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

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
      <Label>{label}</Label>
      <Textarea
        value={val}
        onChange={(e) => { setVal(e.target.value); onChange(e.target.value); }}
        className="min-h-48"
      />
    </div>
  );
}
