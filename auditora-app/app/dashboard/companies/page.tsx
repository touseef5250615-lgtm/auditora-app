"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "INR", name: "Indian Rupee" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "QAR", name: "Qatari Riyal" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "OMR", name: "Omani Rial" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "SGD", name: "Singapore Dollar" }
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [financialYear, setFinancialYear] = useState("2024");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("companies").insert([
      { 
        user_id: user.id, 
        name: name, 
        currency: currency, 
        financial_year: financialYear 
      }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Company added successfully!");
      setName("");
      fetchCompanies();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>My Companies</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Add New Company</h3>
        <form onSubmit={handleAddCompany} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          
          <input type="text" placeholder="Company Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '200px' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', width: '200px' }}>
            <input 
              type="text" 
              placeholder="Search Currency (e.g. PKR)" 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value.toUpperCase())} 
              list="currency-list"
              required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF' }} 
            />
            <datalist id="currency-list">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </datalist>
          </div>

          <input type="text" placeholder="Financial Year" value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
          
          <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Company</button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {companies.map((company) => (
          <div key={company.id} style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#C9AD72', marginBottom: '10px' }}>{company.name}</h3>
            <p style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>Currency: {company.currency}</p>
            <p style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>Financial Year: {company.financial_year}</p>
          </div>
        ))}
        {companies.length === 0 && <p style={{ color: '#A0A0A0' }}>No companies added yet.</p>}
      </div>
    </div>
  );
}
