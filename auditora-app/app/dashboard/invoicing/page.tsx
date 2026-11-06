"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicingPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);
  
  useEffect(() => {
    if (selectedCompany) {
      fetchInvoices();
      fetchCustomers();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("*").eq("company_id", selectedCompany);
    if (data) setCustomers(data);
  };

  const fetchInvoices = async () => {
    const { data } = await supabase.from("invoices").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setInvoices(data);
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany || !selectedCustomer) {
      setMessage("Please select a company and a customer.");
      return;
    }

    // Customer ka naam dhoondein
    const customerData = customers.find(c => c.id === selectedCustomer);
    const customerName = customerData ? customerData.name : "Unknown";

    const { error } = await supabase.from("invoices").insert([
      { 
        company_id: selectedCompany, 
        customer_name: customerName, // Yahan customer ka naam save hoga
        amount: parseFloat(amount) || 0, 
        status: status 
      }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Invoice created successfully!");
      setAmount("");
      fetchInvoices();
    }
  };

  const downloadPDF = (invoice: any) => {
    const doc = new jsPDF();
    const companyName = companies.find(c => c.id === selectedCompany)?.name || "AUDITORA Company";
    doc.setFontSize(22); doc.setTextColor(201, 173, 114); doc.text("AUDITORA", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text("Smart Accounting. Accurate Auditing.", 14, 28);
    doc.setFontSize(16); doc.setTextColor(0); doc.text("INVOICE", 14, 50);
    doc.setFontSize(10); doc.text(`Invoice ID: ${invoice.id.substring(0, 8)}`, 14, 60);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 14, 66);
    doc.text(`Company: ${companyName}`, 14, 72);
    doc.text(`Billed To:`, 14, 90); doc.setFontSize(12); doc.text(`${invoice.customer_name}`, 14, 98);
    autoTable(doc, { startY: 110, head: [['Description', 'Status', 'Amount']], body: [['Professional Services', invoice.status, `$${invoice.amount.toFixed(2)}`]], theme: 'grid', headStyles: { fillColor: [201, 173, 114], textColor: [0, 0, 0] } });
    const finalY = (doc as any).lastAutoTable.finalY + 20; doc.setFontSize(10); doc.text("Thank you for your business!", 14, finalY);
    doc.save(`Invoice_${invoice.customer_name}_${invoice.id.substring(0, 4)}.pdf`);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Invoicing - Sales & Billing</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddInvoice} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {/* Customer Dropdown */}
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '120px' }}>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Create Invoice</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Invoice History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Invoice ID</th>
                <th style={{ padding: '10px' }}>Customer</th>
                <th style={{ padding: '10px' }}>Amount</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px', color: '#A0A0A0' }}>{inv.id.substring(0, 8)}...</td>
                  <td style={{ padding: '10px' }}>{inv.customer_name}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>${inv.amount}</td>
                  <td style={{ padding: '10px', color: inv.status === 'Paid' ? '#4ADE80' : '#F87171' }}>{inv.status}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => downloadPDF(inv)} style={{ backgroundColor: '#333', color: '#FFF', border: '1px solid #C9AD72', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Download PDF</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={5} style={{ padding: '10px', color: '#A0A0A0' }}>No invoices created yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
