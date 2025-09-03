'use client';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "./ThemeToggle";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function TopBar() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  async function signIn() {
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for the login link/OTP.");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-14 flex items-center gap-3">
        <a href="/" className="flex items-center gap-3 hover:opacity-90">
          <div className="h-7 w-7 rounded bg-primary/15 flex items-center justify-center text-primary font-bold">ESG</div>
          <span className="font-semibold tracking-tight text-sm md:text-base">
            {process.env.NEXT_PUBLIC_APP_NAME || "Explainer Scene Generator"}
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-6 ml-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">Script</a>
          <a href="/scenes" className="hover:text-foreground">Scenes</a>
          <a href="/images" className="hover:text-foreground">Images</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {userEmail ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">{userEmail}</span>
              <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-44 sm:w-56"
              />
              <Button size="sm" onClick={signIn} disabled={loading}>
                {loading ? "Sending…" : "Sign in"}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
