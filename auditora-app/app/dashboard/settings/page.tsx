"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SettingsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const comp = companies.find(c => c.id === selectedCompany);
      if (comp) {
        setName(comp.name);
        setCurrency(comp.currency);
        setFinancialYear(comp.financial_year);
      }
    }
  }, [selectedCompany, companies]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.from("companies").update({
      name: name,
      currency: currency,
      financial_year: financialYear
    }).eq("id", selectedCompany);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Company settings updated successfully!");
      fetchCompanies();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Settings</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%', marginBottom: '20px' }}>
          <option value="">-- Select a Company to Edit --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Company Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <input type="text" placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <input type="text" placeholder="Financial Year" value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '150px' }}>Update Settings</button>
          </form>
        )}
      </div>
    </div>
  );
}
