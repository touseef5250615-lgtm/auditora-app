"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Company ki currency check karein
    const { data: companies } = await supabase.from("companies").select("id, currency").eq("user_id", user.id);
    if (!companies || companies.length === 0) return;

    const currencyMap: Record<string, string> = {
      USD: "$", PKR: "Rs. ", EUR: "€", GBP: "£", AED: "د.إ ", SAR: "ر.س ", INR: "₹", CAD: "C$", AUD: "A$"
    };
    setCurrencySymbol(currencyMap[companies[0].currency] || "$");

    const companyIds = companies.map(c => c.id);

    // 1. Bookkeeping (Journal Entries)
    const { data: entries } = await supabase.from("journal_entries").select("debit_amount, credit_amount").in("company_id", companyIds);
    let bkDebit = 0; let bkCredit = 0;
    if (entries) {
      entries.forEach(e => { bkDebit += Number(e.debit_amount) || 0; bkCredit += Number(e.credit_amount) || 0; });
    }

    // 2. Invoices (Sirf Paid)
    const { data: invoices } = await supabase.from("invoices").select("amount").in("company_id", companyIds).eq("status", "Paid");
    let invRevenue = 0;
    if (invoices) {
      invoices.forEach(i => { invRevenue += Number(i.amount) || 0; });
    }

    // 3. Expenses (Naya Module)
    const { data: expensesData } = await supabase.from("expenses").select("amount").in("company_id", companyIds);
    let expAmount = 0;
    if (expensesData) {
      expensesData.forEach(e => { expAmount += Number(e.amount) || 0; });
    }

    // Final Calculation
    const finalRevenue = bkCredit + invRevenue;
    const finalExpenses = bkDebit + expAmount;
    
    setStats({
      revenue: finalRevenue,
      expenses: finalExpenses,
      profit: finalRevenue - finalExpenses
    });
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Total Revenue</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#C9AD72' }}>{currencySymbol}{stats.revenue.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Total Expenses</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FFFFFF' }}>{currencySymbol}{stats.expenses.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Net Profit</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ADE80' }}>{currencySymbol}{stats.profit.toFixed(2)}</p>
        </div>
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '10px' }}>Cash Balance</p>
          <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#FFFFFF' }}>{currencySymbol}{stats.profit.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#A0A0A0' }}>Revenue vs Expenses Chart (Coming Soon)</p>
      </div>
    </div>
  );
}
