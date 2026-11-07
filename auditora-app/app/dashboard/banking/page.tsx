"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function BankingPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [bankTransactions, setBankTransactions] = useState<any[]>([]);
  
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("Deposit"); // Deposit or Withdrawal
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchBankTransactions();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchBankTransactions = async () => {
    const { data } = await supabase.from("bank_transactions").select("*").eq("company_id", selectedCompany).order('date', { ascending: false });
    if (data) setBankTransactions(data);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }

    const { error } = await supabase.from("bank_transactions").insert([
      { 
        company_id: selectedCompany, 
        date: date, 
        description: description, 
        amount: parseFloat(amount) || 0,
        type: type,
        is_reconciled: false
      }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Bank transaction added successfully!");
      setDescription(""); setAmount("");
      fetchBankTransactions();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Banking & Reconciliation</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddTransaction} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <input type="text" placeholder="Description (e.g. Customer Payment)" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }} />
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }}>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
            </select>
            <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Transaction</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Bank Statement (Transactions)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Description</th>
                <th style={{ padding: '10px' }}>Type</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bankTransactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{tx.date}</td>
                  <td style={{ padding: '10px' }}>{tx.description}</td>
                  <td style={{ padding: '10px', color: tx.type === 'Deposit' ? '#4ADE80' : '#F87171' }}>{tx.type}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>${tx.amount}</td>
                  <td style={{ padding: '10px', color: tx.is_reconciled ? '#4ADE80' : '#F59E0B' }}>{tx.is_reconciled ? 'Reconciled' : 'Unreconciled'}</td>
                </tr>
              ))}
              {bankTransactions.length === 0 && <tr><td colSpan={5} style={{ padding: '10px', color: '#A0A0A0' }}>No bank transactions added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
