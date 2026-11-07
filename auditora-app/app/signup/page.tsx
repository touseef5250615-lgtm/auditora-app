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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' }}>
      <div style={{ backgroundColor: '#080808', padding: '50px 40px', border: '1px solid #333', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
        
        {/* Logo Section */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
          <img src="/logo.png" alt="AUDITORA" style={{ width: '250px', height: 'auto' }} />
        </div>

        {error && <p style={{ color: '#F87171', marginBottom: '15px', fontSize: '0.9rem', backgroundColor: 'rgba(248, 113, 113, 0.1)', padding: '10px', border: '1px solid #F87171' }}>{error}</p>}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '12px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#E2E8F0', color: '#333', outline: 'none', fontSize: '1rem' }} 
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '12px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#E2E8F0', color: '#333', outline: 'none', fontSize: '1rem' }} 
          />

          <button 
            type="submit" 
            style={{ background: 'linear-gradient(90deg, #EBC272, #D4A353)', color: '#080808', padding: '12px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginTop: '5px', transition: '0.3s' }}>
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: '15px' }}>
          <button 
            type="button" 
            style={{ width: '100%', backgroundColor: '#9CA3AF', color: '#080808', padding: '12px', borderRadius: '4px', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </div>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#A0A0A0' }}>
          Already have an account? <Link href="/login" style={{ color: '#EBC272', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        </p>

      </div>
    </div>
  );
}
