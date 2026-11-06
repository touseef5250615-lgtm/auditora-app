"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ReportsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const [currency, setCurrency] = useState("$");
  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchReportData();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchReportData = async () => {
    const company = companies.find(c => c.id === selectedCompany);
    if (company) {
      const currencyMap: Record<string, string> = {
        USD: "$", PKR: "Rs. ", EUR: "€", GBP: "£", AED: "د.إ ", SAR: "ر.س ", INR: "₹", CAD: "C$", AUD: "A$"
      };
      setCurrency(currencyMap[company.currency] || "$");
    }

    // 1. Bookkeeping Data
    const { data: entries } = await supabase.from("journal_entries").select("debit_amount, credit_amount").eq("company_id", selectedCompany);
    let bkDebit = 0; let bkCredit = 0;
    if (entries) {
      entries.forEach(e => { bkDebit += Number(e.debit_amount) || 0; bkCredit += Number(e.credit_amount) || 0; });
    }

    // 2. Invoices Data (Paid)
    const { data: invoices } = await supabase.from("invoices").select("amount").eq("company_id", selectedCompany).eq("status", "Paid");
    let invRevenue = 0;
    if (invoices) {
      invoices.forEach(i => { invRevenue += Number(i.amount) || 0; });
    }

    // 3. Expenses Data
    const { data: expensesData } = await supabase.from("expenses").select("amount").eq("company_id", selectedCompany);
    let expAmount = 0;
    if (expensesData) {
      expensesData.forEach(e => { expAmount += Number(e.amount) || 0; });
    }

    const totalRevenue = bkCredit + invRevenue;
    const totalExpenses = bkDebit + expAmount;
    const netProfit = totalRevenue - totalExpenses;

    setStats({ revenue: totalRevenue, expenses: totalExpenses, profit: netProfit });
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Financial Reports</h2>
      
      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%' }}>
          <option value="">-- Select a Company to view reports --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '30px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#FFF', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Profit & Loss Statement</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
            <span style={{ color: '#A0A0A0' }}>Total Revenue (Income)</span>
            <span style={{ color: '#4ADE80', fontWeight: 'bold' }}>{currency}{stats.revenue.toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '1.1rem' }}>
            <span style={{ color: '#A0A0A0' }}>Total Expenses (Cost)</span>
            <span style={{ color: '#F87171', fontWeight: 'bold' }}>-{currency}{stats.expenses.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed #333', fontSize: '1.3rem', fontWeight: 'bold' }}>
            <span>Net Profit / (Loss)</span>
            <span style={{ color: stats.profit >= 0 ? '#4ADE80' : '#F87171' }}>
              {currency}{stats.profit.toFixed(2)}
            </span>
          </div>

          <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#080808', borderRadius: '4px', border: '1px solid #333' }}>
            <p style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
              <strong>Note:</strong> This report is generated automatically based on your Paid Invoices, Bookkeeping Entries, and Expenses. 
              Please ensure all entries are accurate.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
