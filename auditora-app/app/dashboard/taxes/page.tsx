"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function TaxesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [taxes, setTaxes] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { if (selectedCompany) fetchTaxes(); }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchTaxes = async () => {
    const { data } = await supabase.from("taxes").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setTaxes(data);
  };

  const handleAddTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }

    const { error } = await supabase.from("taxes").insert([
      { company_id: selectedCompany, name: name, rate: parseFloat(rate) || 0 }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Tax rate added successfully!");
      setName(""); setRate("");
      fetchTaxes();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Tax Management</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddTax} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Tax Name (e.g. GST, VAT)" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }} />
            <input type="number" placeholder="Rate (%)" value={rate} onChange={(e) => setRate(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Tax</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Tax Rates</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Tax Name</th>
                <th style={{ padding: '10px' }}>Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map(tax => (
                <tr key={tax.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{tax.name}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>{tax.rate}%</td>
                </tr>
              ))}
              {taxes.length === 0 && <tr><td colSpan={2} style={{ padding: '10px', color: '#A0A0A0' }}>No tax rates added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
