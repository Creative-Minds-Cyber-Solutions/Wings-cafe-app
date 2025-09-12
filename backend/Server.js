const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// File paths
const PRODUCTS = path.join(__dirname, 'products.json');
const SALES = path.join(__dirname, 'sales.json');

// Utility functions
const read = file => JSON.parse(fs.readFileSync(file));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// PRODUCTS

app.get('/products', (req, res) => {
  res.json(read(PRODUCTS));
});

app.post('/products', (req, res) => {
  const products = read(PRODUCTS);
  const newProduct = req.body;
  products.push(newProduct);
  write(PRODUCTS, products);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const products = read(PRODUCTS).map(p =>
    p.id == req.params.id ? { ...p, ...req.body } : p
  );
  write(PRODUCTS, products);
  res.json({ success: true });
});

app.delete('/products/:id', (req, res) => {
  const products = read(PRODUCTS).filter(p => p.id != req.params.id);
  write(PRODUCTS, products);
  res.json({ success: true });
});

// SALES

app.get('/sales', (req, res) => {
  res.json(read(SALES));
});

app.post('/sales', (req, res) => {
  const sales = read(SALES);
  const newSale = req.body;
  sales.push(newSale);
  write(SALES, sales);

  // Deduct stock from product
  const products = read(PRODUCTS).map(p =>
    p.id == newSale.productId ? { ...p, quantity: p.quantity - newSale.quantity } : p
  );
  write(PRODUCTS, products);

  res.status(201).json(newSale);
});

// REPORTS

app.get('/reports/summary', (req, res) => {
  const products = read(PRODUCTS);
  const sales = read(SALES);

  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const lowStock = products.filter(p => p.quantity < 5);

  // Total sales per product
  const salesMap = {};
  for (const s of sales) {
    if (!salesMap[s.productId]) {
      salesMap[s.productId] = 0;
    }
    salesMap[s.productId] += s.quantity;
  }

  const salesTrends = Object.entries(salesMap).map(([productId, totalSold]) => {
    const product = products.find(p => p.id == productId);
    return {
      productId: parseInt(productId),
      name: product?.name || 'Unknown',
      totalSold
    };
  }).sort((a, b) => b.totalSold - a.totalSold);

  // Daily sales breakdown per product
  const dailyTrends = {};
  for (const s of sales) {
    const date = new Date(s.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
    if (!dailyTrends[date]) dailyTrends[date] = {};
    if (!dailyTrends[date][s.productId]) dailyTrends[date][s.productId] = 0;
    dailyTrends[date][s.productId] += s.quantity;
  }

  const formattedDailyTrends = Object.entries(dailyTrends).map(([date, productsSold]) => {
    return {
      date,
      sales: Object.entries(productsSold).map(([productId, qty]) => {
        const product = products.find(p => p.id == productId);
        return {
          productId: parseInt(productId),
          name: product?.name || 'Unknown',
          quantity: qty
        };
      })
    };
  });

  res.json({
    totalSales,
    lowStock,
    productCount: products.length,
    saleCount: sales.length,
    salesTrends,
    dailyTrends: formattedDailyTrends
  });
});

// SERVER

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});