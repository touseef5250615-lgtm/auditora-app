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
  const [customers, setCustomers] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState("");
  const [taxId, setTaxId] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchInvoices(); fetchAccounts(); fetchCustomers(); fetchTaxes(); fetchProducts();
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

  const fetchTaxes = async () => {
    const { data } = await supabase.from("taxes").select("*").eq("company_id", selectedCompany);
    if (data) setTaxes(data);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").eq("company_id", selectedCompany);
    if (data) setProducts(data);
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }
    if (!customerId) { setMessage("Please select a customer."); return; }

    const selectedCustomer = customers.find(c => c.id === customerId);
    const customerName = selectedCustomer ? selectedCustomer.name : "Unknown";
    const selectedProduct = products.find(p => p.id === productId);

    // Tax Calculate
    const baseAmount = parseFloat(amount) || 0;
    let taxAmount = 0;
    if (taxId) {
      const selectedTax = taxes.find(t => t.id === taxId);
      if (selectedTax) taxAmount = (baseAmount * selectedTax.rate) / 100;
    }
    const totalAmount = baseAmount + taxAmount;

    const { error } = await supabase.from("invoices").insert([
      { company_id: selectedCompany, customer_name: customerName, amount: totalAmount, status: "Unpaid" }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      // Inventory Stock Update (Agar product select kiya hai)
      if (selectedProduct && selectedProduct.stock > 0) {
        await supabase.from("products").update({ stock: selectedProduct.stock - 1 }).eq("id", selectedProduct.id);
      }
      
      setMessage(`Invoice created successfully! (Tax: $${taxAmount.toFixed(2)})`);
      setCustomerId(""); setAmount(""); setTaxId(""); setProductId("");
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

  const downloadPDF = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFontSize(22); doc.setTextColor(201, 173, 114); doc.text("AUDITORA", 14, 20);
    doc.setFontSize(16); doc.setTextColor(0); doc.text("INVOICE", 14, 50);
    doc.setFontSize(10); doc.text(`Invoice ID: ${invoice.id.substring(0, 8)}`, 14, 60); doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 14, 66);
    doc.text(`Billed To:`, 14, 90); doc.setFontSize(12); doc.text(`${invoice.customer_name}`, 14, 98);
    autoTable(doc, { startY: 110, head: [['Description', 'Status', 'Amount']], body: [['Professional Services (Incl. Tax)', invoice.status, `$${invoice.amount.toFixed(2)}`]], theme: 'grid', headStyles: { fillColor: [201, 173, 114], textColor: [0, 0, 0] } });
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
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '150px' }}>
              <option value="">-- Select Customer --</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 2, minWidth: '150px' }}>
              <option value="">-- Select Product (Optional) --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
            </select>

            <input type="number" placeholder="Base Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <select value={taxId} onChange={(e) => setTaxId(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }}>
              <option value="">No Tax</option>
              {taxes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.rate}%)</option>)}
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
                    {inv.status === 'Unpaid' && (
                      <button onClick={() => markAsPaid(inv)} style={{ backgroundColor: '#4ADE80', color: '#080808', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Mark as Paid</button>
                    )}
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
