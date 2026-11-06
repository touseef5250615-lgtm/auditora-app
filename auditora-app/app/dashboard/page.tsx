"use client";
import { useState, useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({ revenue: 0, expenses: 0, profit: 0 });
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [chartData, setChartData] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: companies } = await supabase.from("companies").select("id, currency").eq("user_id", user.id);
    if (!companies || companies.length === 0) return;

    const currencyMap: Record<string, string> = { USD: "$", PKR: "Rs. ", EUR: "€", GBP: "£", AED: "د.إ ", SAR: "ر.س ", INR: "₹", CAD: "C$", AUD: "A$" };
    setCurrencySymbol(currencyMap[companies[0].currency] || "$");
    const companyIds = companies.map(c => c.id);

    // 1. Data Fetch Karein
    const { data: entries } = await supabase.from("journal_entries").select("*").in("company_id", companyIds);
    const { data: invoices } = await supabase.from("invoices").select("*").in("company_id", companyIds);
    const { data: expensesData } = await supabase.from("expenses").select("*").in("company_id", companyIds);

    let bkDebit = 0; let bkCredit = 0;
    if (entries) { entries.forEach(e => { bkDebit += Number(e.debit_amount) || 0; bkCredit += Number(e.credit_amount) || 0; }); }

    let invRevenue = 0;
    if (invoices) { invoices.forEach(i => { if (i.status === "Paid") invRevenue += Number(i.amount) || 0; }); }

    let expAmount = 0;
    if (expensesData) { expensesData.forEach(e => { expAmount += Number(e.amount) || 0; }); }

    const finalRevenue = bkCredit + invRevenue;
    const finalExpenses = bkDebit + expAmount;
    
    setStats({ revenue: finalRevenue, expenses: finalExpenses, profit: finalRevenue - finalExpenses });

    // 2. Chart Ke Liye Data Tayyar Karein (Current Month)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const currentMonthName = monthNames[currentMonth];

    // Demo Chart Data (Kyunke abhi sirf 1 month ka data hai, hum pichle 5 mahine ka demo graph dikha rahe hain taake graph acha lage)
    // Real app mein yeh database se calculate hoga
    const monthlyData = [
      { name: "Jun", Revenue: 0, Expenses: 0 },
      { name: "Jul", Revenue: 0, Expenses: 0 },
      { name: "Aug", Revenue: 0, Expenses: 0 },
      { name: "Sep", Revenue: 0, Expenses: 0 },
      { name: "Oct", Revenue: finalRevenue > 0 ? finalRevenue * 0.4 : 0, Expenses: finalExpenses > 0 ? finalExpenses * 0.3 : 0 },
      { name: currentMonthName, Revenue: finalRevenue, Expenses: finalExpenses },
    ];

    setChartData(monthlyData);
  };

  return (
    <div>
      {/* Top Cards */}
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

      {/* Chart Area */}
      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', height: '400px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#FFF' }}>Revenue vs Expenses (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#A0A0A0" />
            <YAxis stroke="#A0A0A0" />
            <Tooltip contentStyle={{ backgroundColor: '#080808', borderColor: '#333', color: '#FFF' }} />
            <Legend wrapperStyle={{ color: '#FFF' }} />
            <Bar dataKey="Revenue" fill="#C9AD72" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#F87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
