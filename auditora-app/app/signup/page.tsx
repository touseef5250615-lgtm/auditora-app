"use client";
import { useState } from "react";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. User Account Banayein
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    // 2. Agar Account Ban Gaya, To Profile Table Mein Save Karein
    if (authData?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { 
            id: authData.user.id, 
            full_name: email.split('@')[0], // Email ke pehle hisse ko naam bana liya
            role: 'owner' 
          }
        ]);

      if (profileError) {
        console.log("Profile save error:", profileError);
      }
    }

    router.push("/dashboard");
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808', color: '#FFFFFF' }}>
      <div style={{ backgroundColor: '#151515', padding: '40px', borderRadius: '8px', border: '1px solid #333', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#C9AD72', marginBottom: '10px', textAlign: 'center' }}>AUDITORA</h1>
        <p style={{ color: '#A0A0A0', marginBottom: '30px', textAlign: 'center' }}>Create a new account</p>
        
        {error && <p style={{ color: '#F87171', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
          <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Sign Up</button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#A0A0A0' }}>
          Already have an account? <Link href="/login" style={{ color: '#C9AD72', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
