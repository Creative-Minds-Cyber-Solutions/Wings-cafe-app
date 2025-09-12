import React, { useState, useEffect } from 'react';

function Reports() {
  const [report, setReport] = useState({});

  const fetchReport = () => {
    setReport({}); // Clear previous state
    fetch('http://localhost:5000/reports/summary')
      .then(res => res.json())
      .then(data => {
        console.log("Fetched report:", data); // Debug log
        setReport({ ...data }); // Defensive update
      });
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const salesTrends = Array.isArray(report.salesTrends) ? report.salesTrends : [];
  const dailyTrends = Array.isArray(report.dailyTrends) ? report.dailyTrends : [];

  return (
    <div className="report-container">
      <h2>📊 Inventory & Sales Summary</h2>
      <button className="refresh-btn" onClick={fetchReport}>🔄 Refresh Report</button>

      <div className="report-cards">
        <div className="report-card">
          <h4>Total Sales</h4>
          <p>R{report.totalSales?.toFixed(2)}</p>
        </div>
        <div className="report-card">
          <h4>Products in Inventory</h4>
          <p>{report.productCount}</p>
        </div>
        <div className="report-card">
          <h4>Sales Recorded</h4>
          <p>{report.saleCount}</p>
        </div>
      </div>

      <h3>📈 Sales Trends by Product</h3>
      {salesTrends.length > 0 ? (
        <table className="sales-trend-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Total Sold</th>
            </tr>
          </thead>
          <tbody>
            {salesTrends.map(item => (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>{item.totalSold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No sales data available yet.</p>
      )}

      <h3>📅 Daily Sales Breakdown</h3>
      {dailyTrends.length > 0 ? (
        dailyTrends.map(day => (
          <div key={day.date} className="daily-trend-block">
            <h4>{day.date}</h4>
            <table className="daily-trend-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                </tr>
              </thead>
              <tbody>
                {day.sales.map(item => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No daily sales data available.</p>
      )}

      <h3>⚠️ Low Stock Items</h3>
      {report.lowStock?.length > 0 ? (
        <table className="low-stock-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Left</th>
            </tr>
          </thead>
          <tbody>
            {report.lowStock.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="low-stock">{p.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="success">✅ All stock levels are healthy</p>
      )}
    </div>
  );
}

export default Reports;