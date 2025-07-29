const BASE_URL = "https://jss-pied.vercel.app";

let salesData = [];
let chartInstance = null;

// Update date filters based on period type
function updateDateFilters() {
  const periodType = document.getElementById('periodType').value;
  const customDateGroup = document.getElementById('customDateGroup');
  const customDateGroup2 = document.getElementById('customDateGroup2');
  
  if (periodType === 'custom') {
    customDateGroup.style.display = 'flex';
    customDateGroup2.style.display = 'flex';
  } else {
    customDateGroup.style.display = 'none';
    customDateGroup2.style.display = 'none';
    setDatesByPeriod(periodType);
  }
}

// Set dates based on period type
function setDatesByPeriod(periodType) {
  const today = new Date();
  let fromDate, toDate;
  
  switch (periodType) {
    case 'today':
      fromDate = toDate = today;
      break;
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      fromDate = startOfWeek;
      toDate = today;
      break;
    case 'month':
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = today;
      break;
    case 'quarter':
      const quarter = Math.floor(today.getMonth() / 3);
      fromDate = new Date(today.getFullYear(), quarter * 3, 1);
      toDate = today;
      break;
    case 'year':
      fromDate = new Date(today.getFullYear(), 0, 1);
      toDate = today;
      break;
  }
  
  document.getElementById('fromDate').value = fromDate.toISOString().split('T')[0];
  document.getElementById('toDate').value = toDate.toISOString().split('T')[0];
}

// Generate sales summary
async function generateSummary() {
  const periodType = document.getElementById('periodType').value;
  let fromDate, toDate;
  
  if (periodType === 'custom') {
    fromDate = document.getElementById('fromDate').value;
    toDate = document.getElementById('toDate').value;
    
    if (!fromDate || !toDate) {
      alert('Please select both from and to dates');
      return;
    }
  } else {
    fromDate = document.getElementById('fromDate').value;
    toDate = document.getElementById('toDate').value;
  }
  
  try {
    // Fetch all deliveries
    const response = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await response.json();
    
    // Filter deliveries by date range
    salesData = allDeliveries.filter(delivery => 
      delivery.date >= fromDate && delivery.date <= toDate
    ).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    displaySummary();
    updatePeriodInfo(fromDate, toDate);
    displaySalesTable();
    createSalesChart();
    
  } catch (error) {
    console.error('Error generating summary:', error);
    alert('Error generating summary. Please try again.');
  }
}

// Display summary cards
function displaySummary() {
  const summaryCards = document.getElementById('summaryCards');
  const noData = document.getElementById('noData');
  
  if (salesData.length === 0) {
    summaryCards.style.display = 'none';
    document.getElementById('chartContainer').style.display = 'none';
    document.getElementById('salesTable').style.display = 'none';
    noData.textContent = 'No sales found for the selected period';
    noData.style.display = 'block';
    return;
  }
  
  // Calculate summary statistics
  const totalSales = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const totalQuantity = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_sqft), 0);
  const averageSale = totalSales / salesData.length;
  const uniqueCustomers = new Set(salesData.map(sale => sale.customer_id)).size;
  
  // Update summary cards
  document.getElementById('totalSales').textContent = formatCurrency(totalSales);
  document.getElementById('salesCount').textContent = `${salesData.length} transactions`;
  document.getElementById('averageSale').textContent = formatCurrency(averageSale);
  document.getElementById('totalQuantity').textContent = totalQuantity.toFixed(2);
  document.getElementById('uniqueCustomers').textContent = uniqueCustomers;
  
  summaryCards.style.display = 'grid';
  noData.style.display = 'none';
}

// Update period info
function updatePeriodInfo(fromDate, toDate) {
  const periodInfo = document.getElementById('periodInfo');
  const periodText = document.getElementById('periodText');
  
  const fromDateFormatted = new Date(fromDate).toLocaleDateString();
  const toDateFormatted = new Date(toDate).toLocaleDateString();
  
  periodText.textContent = `${fromDateFormatted} to ${toDateFormatted}`;
  periodInfo.style.display = 'block';
}

// Display sales table
function displaySalesTable() {
  const tableBody = document.querySelector('#salesTable tbody');
  const table = document.getElementById('salesTable');
  
  tableBody.innerHTML = '';
  
  salesData.forEach(sale => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(sale.date).toLocaleDateString()}</td>
      <td>${sale.slip_number}</td>
      <td>${sale.customer_name}</td>
      <td>${sale.product_name}</td>
      <td>${sale.total_sqft}</td>
      <td>${formatCurrency(sale.rate)}</td>
      <td class="amount-cell">${formatCurrency(sale.total_amount)}</td>
    `;
    tableBody.appendChild(row);
  });
  
  table.style.display = 'table';
}

// Create sales chart
function createSalesChart() {
  const canvas = document.getElementById('salesChart');
  const ctx = canvas.getContext('2d');
  
  // Destroy existing chart if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Group sales by date
  const salesByDate = {};
  salesData.forEach(sale => {
    const date = sale.date;
    if (!salesByDate[date]) {
      salesByDate[date] = 0;
    }
    salesByDate[date] += parseFloat(sale.total_amount);
  });
  
  const dates = Object.keys(salesByDate).sort();
  const amounts = dates.map(date => salesByDate[date]);
  
  // Simple chart drawing (since we don't have Chart.js)
  drawSimpleChart(ctx, dates, amounts);
  
  document.getElementById('chartContainer').style.display = 'block';
}

// Simple chart drawing function
function drawSimpleChart(ctx, dates, amounts) {
  const canvas = ctx.canvas;
  const width = canvas.width;
  const height = canvas.height;
  const padding = 40;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  if (amounts.length === 0) return;
  
  const maxAmount = Math.max(...amounts);
  const minAmount = Math.min(...amounts);
  const range = maxAmount - minAmount || 1;
  
  // Draw axes
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Draw data points and lines
  ctx.strokeStyle = '#007bff';
  ctx.fillStyle = '#007bff';
  ctx.lineWidth = 2;
  
  const stepX = (width - 2 * padding) / (dates.length - 1 || 1);
  const stepY = (height - 2 * padding);
  
  ctx.beginPath();
  amounts.forEach((amount, index) => {
    const x = padding + index * stepX;
    const y = height - padding - ((amount - minAmount) / range) * stepY;
    
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    // Draw point
    ctx.fillRect(x - 2, y - 2, 4, 4);
  });
  ctx.stroke();
  
  // Draw labels
  ctx.fillStyle = '#666';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  dates.forEach((date, index) => {
    const x = padding + index * stepX;
    const shortDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillText(shortDate, x, height - 10);
  });
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Export summary to CSV
function exportSummary() {
  if (salesData.length === 0) {
    alert('No data to export. Please generate a summary first.');
    return;
  }
  
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  let csvContent = `Sales Summary Report\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  
  // Summary statistics
  const totalSales = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_amount), 0);
  const totalQuantity = salesData.reduce((sum, sale) => sum + parseFloat(sale.total_sqft), 0);
  const averageSale = totalSales / salesData.length;
  const uniqueCustomers = new Set(salesData.map(sale => sale.customer_id)).size;
  
  csvContent += `Summary Statistics\n`;
  csvContent += `Total Sales,${totalSales}\n`;
  csvContent += `Total Transactions,${salesData.length}\n`;
  csvContent += `Average Sale,${averageSale}\n`;
  csvContent += `Total Quantity (Sqft),${totalQuantity}\n`;
  csvContent += `Unique Customers,${uniqueCustomers}\n\n`;
  
  csvContent += `Detailed Sales Data\n`;
  csvContent += `Date,Slip No,Customer,Product,Quantity (Sqft),Rate,Amount\n`;
  
  salesData.forEach(sale => {
    csvContent += `${sale.date},${sale.slip_number},"${sale.customer_name}","${sale.product_name}",${sale.total_sqft},${sale.rate},${sale.total_amount}\n`;
  });
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales_summary_${fromDate}_to_${toDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Initialize
updateDateFilters();
generateSummary(); // Auto-generate for current month

