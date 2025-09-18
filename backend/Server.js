const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Wings Café backend is running');
});

const PRODUCTS = path.join(__dirname, 'Products.json');
const SALES = path.join(__dirname, 'Sales.json');

const read = file => JSON.parse(fs.readFileSync(file));
const write = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

app.get('/products', (req, res) => {
  try {
    const products = read(PRODUCTS);
    res.json(products);
  } catch (err) {
    console.error('Error reading products.json:', err.message);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

app.post('/products', (req, res) => {
  const products = read(PRODUCTS);
  const newProduct = req.body;
  products.push(newProduct);
  write(PRODUCTS, products);
  res.status(201).json(newProduct);
});

app.put('/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const products = read(PRODUCTS).map(p =>
    p.id === productId ? { ...p, ...req.body } : p
  );
  write(PRODUCTS, products);
  res.json({ success: true });
});

app.delete('/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const products = read(PRODUCTS).filter(p => p.id !== productId);
  write(PRODUCTS, products);
  res.json({ success: true });
});

app.get('/sales', (req, res) => {
  res.json(read(SALES));
});

app.post('/sales', (req, res) => {
  const sales = read(SALES);
  const products = read(PRODUCTS);
  const newSale = req.body;

  const product = products.find(p => p.id === newSale.productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  newSale.total = product.price * newSale.quantity;
  newSale.timestamp = newSale.timestamp || new Date().toISOString();

  sales.push(newSale);
  write(SALES, sales);

  const updatedProducts = products.map(p =>
    p.id === newSale.productId ? { ...p, quantity: p.quantity - newSale.quantity } : p
  );
  write(PRODUCTS, updatedProducts);

  res.status(201).json(newSale);
});

app.get('/reports/summary', (req, res) => {
  const products = read(PRODUCTS);
  const sales = read(SALES);

  const totalSales = sales.reduce((sum, s) => {
    const value = typeof s.total === 'number' ? s.total : parseFloat(s.total);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const lowStock = products.filter(p => p.quantity < 5);

  const salesMap = {};
  for (const s of sales) {
    if (!salesMap[s.productId]) {
      salesMap[s.productId] = { totalSold: 0 };
    }
    salesMap[s.productId].totalSold += s.quantity;
  }

  const salesTrends = Object.entries(salesMap).map(([productId, data]) => {
    const product = products.find(p => p.id === Number(productId));
    return {
      productId: Number(productId),
      name: product?.name || 'Unknown',
      totalSold: data.totalSold
    };
  }).sort((a, b) => b.totalSold - a.totalSold);

  const dailyTrends = {};
  for (const s of sales) {
    const date = new Date(s.timestamp).toISOString().split('T')[0];
    if (!dailyTrends[date]) dailyTrends[date] = {};
    if (!dailyTrends[date][s.productId]) {
      dailyTrends[date][s.productId] = { quantity: 0 };
    }
    dailyTrends[date][s.productId].quantity += s.quantity;
  }

  const formattedDailyTrends = Object.entries(dailyTrends).map(([date, productsSold]) => {
    return {
      date,
      sales: Object.entries(productsSold).map(([productId, data]) => {
        const product = products.find(p => p.id === Number(productId));
        return {
          productId: Number(productId),
          name: product?.name || 'Unknown',
          quantity: data.quantity
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

app.listen(PORT, () => {
  console.log(` Backend running on port ${PORT}`);
});