"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InvoicingPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]); // Naya: Customers ki list
  
  const [customerId, setCustomerId] = useState(""); // Naya: Dropdown ke liye
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchInvoices();
      fetchAccounts();
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

  const fetchInvoices = async () => {
    const { data } = await supabase.from("invoices").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setInvoices(data);
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from("chart_of_accounts").select("*").eq("company_id", selectedCompany);
    if (data) setAccounts(data);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase.from("customers").select("*").eq("company_id", selectedCompany);
    if (data) setCustomers(data);
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }
    if (!customerId) { setMessage("Please select a customer."); return; }

    // Customer ka naam dhoondein
    const selectedCustomer = customers.find(c => c.id === customerId);
    const customerName = selectedCustomer ? selectedCustomer.name : "Unknown";

    const { error } = await supabase.from("invoices").insert([
      { 
        company_id: selectedCompany, 
        customer_name: customerName, 
        amount: parseFloat(amount) || 0, 
        status: "Unpaid" 
      }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Invoice created successfully!");
      setCustomerId(""); setAmount("");
      fetchInvoices();
    }
  };

  const markAsPaid = async (invoice: any) => {
    setMessage("");
    const { error } = await supabase.from("invoices").update({ status: "Paid" }).eq("id", invoice.id);
    if (error) { setMessage("Error: " + error.message); return; }

    const cashAccount = accounts.find(a => a.account_name.toLowerCase().includes("cash"));
    const salesAccount = accounts.find(a => a.account_type === "Income");

    if (cashAccount && salesAccount) {
      const date = new Date().toISOString().split('T')[0];
      const debitEntry = { company_id: selectedCompany, entry_date: date, description: `Invoice Paid - ${invoice.customer_name} (Dr)`, debit_amount: Number(invoice.amount), credit_amount: 0, account_id: cashAccount.id };
      const creditEntry = { company_id: selectedCompany, entry_date: date, description: `Invoice Paid - ${invoice.customer_name} (Cr)`, debit_amount: 0, credit_amount: Number(invoice.amount), account_id: salesAccount.id };
      await supabase.from("journal_entries").insert([debitEntry, creditEntry]);
    }
    setMessage("Invoice marked as Paid!"); fetchInvoices();
  };

  const markAsUnpaid = async (invoice: any) => {
    if(!confirm("Are you sure you want to mark this as Unpaid? This will remove the accounting entries.")) return;
    setMessage("");
    await supabase.from("invoices").update({ status: "Unpaid" }).eq("id", invoice.id);
    await supabase.from("journal_entries").delete().eq("company_id", selectedCompany).like("description", `%${invoice.customer_name}%`); 
    setMessage("Invoice reverted to Unpaid."); fetchInvoices();
  };

  const deleteInvoice = async (invoice: any) => {
    if(!confirm("Are you sure you want to delete this invoice permanently?")) return;
    setMessage("");
    await supabase.from("invoices").delete().eq("id", invoice.id);
    if (invoice.status === 'Paid') {
      await supabase.from("journal_entries").delete().eq("company_id", selectedCompany).like("description", `%${invoice.customer_name}%`); 
    }
    setMessage("Invoice deleted."); fetchInvoices();
  };

  const downloadPDF = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(201, 173, 114); doc.text("AUDITORA", 14, 20);
    doc.setFontSize(16); doc.setTextColor(0); doc.text("INVOICE", 14, 50);
    doc.setFontSize(10); doc.text(`Invoice ID: ${invoice.id.substring(0, 8)}`, 14, 60); doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 14, 66);
    doc.text(`Billed To:`, 14, 90); doc.setFontSize(12); doc.text(`${invoice.customer_name}`, 14, 98);
    autoTable(doc, { startY: 110, head: [['Description', 'Status', 'Amount']], body: [['Professional Services', invoice.status, `$${invoice.amount.toFixed(2)}`]], theme: 'grid', headStyles: { fillColor: [201, 173, 114], textColor: [0, 0, 0] } });
    doc.save(`Invoice_${invoice.customer_name}.pdf`);
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
            
            {/* Naya Dropdown Yahan Hai */}
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '200px' }}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input type="number" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
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
                <th style={{ padding: '10px' }}>Customer</th><th style={{ padding: '10px' }}>Amount</th><th style={{ padding: '10px' }}>Status</th><th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{inv.customer_name}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>${inv.amount}</td>
                  <td style={{ padding: '10px', color: inv.status === 'Paid' ? '#4ADE80' : '#F87171' }}>{inv.status}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => downloadPDF(inv)} style={{ backgroundColor: '#333', color: '#FFF', border: '1px solid #C9AD72', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>PDF</button>
                    {inv.status === 'Unpaid' ? (
                      <button onClick={() => markAsPaid(inv)} style={{ backgroundColor: '#4ADE80', color: '#080808', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Mark as Paid</button>
                    ) : (
                      <button onClick={() => markAsUnpaid(inv)} style={{ backgroundColor: '#F59E0B', color: '#080808', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Mark Unpaid</button>
                    )}
                    <button onClick={() => deleteInvoice(inv)} style={{ backgroundColor: '#F87171', color: '#080808', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
