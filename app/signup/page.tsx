"use client";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      setError(authError.message);
      return;
    }

    if (authData?.user) {
      await supabase.from('profiles').insert([{ id: authData.user.id, full_name: email.split('@')[0], role: 'owner' }]);
    }

    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808', color: '#FFFFFF' }}>
      <div style={{ backgroundColor: '#111111', padding: '50px 40px', borderRadius: '16px', border: '1px solid #333', width: '100%', maxWidth: '450px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', textAlign: 'center' }}>
        
        {/* Logo Section */}
        <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/logo.png" alt="AUDITORA Logo" style={{ width: '200px', height: 'auto', marginBottom: '15px' }} />
          <p style={{ color: '#A0A0A0', fontSize: '0.8rem', letterSpacing: '2px' }}>Create your business account</p>
        </div>

        {error && <p style={{ color: '#F87171', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</p>}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', outline: 'none' }} />
          <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '15px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', outline: 'none' }} />
          <button type="submit" style={{ background: 'linear-gradient(90deg, #C9AD72, #B99A5C)', color: '#080808', padding: '15px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }}>Sign Up</button>
        </form>
        
        <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', color: '#A0A0A0' }}>
          Already have an account? <Link href="/login" style={{ color: '#C9AD72', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
