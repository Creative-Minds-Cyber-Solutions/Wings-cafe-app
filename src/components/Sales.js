import React, { useState, useEffect } from 'react';

function Sales() {
  const BASE_URL = 'https://wings-cafe-app.onrender.com';

  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [sale, setSale] = useState({ productId: '', quantity: 1 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${BASE_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data));

    fetch(`${BASE_URL}/sales`)
      .then(res => res.json())
      .then(data => setSales(data.slice(-5).reverse()));
  }, []);

  const handleSale = () => {
    const product = products.find(p => p.id === parseInt(sale.productId));
    if (!product) return;

    if (sale.quantity > product.quantity) {
      alert("Not enough stock available");
      return;
    }

    const total = product.price * sale.quantity;
    const newSale = {
      id: Date.now(),
      productId: product.id,
      quantity: sale.quantity,
      total,
      timestamp: new Date().toISOString()
    };

    fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSale)
    }).then(() => {
      setSales([newSale, ...sales.slice(0, 4)]);
      setMessage(`Sale recorded: ${product.name} x${sale.quantity} = R${total}`);
      setTimeout(() => setMessage(''), 3000);
    });

    fetch(`${BASE_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, quantity: product.quantity - sale.quantity })
    });

    setSale({ productId: '', quantity: 1 });
  };

  return (
    <div className="module-container">
      <h2>Sales</h2>

      {message && <div className="success-message">{message}</div>}

      
      <div className="sale-input-card">
        <h3>Record a Sale</h3>

        <label>
          <span>Product:</span>
          <select
            value={sale.productId}
            onChange={e => setSale({ ...sale, productId: e.target.value })}
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} (Qty: {p.quantity})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Quantity:</span>
          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={sale.quantity}
            onChange={e => setSale({ ...sale, quantity: parseInt(e.target.value) })}
          />
        </label>

        <button onClick={handleSale} disabled={!sale.productId}>
          Record Sale
        </button>
      </div>

      {/* Recent Sales */}
      <h3 style={{ marginTop: '2rem' }}>Recent Sales</h3>
      <table>
        <thead>
          <tr><th>Product</th><th>Qty</th><th>Total</th><th>Time</th></tr>
        </thead>
        <tbody>
          {sales.map(s => {
            const product = products.find(p => p.id === s.productId);
            return (
              <tr key={s.id}>
                <td>{product?.name || 'Deleted'}</td>
                <td>{s.quantity}</td>
                <td>R{s.total}</td>
                <td>{new Date(s.timestamp).toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;