"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    document.documentElement.classList.toggle("dark", next);
  }
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm transition-colors bg-background hover:bg-accent hover:text-accent-foreground"
    >
      {dark ? (
        <span className="i-[solar:moon-stars-bold] h-4 w-4">🌙</span>
      ) : (
        <span className="i-[solar:sun-2-bold] h-4 w-4">☀️</span>
      )}
      <span className="hidden sm:inline">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}

