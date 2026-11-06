"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ExpensesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [expenses, setExpenses] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(""); // Date khali rakhi
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]); // Load hone par date set
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchExpenses();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchExpenses = async () => {
    const { data } = await supabase.from("expenses").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setExpenses(data);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!selectedCompany) { setMessage("Please select a company first."); return; }

    const { error } = await supabase.from("expenses").insert([{ company_id: selectedCompany, title: title, amount: parseFloat(amount) || 0, expense_date: date }]);
    if (error) { setMessage("Error: " + error.message); } 
    else { setMessage("Expense saved successfully!"); setTitle(""); setAmount(""); fetchExpenses(); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Expenses Management</h2>
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}
      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedCompany && (
          <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <input type="text" placeholder="Expense Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }} />
            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Expense</button>
          </form>
        )}
      </div>
      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Expense History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead><tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}><th style={{ padding: '10px' }}>Date</th><th style={{ padding: '10px' }}>Title</th><th style={{ padding: '10px' }}>Amount</th></tr></thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{exp.expense_date}</td>
                  <td style={{ padding: '10px' }}>{exp.title}</td>
                  <td style={{ padding: '10px', color: '#F87171' }}>-${exp.amount}</td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={3} style={{ padding: '10px', color: '#A0A0A0' }}>No expenses added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
