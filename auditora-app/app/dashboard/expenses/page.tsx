"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function ExpensesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [vendorId, setVendorId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchVendors();
      fetchAccounts();
      fetchExpenses();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchVendors = async () => {
    const { data } = await supabase.from("vendors").select("*").eq("company_id", selectedCompany);
    if (data) setVendors(data);
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from("chart_of_accounts").select("*").eq("company_id", selectedCompany);
    if (data) setAccounts(data);
  };

  const fetchExpenses = async () => {
    const { data } = await supabase.from("expenses").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setExpenses(data);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }
    if (!vendorId) { setMessage("Please select a vendor."); return; }

    const selectedVendor = vendors.find(v => v.id === vendorId);
    const vendorName = selectedVendor ? selectedVendor.name : "Unknown";

    // 1. Expense Record Karein
    const { error } = await supabase.from("expenses").insert([
      { company_id: selectedCompany, vendor_name: vendorName, description: description, amount: parseFloat(amount) || 0 }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
      return;
    }

    // 2. Automatic Journal Entry (Bookkeeping) banayein (Debit: Expense, Credit: Cash)
    const expenseAccount = accounts.find(a => a.account_type === "Expense");
    const cashAccount = accounts.find(a => a.account_name.toLowerCase().includes("cash"));

    if (expenseAccount && cashAccount) {
      const date = new Date().toISOString().split('T')[0];
      const debitEntry = { company_id: selectedCompany, entry_date: date, description: `Expense - ${description} (Dr)`, debit_amount: parseFloat(amount) || 0, credit_amount: 0, account_id: expenseAccount.id };
      const creditEntry = { company_id: selectedCompany, entry_date: date, description: `Expense - ${description} (Cr)`, debit_amount: 0, credit_amount: parseFloat(amount) || 0, account_id: cashAccount.id };
      await supabase.from("journal_entries").insert([debitEntry, creditEntry]);
    }

    setMessage("Expense recorded and Bookkeeping updated!");
    setVendorId(""); setDescription(""); setAmount("");
    fetchExpenses();
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Purchases & Expenses</h2>
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }}>
              <option value="">-- Select Vendor --</option>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>

            <input type="text" placeholder="Description (e.g. Office Rent)" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }} />
            <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Expense</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Expense History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Vendor</th><th style={{ padding: '10px' }}>Description</th><th style={{ padding: '10px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{exp.vendor_name}</td>
                  <td style={{ padding: '10px' }}>{exp.description}</td>
                  <td style={{ padding: '10px', color: '#F87171' }}>${exp.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
