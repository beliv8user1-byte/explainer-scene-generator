'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TopBar() {
  const [email, setEmail] = useState('');
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
    else alert('Check your email for the login link/OTP.');
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="w-full sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto p-3 flex items-center gap-3">
        <div className="font-semibold">Explainer Scene Generator</div>
        <div className="ml-auto flex items-center gap-2">
          {userEmail ? (
            <>
              <span className="text-sm text-gray-600">{userEmail}</span>
              <button onClick={signOut} className="px-3 py-1 rounded border">
                Sign out
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-2 py-1 rounded border"
              />
              <button
                onClick={signIn}
                disabled={loading}
                className="px-3 py-1 rounded border"
              >
                {loading ? 'Sending…' : 'Sign in'}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
