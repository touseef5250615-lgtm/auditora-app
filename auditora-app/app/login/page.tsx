"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const storedPin = localStorage.getItem("auditora_pin");
    if (storedPin) setSavedPin(storedPin);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/dashboard");
  };

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === savedPin) {
      router.push("/dashboard");
    } else {
      setError("Invalid PIN. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808', color: '#FFFFFF' }}>
      <div style={{ backgroundColor: '#151515', padding: '40px', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9AD72', marginBottom: '10px', textAlign: 'center' }}>AUDITORA</h1>
        <p style={{ color: '#A0A0A0', marginBottom: '30px', textAlign: 'center' }}>Login to your account</p>
        
        {error && <p style={{ color: '#F87171', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

        {savedPin ? (
          <form onSubmit={handlePinLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ textAlign: 'center', marginBottom: '10px', color: '#A0A0A0' }}>Enter your 4-digit App PIN</p>
            <input 
              type="password" 
              placeholder="****" 
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
              required 
              style={{ padding: '15px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', textAlign: 'center', fontSize: '2rem', letterSpacing: '10px' }} 
            />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Unlock App</button>
            <button onClick={() => { localStorage.removeItem("auditora_pin"); setSavedPin(""); }} type="button" style={{ backgroundColor: 'transparent', color: '#F87171', border: 'none', marginTop: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>Forgot PIN? Login with Password</button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Login</button>
            <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#A0A0A0' }}>
              Don't have an account? <Link href="/signup" style={{ color: '#C9AD72', textDecoration: 'none' }}>Sign up</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
