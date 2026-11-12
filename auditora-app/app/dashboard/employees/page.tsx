"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function EmployeesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { if (selectedCompany) { fetchEmployees(); fetchAccounts(); } }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchEmployees = async () => {
    const { data } = await supabase.from("employees").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setEmployees(data);
  };

  const fetchAccounts = async () => {
    const { data } = await supabase.from("chart_of_accounts").select("*").eq("company_id", selectedCompany);
    if (data) setAccounts(data);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }

    const { error } = await supabase.from("employees").insert([
      { company_id: selectedCompany, name: name, email: email, salary: parseFloat(salary) || 0 }
    ]);

    if (error) setMessage("Error: " + error.message);
    else {
      setMessage("Employee added successfully!");
      setName(""); setEmail(""); setSalary("");
      fetchEmployees();
    }
  };

  const handlePaySalary = async (employee: any) => {
    if(!confirm(`Are you sure you want to pay salary to ${employee.name}? This will create an expense in Bookkeeping.`)) return;
    
    setMessage("");
    const expenseAccount = accounts.find(a => a.account_type === "Expense");
    const cashAccount = accounts.find(a => a.account_name.toLowerCase().includes("cash"));

    if (!expenseAccount || !cashAccount) {
      setMessage("Error: Please ensure you have at least one 'Expense' and one 'Cash' account in Chart of Accounts.");
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    
    const debitEntry = {
      company_id: selectedCompany, entry_date: date, description: `Salary Paid to ${employee.name} (Dr)`, debit_amount: Number(employee.salary), credit_amount: 0, account_id: expenseAccount.id
    };
    const creditEntry = {
      company_id: selectedCompany, entry_date: date, description: `Salary Paid to ${employee.name} (Cr)`, debit_amount: 0, credit_amount: Number(employee.salary), account_id: cashAccount.id
    };

    const { error } = await supabase.from("journal_entries").insert([debitEntry, creditEntry]);

    if (error) setMessage("Error: " + error.message);
    else setMessage(`Salary paid to ${employee.name} successfully! Bookkeeping updated.`);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Employees & Payroll</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddEmployee} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Employee Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }} />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }} />
            <input type="number" placeholder="Monthly Salary ($)" value={salary} onChange={(e) => setSalary(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '180px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Employee</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Employee List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Monthly Salary</th>
                <th style={{ padding: '10px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{emp.name}</td>
                  <td style={{ padding: '10px', color: '#A0A0A0' }}>{emp.email || '-'}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>${emp.salary}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handlePaySalary(emp)} style={{ backgroundColor: '#4ADE80', color: '#080808', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Pay Salary</button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && <tr><td colSpan={4} style={{ padding: '10px', color: '#A0A0A0' }}>No employees added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
