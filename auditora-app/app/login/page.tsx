"use client";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  const handlePasskeyLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithPasskey();
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  const handleFacebookLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808', color: '#FFFFFF' }}>
      <div style={{ backgroundColor: '#151515', padding: '40px', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9AD72', marginBottom: '10px', textAlign: 'center' }}>AUDITORA</h1>
        <p style={{ color: '#A0A0A0', marginBottom: '30px', textAlign: 'center' }}>Login to your account</p>
        
        {error && <p style={{ color: '#F87171', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
          <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Login</button>
        </form>

        <button onClick={handlePasskeyLogin} style={{ width: '100%', marginTop: '15px', backgroundColor: 'transparent', color: '#C9AD72', border: '1px solid #C9AD72', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Login with Face/Fingerprint</button>

        <button onClick={handleFacebookLogin} style={{ width: '100%', marginTop: '10px', backgroundColor: '#1877F2', color: '#FFF', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Login with Facebook</button>
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#A0A0A0' }}>
          Don't have an account? <Link href="/signup" style={{ color: '#C9AD72', textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
