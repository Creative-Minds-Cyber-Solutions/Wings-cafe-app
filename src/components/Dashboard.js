import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import inventoryImg from '../Assets/inv.png';
import salesImg from '../Assets/Sal.png';
import reportsImg from '../Assets/rep.png';

function Dashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div className="dashboard">
      <h2>Wings Café Dashboard</h2>

      {/* Navigation Cards */}
      <div className="dashboard-grid">
        <Link to="/inventory" className="dashboard-card">
          <img src={inventoryImg} alt="Inventory" />
          <p>Inventory</p>
        </Link>
        <Link to="/sales" className="dashboard-card">
          <img src={salesImg} alt="Sales" />
          <p>Sales</p>
        </Link>
        <Link to="/reports" className="dashboard-card">
          <img src={reportsImg} alt="Reports" />
          <p>Reports</p>
        </Link>
      </div>

      {/* Inventory Display */}
      <h3>Menu Items</h3>
      <div className="product-grid">
        {products.map(product => (
          <div
            key={product.id}
            className={`product-card ${product.quantity < 5 ? 'low-stock' : ''}`}
          >
            <img
              src={product.image ? `/Assets/${product.image}` : '/Assets/placeholder.png'}
              alt={product.name}
              className="product-image"
            />
            <h4>{product.name}</h4>
            <p>R{parseFloat(product.price).toFixed(2)}</p>
            <p>Stock: {product.quantity}</p>
            {product.quantity < 20 && (
              <p className="low-stock-alert">⚠️ Low stock!</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;