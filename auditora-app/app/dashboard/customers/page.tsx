"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function CustomersPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { if (selectedCompany) fetchCustomers(); }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setCustomers(data);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!selectedCompany) { setMessage("Please select a company first."); return; }

    const { error } = await supabase.from("customers").insert([{ company_id: selectedCompany, name, email, phone }]);
    if (error) { setMessage("Error: " + error.message); } 
    else { setMessage("Customer added successfully!"); setName(""); setEmail(""); setPhone(""); fetchCustomers(); }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Customers Management</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddCustomer} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Customer Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }} />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }} />
            <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Customer</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Customer List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(cust => (
                <tr key={cust.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{cust.name}</td>
                  <td style={{ padding: '10px', color: '#A0A0A0' }}>{cust.email || "-"}</td>
                  <td style={{ padding: '10px', color: '#A0A0A0' }}>{cust.phone || "-"}</td>
                </tr>
              ))}
              {customers.length === 0 && <tr><td colSpan={3} style={{ padding: '10px', color: '#A0A0A0' }}>No customers added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
