import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#080808', color: '#FFFFFF' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#C9AD72', marginBottom: '1rem', letterSpacing: '2px' }}>AUDITORA</h1>
      <p style={{ color: '#A0A0A0', marginBottom: '2.5rem', letterSpacing: '1px', fontSize: '1.2rem' }}>SMART ACCOUNTING. ACCURATE AUDITING.</p>
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link href="/login" style={{ backgroundColor: '#151515', color: '#C9AD72', border: '1px solid #C9AD72', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none' }}>
          Login
        </Link>
        <Link href="/signup" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none' }}>
          Sign Up
        </Link>
      </div>
    </div>
  );
}
