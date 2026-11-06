"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setEmail(user.email || "");
    };
    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#080808', color: '#FFFFFF' }}>
      <aside style={{ width: '250px', backgroundColor: '#151515', borderRight: '1px solid #333', padding: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9AD72', marginBottom: '30px' }}>AUDITORA</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <Link href="/dashboard" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/dashboard/companies" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Companies</Link>
          <Link href="/dashboard/bookkeeping" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Bookkeeping</Link>
          <Link href="/dashboard/invoicing" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Invoicing</Link>
          <Link href="/dashboard/expenses" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Expenses</Link>
          <Link href="/dashboard/reports" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Reports</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Financial Overview</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '0.9rem', color: '#A0A0A0' }}>{email || "Loading..."}</div>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#F87171', border: '1px solid #F87171', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
