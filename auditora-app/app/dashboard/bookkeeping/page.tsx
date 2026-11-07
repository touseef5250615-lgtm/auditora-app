"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function BookkeepingPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  
  // Form States (Date ko khali string se start karenge)
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  // Date ko load hone ke baad set karenge
  useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchAccounts();
      fetchEntries();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from("chart_of_accounts").select("*").eq("company_id", selectedCompany);
    if (data) setAccounts(data);
  };

  const fetchEntries = async () => {
    const { data } = await supabase.from("journal_entries").select("*").eq("company_id", selectedCompany).order('entry_date', { ascending: false });
    if (data) setEntries(data);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) {
      setMessage("Please select a company first.");
      return;
    }
    if (!debitAccount || !creditAccount) {
      setMessage("Please select both Debit and Credit accounts.");
      return;
    }
    if (debitAccount === creditAccount) {
      setMessage("Debit and Credit accounts cannot be the same.");
      return;
    }

    const debitEntry = {
      company_id: selectedCompany, 
      entry_date: date, 
      description: `${description} (Dr)`, 
      debit_amount: parseFloat(amount) || 0, 
      credit_amount: 0,
      account_id: debitAccount
    };

    const creditEntry = {
      company_id: selectedCompany, 
      entry_date: date, 
      description: `${description} (Cr)`, 
      debit_amount: 0, 
      credit_amount: parseFloat(amount) || 0,
      account_id: creditAccount
    };

    const { error } = await supabase.from("journal_entries").insert([debitEntry, creditEntry]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Transaction saved successfully!");
      setDescription(""); setAmount("");
      fetchEntries();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Bookkeeping - Journal Entries</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddEntry} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
              <input type="text" placeholder="Description (e.g. Cash Sale)" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }} />
              <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '120px' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1 }}>
                <option value="">-- Select Debit Account (Dr) --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.account_type})</option>)}
              </select>
              
              <select value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1 }}>
                <option value="">-- Select Credit Account (Cr) --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.account_name} ({acc.account_type})</option>)}
              </select>
            </div>
            
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px', alignSelf: 'flex-start' }}>Add Transaction</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Transaction History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Description</th>
                <th style={{ padding: '10px' }}>Debit</th>
                <th style={{ padding: '10px' }}>Credit</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{entry.entry_date}</td>
                  <td style={{ padding: '10px' }}>{entry.description}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>{entry.debit_amount > 0 ? `$${entry.debit_amount}` : '-'}</td>
                  <td style={{ padding: '10px', color: '#4ADE80' }}>{entry.credit_amount > 0 ? `$${entry.credit_amount}` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
