"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AuditPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  const runAudit = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    setAuditResults([]);
    let results: any[] = [];

    // 1. Check Bookkeeping Entries (Debit != Credit)
    const { data: entries } = await supabase.from("journal_entries").select("*").eq("company_id", selectedCompany);
    if (entries) {
      entries.forEach(entry => {
        if (entry.debit_amount !== entry.credit_amount) {
          results.push({
            type: "Warning",
            message: `Transaction on ${entry.entry_date} has unequal Debit & Credit.`,
            details: `Desc: ${entry.description} | Debit: $${entry.debit_amount} | Credit: $${entry.credit_amount}`
          });
        }
      });
    }

    // 2. Check for Very High Expenses (e.g., > $10,000)
    const { data: expenses } = await supabase.from("expenses").select("*").eq("company_id", selectedCompany);
    if (expenses) {
      expenses.forEach(exp => {
        if (exp.amount > 10000) {
          results.push({
            type: "High Risk",
            message: `Unusually high expense detected on ${exp.expense_date}.`,
            details: `Title: ${exp.title} | Amount: $${exp.amount}`
          });
        }
      });
    }

    // 3. Check for Unpaid Invoices older than 30 days (Yahan hum seedha check kar rahe hain)
    const { data: invoices } = await supabase.from("invoices").select("*").eq("company_id", selectedCompany).eq("status", "Unpaid");
    if (invoices) {
      invoices.forEach(inv => {
        results.push({
          type: "Notice",
          message: `Unpaid Invoice found for customer: ${inv.customer_name}.`,
          details: `Amount: $${inv.amount} | Status: ${inv.status}`
        });
      });
    }

    if (results.length === 0) {
      results.push({
        type: "Success",
        message: "No issues found. Your records look clean!",
        details: "All transactions passed the basic audit checks."
      });
    }

    setAuditResults(results);
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Audit Center</h2>
      
      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%', marginBottom: '15px' }}>
          <option value="">-- Select a Company to Audit --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <button onClick={runAudit} disabled={loading} style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%' }}>
            {loading ? "Running Audit Checks..." : "Run Audit Check"}
          </button>
        )}
      </div>

      {auditResults.length > 0 && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Audit Findings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditResults.map((res, index) => (
              <div key={index} style={{ padding: '15px', borderRadius: '4px', backgroundColor: '#080808', borderLeft: `4px solid ${res.type === 'Success' ? '#4ADE80' : res.type === 'Warning' ? '#FBBF24' : res.type === 'High Risk' ? '#F87171' : '#60A5FA'}` }}>
                <p style={{ fontWeight: 'bold', color: res.type === 'Success' ? '#4ADE80' : res.type === 'Warning' ? '#FBBF24' : res.type === 'High Risk' ? '#F87171' : '#60A5FA', marginBottom: '5px' }}>{res.type}</p>
                <p style={{ color: '#FFF', marginBottom: '5px' }}>{res.message}</p>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem' }}>{res.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
