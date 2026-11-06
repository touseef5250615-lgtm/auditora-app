"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. User ki companies nikalain
    const { data: companies } = await supabase.from("companies").select("id").eq("user_id", user.id);
    if (!companies || companies.length === 0) return;

    const companyIds = companies.map(c => c.id);

    // 2. Bookkeeping Transactions (Journal Entries)
    const { data: entries } = await supabase.from("journal_entries").select("debit_amount, credit_amount").in("company_id", companyIds);
    
    let totalDebit = 0;
    let totalCredit = 0;
    if (entries) {
      entries.forEach(entry => {
        totalDebit += Number(entry.debit_amount) || 0;
        totalCredit += Number(entry.credit_amount) || 0;
      });
    }

    // 3. Invoices (Sirf "Paid" wale)
    const { data: invoices } = await supabase.from("invoices").select("amount").in("company_id", companyIds).eq("status", "Paid");
    
    let invoiceRevenue = 0;
    if (invoices) {
      invoices.forEach(inv => {
        invoiceRevenue += Number(inv.amount) || 0;
      });
    }

    // 4. Total Calculation
    const finalRevenue = totalCredit + invoiceRevenue;
    const finalExpenses = totalDebit;
    const finalProfit = finalRevenue - finalExpenses;

    setStats({
      revenue: finalRevenue,
      expenses: finalExpenses,
      profit: finalProfit
    });
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Total Revenue</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#C9AD72' }}>${stats.revenue.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Total Expenses</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FFFFFF' }}>${stats.expenses.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Net Profit</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ADE80' }}>${stats.profit.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Cash Balance</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FFFFFF' }}>${stats.profit.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#A0A0A0' }}>Revenue vs Expenses Chart (Coming Soon)</p>
      </div>
    </div>
  );
}
