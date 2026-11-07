"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#080808', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      
      {/* TOP NAVIGATION BAR */}
      <header style={{ height: '60px', backgroundColor: '#151515', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: '#C9AD72', cursor: 'pointer', fontSize: '1.2rem' }}>☰</button>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#C9AD72', margin: 0, letterSpacing: '1px' }}>AUDITORA</h2>
          <input type="text" placeholder="Search transactions, contacts, reports..." style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '300px' }} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ cursor: 'pointer', color: '#A0A0A0' }}>🔔</span>
          <span style={{ cursor: 'pointer', color: '#A0A0A0' }}>⚙️</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.9rem', color: '#A0A0A0' }}>{email || "Loading..."}</div>
            <button onClick={handleLogout} style={{ backgroundColor: 'transparent', color: '#F87171', border: '1px solid #F87171', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR NAVIGATION */}
        {sidebarOpen && (
          <aside style={{ width: '260px', backgroundColor: '#151515', borderRight: '1px solid #333', padding: '20px 10px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '10px', marginBottom: '5px', paddingLeft: '10px' }}>PRACTICE MANAGEMENT</div>
              <Link href="/dashboard" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Dashboard</Link>
              <Link href="/dashboard/companies" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Companies / Clients</Link>
              
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', marginBottom: '5px', paddingLeft: '10px' }}>ACCOUNTING</div>
              <Link href="/dashboard/accounts" style={{ color: '#C9AD72', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Chart of Accounts</Link>
              <Link href="/dashboard/bookkeeping" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Bookkeeping</Link>
              <Link href="/dashboard/invoicing" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Sales & Invoicing</Link>
              <Link href="/dashboard/expenses" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Purchases & Expenses</Link>
              
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', marginBottom: '5px', paddingLeft: '10px' }}>CONTACTS</div>
              <Link href="/dashboard/customers" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Customers</Link>
              <Link href="/dashboard/vendors" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Vendors / Suppliers</Link>

              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', marginBottom: '5px', paddingLeft: '10px' }}>BANKING & MONEY</div>
              <Link href="/dashboard/banking" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Banking</Link>
              
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', marginBottom: '5px', paddingLeft: '10px' }}>PAYROLL & TAX</div>
              <Link href="/dashboard/payroll" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Employees & Payroll</Link>
              <Link href="/dashboard/taxes" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Tax Management</Link>
              
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', marginBottom: '5px', paddingLeft: '10px' }}>REPORTS & AUDIT</div>
              <Link href="/dashboard/reports" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Financial Statements</Link>
              <Link href="/dashboard/audit-center" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Audit Center</Link>
              
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '15px', marginBottom: '5px', paddingLeft: '10px' }}>SETTINGS</div>
              <Link href="/dashboard/settings" style={{ color: '#A0A0A0', textDecoration: 'none', padding: '8px 10px', borderRadius: '4px' }}>Settings</Link>
            </nav>
          </aside>
        )}

        {/* MAIN WORKSPACE */}
        <main style={{ flex: 1, padding: '30px', overflowY: 'auto', backgroundColor: '#080808' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
