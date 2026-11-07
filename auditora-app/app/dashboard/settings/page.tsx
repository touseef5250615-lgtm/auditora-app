"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("auditora-theme") || "light";
    setTheme(savedTheme);
  }, []);

  const toggleTheme = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("auditora-theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Settings</h2>
      
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Appearance</h3>
        <p style={{ marginBottom: '20px', color: 'var(--text-color)', opacity: 0.7 }}>Choose how AUDITORA looks to you.</p>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => toggleTheme('light')}
            style={{ padding: '15px 30px', borderRadius: '8px', border: theme === 'light' ? '2px solid #007A5A' : '1px solid var(--card-border)', backgroundColor: '#FFFFFF', color: '#111827', cursor: 'pointer', fontWeight: 'bold' }}>
            ☀️ Light Mode
          </button>
          
          <button 
            onClick={() => toggleTheme('dark')}
            style={{ padding: '15px 30px', borderRadius: '8px', border: theme === 'dark' ? '2px solid #C9AD72' : '1px solid var(--card-border)', backgroundColor: '#080808', color: '#FFFFFF', cursor: 'pointer', fontWeight: 'bold' }}>
            🌙 Dark Mode
          </button>
        </div>
      </div>
    </div>
  );
}
