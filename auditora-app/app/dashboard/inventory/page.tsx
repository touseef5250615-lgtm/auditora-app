"use client";
import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";

export default function InventoryPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [stock, setStock] = useState("");
  const [message, setMessage] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { if (selectedCompany) fetchProducts(); }, [selectedCompany]);

  const fetchCompanies = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from("companies").select("*").eq("user_id", user.id);
      if (data) setCompanies(data);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").eq("company_id", selectedCompany).order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (!selectedCompany) { setMessage("Please select a company first."); return; }

    const { error } = await supabase.from("products").insert([
      { 
        company_id: selectedCompany, 
        name: name, 
        purchase_price: parseFloat(purchasePrice) || 0, 
        sale_price: parseFloat(salePrice) || 0,
        stock: parseInt(stock) || 0
      }
    ]);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Product added successfully!");
      setName(""); setPurchasePrice(""); setSalePrice(""); setStock("");
      fetchProducts();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: '#C9AD72' }}>Inventory Management</h2>
      
      {message && <p style={{ color: message.includes("Error") ? '#F87171' : '#4ADE80', marginBottom: '15px' }}>{message}</p>}

      <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333', marginBottom: '30px' }}>
        <select onChange={(e) => setSelectedCompany(e.target.value)} value={selectedCompany} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', marginBottom: '20px', width: '100%' }}>
          <option value="">-- Select a Company --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {selectedCompany && (
          <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', flex: 1, minWidth: '150px' }} />
            <input type="number" placeholder="Purchase Price ($)" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <input type="number" placeholder="Sale Price ($)" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '150px' }} />
            <input type="number" placeholder="Initial Stock" value={stock} onChange={(e) => setStock(e.target.value)} required style={{ padding: '10px', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#080808', color: '#FFF', width: '120px' }} />
            <button type="submit" style={{ backgroundColor: '#C9AD72', color: '#080808', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>Add Product</button>
          </form>
        )}
      </div>

      {selectedCompany && (
        <div style={{ backgroundColor: '#151515', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Product List</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#A0A0A0' }}>
                <th style={{ padding: '10px' }}>Product Name</th>
                <th style={{ padding: '10px' }}>Purchase Price</th>
                <th style={{ padding: '10px' }}>Sale Price</th>
                <th style={{ padding: '10px' }}>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map(prod => (
                <tr key={prod.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '10px' }}>{prod.name}</td>
                  <td style={{ padding: '10px', color: '#A0A0A0' }}>${prod.purchase_price}</td>
                  <td style={{ padding: '10px', color: '#C9AD72' }}>${prod.sale_price}</td>
                  <td style={{ padding: '10px', color: prod.stock > 0 ? '#4ADE80' : '#F87171' }}>{prod.stock}</td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={4} style={{ padding: '10px', color: '#A0A0A0' }}>No products added yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
