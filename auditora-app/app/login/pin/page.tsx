"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PinLogin() {
  const [pin, setPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedPin = localStorage.getItem("auditora_pin");
    if (storedPin) setSavedPin(storedPin);
  }, []);

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
        <p style={{ color: '#A0A0A0', marginBottom: '30px', textAlign: 'center' }}>Enter your 4-digit PIN</p>
        
        {error && <p style={{ color: '#F87171', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}

        <form onSubmit={handlePinLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="password" 
            placeholder="****" 
            value={pin} 
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} 
            required 
            style={{ padding: '15px', borderRadius: '6px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', textAlign: 'center', fontSize: '2rem', letterSpacing: '10px' }} 
          />
          <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '12px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Unlock App</button>
        </form>
        
        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#A0A0A0' }}>
          <Link href="/login" style={{ color: '#C9AD72', textDecoration: 'none' }}>Login with Password instead</Link>
        </p>
      </div>
    </div>
  );
}
