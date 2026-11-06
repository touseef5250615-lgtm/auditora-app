"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyCurrency, setCompanyCurrency] = useState("");
  const [companyYear, setCompanyYear] = useState("");
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedCompany) {
      const comp = companies.find(c => c.id === selectedCompany);
      if (comp) { setCompanyName(comp.name); setCompanyCurrency(comp.currency); setCompanyYear(comp.financial_year); }
    }
  }, [selectedCompany, companies]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage("");
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    if (error) setMessage("Error: " + error.message); else setMessage("Profile updated successfully!");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setMessage("Error: " + error.message); else { setMessage("Password updated successfully!"); setNewPassword(""); }
  };

  const handleRegisterPasskey = async () => {
    setMessage("Opening device security...");
    try {
      const { error } = await supabase.auth.registerPasskey();
      if (error) setMessage("Error: " + error.message);
      else setMessage("Face ID / Fingerprint successfully enabled!");
    } catch (err: any) {
      setMessage("Error: " + err.message);
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage("");
    const { error } = await supabase.from("companies").update({ name: companyName, currency: companyCurrency, financial_year: companyYear }).eq("id", selectedCompany);
    if (error) setMessage("Error: " + error.message); else { setMessage("Company updated!"); fetchData(); }
  };

  // ... (Baqi ka code pehle jaisa hi hai, bas design thora professional kiya gaya hai) ...
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Settings</h2>
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px', padding: '10px', backgroundColor: '#151515', borderRadius: '4px' }}>{message}</p>}

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => { setActiveTab("profile"); setMessage(""); }} style={{ textAlign: 'left', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'profile' ? '#C9AD72' : '#151515', color: activeTab === 'profile' ? '#080808' : '#FFF', fontWeight: 'bold' }}>My Profile</button>
          <button onClick={() => { setActiveTab("company"); setMessage(""); }} style={{ textAlign: 'left', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'company' ? '#C9AD72' : '#151515', color: activeTab === 'company' ? '#080808' : '#FFF', fontWeight: 'bold' }}>Company Settings</button>
          <button onClick={() => { setActiveTab("security"); setMessage(""); }} style={{ textAlign: 'left', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'security' ? '#C9AD72' : '#151515', color: activeTab === 'security' ? '#080808' : '#FFF', fontWeight: 'bold' }}>Security</button>
        </div>

        <div style={{ flex: 1, backgroundColor: '#151515', padding: '30px', borderRadius: '8px', border: '1px solid #333' }}>
          
          {activeTab === "security" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#C9AD72', marginBottom: '10px' }}>Security Settings</h3>
              
              {/* Windows Hello / Mobile Face Unlock style box */}
              <div style={{ padding: '20px', backgroundColor: '#080808', borderRadius: '6px', border: '1px solid #333' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '5px' }}>Fingerprint & Face Unlock</h4>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginBottom: '15px' }}>When you set up Face Unlock and Fingerprint Unlock, your device will ask for your fingerprint or face when you sign in.</p>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #222' }}>
                  <div><p style={{ margin: 0, fontWeight: 'bold' }}>Face Unlock</p><p style={{ margin: 0, fontSize: '0.8rem', color: '#A0A0A0' }}>Tap to set up face recognition</p></div>
                  <button onClick={handleRegisterPasskey} style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Enable</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                  <div><p style={{ margin: 0, fontWeight: 'bold' }}>Fingerprint Unlock</p><p style={{ margin: 0, fontSize: '0.8rem', color: '#A0A0A0' }}>Tap to set up fingerprint</p></div>
                  <button onClick={handleRegisterPasskey} style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Enable</button>
                </div>
              </div>

              {/* Password */}
              <div style={{ padding: '20px', backgroundColor: '#080808', borderRadius: '6px', border: '1px solid #333' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Change Password</h4>
                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#151515', color: '#FFF', width: '100%' }} />
                  <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '150px', alignSelf: 'flex-start' }}>Update Password</button>
                </form>
              </div>

            </div>
          )}

          {/* Baqi tabs (Profile & Company) ke liye code yahan aayega... */}
          {activeTab === "profile" && (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
               <h3 style={{ fontSize: '1.2rem', color: '#C9AD72', marginBottom: '10px' }}>My Profile</h3>
               <div><label style={{ display: 'block', color: '#A0A0A0', marginBottom: '5px', fontSize: '0.9rem' }}>Email Address</label><input type="text" value={email} disabled style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#666', width: '100%' }} /></div>
               <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 <div><label style={{ display: 'block', color: '#A0A0A0', marginBottom: '5px', fontSize: '0.9rem' }}>Full Name</label><input type="text" placeholder="Enter your name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%' }} /></div>
                 <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '150px', alignSelf: 'flex-start' }}>Save Profile</button>
               </form>
             </div>
          )}

          {activeTab === "company" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#C9AD72', marginBottom: '10px' }}>Company Settings</h3>
              <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%', marginBottom: '10px' }}><option value="">-- Select a Company to Edit --</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              {selectedCompany && (
                <form onSubmit={handleUpdateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={{ display: 'block', color: '#A0A0A0', marginBottom: '5px', fontSize: '0.9rem' }}>Company Name</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%' }} /></div>
                  <div><label style={{ display: 'block', color: '#A0A0A0', marginBottom: '5px', fontSize: '0.9rem' }}>Currency</label><input type="text" value={companyCurrency} onChange={(e) => setCompanyCurrency(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%' }} /></div>
                  <div><label style={{ display: 'block', color: '#A0A0A0', marginBottom: '5px', fontSize: '0.9rem' }}>Financial Year</label><input type="text" value={companyYear} onChange={(e) => setCompanyYear(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '100%' }} /></div>
                  <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '150px', alignSelf: 'flex-start' }}>Update Company</button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
