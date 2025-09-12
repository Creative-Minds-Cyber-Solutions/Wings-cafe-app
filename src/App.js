import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InventoryModule from './components/Inventory';
import SalesModule from './components/Sales';
import Reports from './components/Reports';
import './App.css';

const appStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundImage: 'url("/wings.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat'
};


function App() {
  return (
    <Router>
      <div className="app-wrapper" style={appStyle}>
        <div className="overlay">
        <div className="app">
          <nav>
            <ul>
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/inventory">Inventory</Link></li>
              <li><Link to="/sales">Sales</Link></li>
              <li><Link to="/reports">Reports</Link></li>
            </ul>
          </nav>

          <div className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryModule />} />
              <Route path="/sales" element={<SalesModule />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </div>

          <footer className="app-footer">
            <p>© {new Date().getFullYear()} Wings Cafe Inventory System</p>
          </footer>
        </div>  
        </div>
      </div>
    </Router>
  );
}

export default App;