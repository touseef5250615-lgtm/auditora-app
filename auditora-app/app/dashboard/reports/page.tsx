"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportsPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [reportType, setReportType] = useState("trial");
  const supabase = createClient();

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchAccounts();
      fetchEntries();
    }
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from("chart_of_accounts").select("*").eq("company_id", selectedCompany);
    if (data) setAccounts(data);
  };

  const fetchEntries = async () => {
    const { data } = await supabase.from("journal_entries").select("*").eq("company_id", selectedCompany);
    if (data) setEntries(data);
  };

  const getAccountBalance = (accountId: string) => {
    let totalDebit = 0;
    let totalCredit = 0;
    entries.forEach(entry => {
      if (entry.account_id === accountId) {
        totalDebit += Number(entry.debit_amount) || 0;
        totalCredit += Number(entry.credit_amount) || 0;
      }
    });
    return { totalDebit, totalCredit, balance: totalDebit - totalCredit };
  };

  let totalCompanyDebit = 0;
  let totalCompanyCredit = 0;
  let totalRevenue = 0;
  let totalExpense = 0;
  let totalAssets = 0;
  let totalLiabilities = 0;
  let totalEquity = 0;

  accounts.forEach(acc => {
    const { totalDebit, totalCredit } = getAccountBalance(acc.id);
    totalCompanyDebit += totalDebit;
    totalCompanyCredit += totalCredit;

    if (acc.account_type === 'Income') totalRevenue += (totalCredit - totalDebit);
    if (acc.account_type === 'Expense') totalExpense += (totalDebit - totalCredit);
    if (acc.account_type === 'Asset') totalAssets += (totalDebit - totalCredit);
    if (acc.account_type === 'Liability') totalLiabilities += (totalCredit - totalDebit);
    if (acc.account_type === 'Equity') totalEquity += (totalCredit - totalDebit);
  });

  const netProfit = totalRevenue - totalExpense;
  const finalEquity = totalEquity + netProfit;

  const downloadPDF = () => {
    const doc = new jsPDF();
    const companyName = companies.find(c => c.id === selectedCompany)?.name || "AUDITORA Company";

    doc.setFontSize(22); doc.setTextColor(201, 173, 114); doc.text("AUDITORA", 14, 20);
    doc.setFontSize(10); doc.setTextColor(100); doc.text("Smart Accounting. Accurate Auditing.", 14, 28);
    
    doc.setFontSize(16); doc.setTextColor(0);
    if (reportType === 'trial') doc.text("Trial Balance", 14, 45);
    if (reportType === 'pnl') doc.text("Profit & Loss Statement", 14, 45);
    if (reportType === 'balance') doc.text("Balance Sheet", 14, 45);

    doc.setFontSize(10);
    doc.text(`Company: ${companyName}`, 14, 55);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 61);

    if (reportType === 'trial') {
      const tableData = accounts.map(acc => {
        const { totalDebit, totalCredit } = getAccountBalance(acc.id);
        if (totalDebit === 0 && totalCredit === 0) return null;
        return [acc.account_name, acc.account_type, `$${totalDebit.toFixed(2)}`, `$${totalCredit.toFixed(2)}`];
      }).filter(Boolean);

      autoTable(doc, {
        startY: 70,
        head: [['Account Name', 'Type', 'Debit', 'Credit']],
        body: tableData as any,
        foot: [['Total', '', `$${totalCompanyDebit.toFixed(2)}`, `$${totalCompanyCredit.toFixed(2)}`]],
        theme: 'grid',
        headStyles: { fillColor: [201, 173, 114], textColor: [0, 0, 0] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
    } else if (reportType === 'pnl') {
      autoTable(doc, {
        startY: 70,
        head: [['Description', 'Amount']],
        body: [
          ['Total Revenue (Income)', `$${totalRevenue.toFixed(2)}`],
          ['Total Expenses', `-$${totalExpense.toFixed(2)}`],
        ],
        foot: [['Net Profit / (Loss)', `$${netProfit.toFixed(2)}`]],
        theme: 'grid',
        headStyles: { fillColor: [201, 173, 114], textColor: [0, 0, 0] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
    } else if (reportType === 'balance') {
      autoTable(doc, {
        startY: 70,
        head: [['Assets', 'Amount', 'Liabilities & Equity', 'Amount']],
        body: [
          ['Cash in Hand', `$${totalAssets.toFixed(2)}`, 'Total Liabilities', `$${totalLiabilities.toFixed(2)}`],
          ['', '', 'Net Profit (Current Year)', `$${netProfit.toFixed(2)}`],
        ],
        foot: [['Total Assets', `$${totalAssets.toFixed(2)}`, 'Total Liabilities & Equity', `$${(totalLiabilities + finalEquity).toFixed(2)}`]],
        theme: 'grid',
        headStyles: { fillColor: [201, 173, 114], textColor: [0, 0, 0] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
    }

    doc.save(`${reportType.toUpperCase()}_Report_${companyName}.pdf`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#C9AD72' }}>Financial Reports</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={() => setReportType("trial")} style={{ backgroundColor: reportType === 'trial' ? '#C9AD72' : '#333', color: reportType === 'trial' ? '#080808' : '#FFF', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Trial Balance</button>
          <button onClick={() => setReportType("pnl")} style={{ backgroundColor: reportType === 'pnl' ? '#C9AD72' : '#333', color: reportType === 'pnl' ? '#080808' : '#FFF', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Profit & Loss</button>
          <button onClick={() => setReportType("balance")} style={{ backgroundColor: reportType === 'balance' ? '#C9AD72' : '#333', color: reportType === 'balance' ? '#080808' : '#FFF', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Balance Sheet</button>
          
          <button onClick={downloadPDF} disabled={!selectedCompany} style={{ backgroundColor: selectedCompany ? '#4ADE80' : '#333', color: selectedCompany ? '#080808' : '#888', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: selectedCompany ? 'pointer' : 'not-allowed', fontWeight: 'bold', marginLeft: '10px' }}>
            Download PDF
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {selectedCompany && reportType === 'trial' && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#C9AD72' }}>Trial Balance</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Account Name</th><th style={{ padding: '10px' }}>Type</th><th style={{ padding: '10px' }}>Debit</th><th style={{ padding: '10px' }}>Credit</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(acc => {
                const { totalDebit, totalCredit } = getAccountBalance(acc.id);
                if (totalDebit === 0 && totalCredit === 0) return null;
                return (
                  <tr key={acc.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '10px' }}>{acc.account_name}</td>
                    <td style={{ padding: '10px', color: '#A0A0A0' }}>{acc.account_type}</td>
                    <td style={{ padding: '10px', color: '#C9AD72' }}>${totalDebit.toFixed(2)}</td>
                    <td style={{ padding: '10px', color: '#4ADE80' }}>${totalCredit.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot style={{ borderTop: '2px solid #333', fontWeight: 'bold' }}>
              <tr>
                <td colSpan={2} style={{ padding: '10px', textAlign: 'right' }}>Total:</td>
                <td style={{ padding: '10px', color: '#C9AD72' }}>${totalCompanyDebit.toFixed(2)}</td>
                <td style={{ padding: '10px', color: '#4ADE80' }}>${totalCompanyCredit.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {selectedCompany && reportType === 'pnl' && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#C9AD72' }}>Profit & Loss Statement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #333' }}>
              <span>Total Revenue (Income)</span><span style={{ color: '#4ADE80' }}>${totalRevenue.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #333' }}>
              <span>Total Expenses</span><span style={{ color: '#F87171' }}>-${totalExpense.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Net Profit / (Loss)</span><span style={{ color: netProfit >= 0 ? '#4ADE80' : '#F87171' }}>${netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {selectedCompany && reportType === 'balance' && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#C9AD72' }}>Balance Sheet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>Assets</h4>
              {accounts.filter(a => a.account_type === 'Asset').map(acc => {
                const { balance } = getAccountBalance(acc.id);
                if (balance === 0) return null;
                return <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}><span>{acc.account_name}</span><span style={{ color: '#C9AD72' }}>${balance.toFixed(2)}</span></div>
              })}
              <div style={{ borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Assets</span><span style={{ color: '#C9AD72' }}>${totalAssets.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <h4 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px' }}>Liabilities & Equity</h4>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Liabilities:</div>
              {accounts.filter(a => a.account_type === 'Liability').map(acc => {
                const { balance } = getAccountBalance(acc.id);
                if (balance === 0) return null;
                return <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingLeft: '10px' }}><span>{acc.account_name}</span><span style={{ color: '#F87171' }}>${(balance * -1).toFixed(2)}</span></div>
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontWeight: 'bold' }}><span>Total Liabilities</span><span style={{ color: '#F87171' }}>${totalLiabilities.toFixed(2)}</span></div>
              
              <div style={{ fontWeight: 'bold', marginTop: '15px', marginBottom: '5px' }}>Equity:</div>
              {accounts.filter(a => a.account_type === 'Equity').map(acc => {
                const { balance } = getAccountBalance(acc.id);
                if (balance === 0) return null;
                return <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingLeft: '10px' }}><span>{acc.account_name}</span><span style={{ color: '#4ADE80' }}>${(balance * -1).toFixed(2)}</span></div>
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingLeft: '10px' }}><span>Net Profit (Current Year)</span><span style={{ color: '#4ADE80' }}>${netProfit.toFixed(2)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontWeight: 'bold' }}><span>Total Equity</span><span style={{ color: '#4ADE80' }}>${finalEquity.toFixed(2)}</span></div>

              <div style={{ borderTop: '2px solid #333', marginTop: '10px', paddingTop: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Liabilities & Equity</span><span style={{ color: '#4ADE80' }}>${(totalLiabilities + finalEquity).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
