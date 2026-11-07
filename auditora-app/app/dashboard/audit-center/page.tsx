"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function AuditCenterPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
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
    setIsAuditing(true);
    setAuditResults([]);

    // Fetch all journal entries for this company
    const { data } = await supabase.from("journal_entries").select("*").eq("company_id", selectedCompany);
    
    if (data) {
      setEntries(data);
      let findings = [];

      // Rule 1: Check if any entry is missing an account
      const missingAccountEntries = data.filter(e => !e.account_id);
      if (missingAccountEntries.length > 0) {
        findings.push({
          id: "MISSING_ACC",
          severity: "High",
          message: `Found ${missingAccountEntries.length} transactions without an assigned Chart of Account.`,
          recommendation: "Please edit these entries and assign the correct accounts."
        });
      }

      // Rule 2: Check if Debit and Credit are balanced
      let totalDebit = data.reduce((sum, entry) => sum + Number(entry.debit_amount), 0);
      let totalCredit = data.reduce((sum, entry) => sum + Number(entry.credit_amount), 0);

      if (totalDebit !== totalCredit) {
        findings.push({
          id: "IMBALANCED",
          severity: "Critical",
          message: `Total Debit ($${totalDebit}) does not match Total Credit ($${totalCredit}).`,
          recommendation: "Check all journal entries for missing or incorrect amounts."
        });
      } else {
         findings.push({
          id: "BALANCED",
          severity: "Success",
          message: `Trial Balance is perfectly balanced. Total Debit = Total Credit ($${totalDebit}).`,
          recommendation: "No action needed."
        });
      }

      // Rule 3: Check for suspicious round numbers (e.g., 10000, 5000) as a fake AI feature
      const roundNumberEntries = data.filter(e => Number(e.debit_amount) > 0 && Number(e.debit_amount) % 1000 === 0);
      if (roundNumberEntries.length > 0) {
        findings.push({
          id: "ROUND_NUM",
          severity: "Medium",
          message: `Detected ${roundNumberEntries.length} transactions with exact round numbers (e.g. 1000, 5000).`,
          recommendation: "Verify these transactions to ensure they are not dummy entries."
        });
      }

      setAuditResults(findings);
    }
    setIsAuditing(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Audit Center</h2>
      
      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <p style={{ color: '#A0A0A0', marginBottom: '15px' }}>Select a company to scan its financial data for errors, missing accounts, and irregularities.</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1 }}>
            <option value="">-- Select a Company --</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={runAudit} disabled={!selectedCompany || isAuditing} style={{ backgroundColor: selectedCompany ? '#C9AD72' : '#333', color: selectedCompany ? '#080808' : '#888', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: selectedCompany ? 'pointer' : 'not-allowed' }}>
            {isAuditing ? "Scanning..." : "Run Audit"}
          </button>
        </div>
      </div>

      {auditResults.length > 0 && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Audit Findings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {auditResults.map((result, index) => (
              <div key={index} style={{ padding: '15px', borderRadius: '6px', borderLeft: `4px solid ${result.severity === 'Critical' ? '#F87171' : result.severity === 'High' ? '#F59E0B' : result.severity === 'Medium' ? '#3B82F6' : '#4ADE80'}`, backgroundColor: '#080808' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <strong style={{ color: result.severity === 'Critical' ? '#F87171' : result.severity === 'High' ? '#F59E0B' : result.severity === 'Medium' ? '#3B82F6' : '#4ADE80' }}>{result.severity} Risk</strong>
                  <span style={{ color: '#A0A0A0', fontSize: '0.8rem' }}>{result.id}</span>
                </div>
                <p style={{ marginBottom: '10px' }}>{result.message}</p>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem' }}><strong>Action:</strong> {result.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
