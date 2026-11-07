"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AccountsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Form States
  const [name, setName] = useState("");
  const [type, setType] = useState("Asset");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) fetchAccounts();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from("chart_of_accounts").select("*").eq("company_id", selectedCompany).order('account_number', { ascending: true });
    if (data) setAccounts(data);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) {
      setMessage("Please select a company first.");
      return;
    }

    const { error } = await supabase.from("chart_of_accounts").insert([
      { 
        company_id: selectedCompany, 
        account_name: name, 
        account_type: type,
        account_number: number
      }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Account created successfully!");
      setName(""); setNumber("");
      fetchAccounts();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Chart of Accounts</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddAccount} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Account Number (e.g. 1001)" value={number} onChange={(e) => setNumber(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <input type="text" placeholder="Account Name (e.g. Cash, Sales)" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }} />
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }}>
              <option value="Asset">Asset</option>
              <option value="Liability">Liability</option>
              <option value="Equity">Equity</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Account</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Account List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>No.</th>
                <th style={{ padding: '10px' }}>Account Name</th>
                <th style={{ padding: '10px' }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => (
                <tr key={acc.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px', color: '#A0A0A0' }}>{acc.account_number || '-'}</td>
                  <td style={{ padding: '10px' }}>{acc.account_name}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>{acc.account_type}</td>
                </tr>
              ))}
              {accounts.length === 0 && <tr><td colSpan={3} style={{ padding: '10px', color: '#A0A0A0' }}>No accounts added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
