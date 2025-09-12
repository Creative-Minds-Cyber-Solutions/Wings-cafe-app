import React, { useState, useEffect } from 'react';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    quantity: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/products')
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  const handleAdd = () => {
    const newProduct = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      id: Date.now()
    };
    fetch('http://localhost:5000/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    })
      .then(res => res.json())
      .then(data => {
        setProducts([...products, data]);
        setForm({
          name: '',
          description: '',
          category: '',
          price: '',
          quantity: ''
        });
      });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString()
    });
  };

  const handleUpdate = () => {
    const updatedProduct = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity)
    };
    fetch(`http://localhost:5000/products/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    })
      .then(() => {
        setProducts(products.map(p =>
          p.id === editingProduct.id ? { ...p, ...updatedProduct } : p
        ));
        setEditingProduct(null);
        setForm({
          name: '',
          description: '',
          category: '',
          price: '',
          quantity: ''
        });
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this product?")) {
      fetch(`http://localhost:5000/products/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          setProducts(products.filter(p => p.id !== id));
        });
    }
  };

  return (
    <div className="module-container">
      <h2>Inventory Management</h2>

      <table>
        <thead>
          <tr><th>Name</th><th>Qty</th><th>Price per unit</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td className={p.quantity < 20 ? 'low-stock' : ''}>{p.quantity}</td>
              <td>R{parseFloat(p.price).toFixed(2)}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-section">
        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        <input
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />
        <button onClick={editingProduct ? handleUpdate : handleAdd}>
          {editingProduct ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </div>
  );
}

export default Inventory;