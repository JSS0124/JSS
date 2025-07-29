const BASE_URL = "https://jss-pied.vercel.app";

let summaryData = [];
let products = [];

// Load products for filter
async function loadProducts() {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    products = await response.json();
    
    const productFilter = document.getElementById('productFilter');
    products.forEach(product => {
      productFilter.innerHTML += `<option value="${product.id}">${product.name}</option>`;
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Generate item-wise sales summary
async function generateSummary() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const productFilter = document.getElementById('productFilter').value;
  
  if (!fromDate || !toDate) {
    alert('Please select both from and to dates');
    return;
  }
  
  try {
    // Fetch all deliveries
    const response = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await response.json();
    
    // Filter deliveries by date range and product
    let filteredDeliveries = allDeliveries.filter(delivery => 
      delivery.date >= fromDate && delivery.date <= toDate
    );
    
    if (productFilter) {
      filteredDeliveries = filteredDeliveries.filter(delivery => 
        delivery.product_id == productFilter
      );
    }
    
    // Group by product
    const productGroups = {};
    filteredDeliveries.forEach(delivery => {
      const productId = delivery.product_id;
      const productName = delivery.product_name;
      
      if (!productGroups[productId]) {
        productGroups[productId] = {
          id: productId,
          name: productName,
          transactions: [],
          totalAmount: 0,
          totalQuantity: 0,
          transactionCount: 0,
          rates: []
        };
      }
      
      productGroups[productId].transactions.push(delivery);
      productGroups[productId].totalAmount += parseFloat(delivery.total_amount);
      productGroups[productId].totalQuantity += parseFloat(delivery.total_sqft);
      productGroups[productId].transactionCount++;
      productGroups[productId].rates.push(parseFloat(delivery.rate));
    });
    
    // Convert to array and calculate additional metrics
    const totalSales = Object.values(productGroups).reduce((sum, product) => sum + product.totalAmount, 0);
    
    summaryData = Object.values(productGroups).map(product => ({
      ...product,
      averageRate: product.rates.reduce((sum, rate) => sum + rate, 0) / product.rates.length,
      marketShare: (product.totalAmount / totalSales) * 100,
      lastSale: Math.max(...product.transactions.map(t => new Date(t.date)))
    }));
    
    // Sort data
    sortSummaryData();
    displaySummary();
    updateStatsCards();
    createSalesChart();
    
  } catch (error) {
    console.error('Error generating summary:', error);
    alert('Error generating summary. Please try again.');
  }
}

// Sort summary data based on selected criteria
function sortSummaryData() {
  const sortBy = document.getElementById('sortBy').value;
  
  summaryData.sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.totalAmount - a.totalAmount;
      case 'quantity':
        return b.totalQuantity - a.totalQuantity;
      case 'transactions':
        return b.transactionCount - a.transactionCount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return b.totalAmount - a.totalAmount;
    }
  });
}

// Display summary in table
function displaySummary() {
  const tableBody = document.querySelector('#summaryTable tbody');
  const table = document.getElementById('summaryTable');
  const noData = document.getElementById('noData');
  const statsCards = document.getElementById('statsCards');
  
  tableBody.innerHTML = '';
  
  if (summaryData.length === 0) {
    table.style.display = 'none';
    statsCards.style.display = 'none';
    document.getElementById('chartContainer').style.display = 'none';
    noData.textContent = 'No product sales data found for the selected period';
    noData.style.display = 'block';
    return;
  }
  
  summaryData.forEach((product, index) => {
    const row = document.createElement('tr');
    if (index === 0) row.classList.add('top-item'); // Highlight top product
    
    row.innerHTML = `
      <td class="count-cell">${index + 1}</td>
      <td><strong>${product.name}</strong></td>
      <td class="count-cell">${product.transactionCount}</td>
      <td class="quantity-cell">${product.totalQuantity.toFixed(2)}</td>
      <td class="amount-cell">${formatCurrency(product.totalAmount)}</td>
      <td class="amount-cell">${formatCurrency(product.averageRate)}</td>
      <td class="count-cell">${product.marketShare.toFixed(1)}%</td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${product.marketShare}%"></div>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  table.style.display = 'table';
  statsCards.style.display = 'grid';
  noData.style.display = 'none';
}

// Update statistics cards
function updateStatsCards() {
  const totalProducts = summaryData.length;
  const bestSellingProduct = summaryData.length > 0 ? summaryData[0].name : '-';
  const totalQuantitySold = summaryData.reduce((sum, product) => sum + product.totalQuantity, 0);
  const totalSales = summaryData.reduce((sum, product) => sum + product.totalAmount, 0);
  const averagePrice = totalQuantitySold > 0 ? totalSales / totalQuantitySold : 0;
  
  document.getElementById('totalProducts').textContent = totalProducts;
  document.getElementById('bestSellingProduct').textContent = bestSellingProduct.length > 15 ? 
    bestSellingProduct.substring(0, 15) + '...' : bestSellingProduct;
  document.getElementById('totalQuantitySold').textContent = totalQuantitySold.toFixed(2) + ' sqft';
  document.getElementById('averagePrice').textContent = formatCurrency(averagePrice);
}

// Create sales chart
function createSalesChart() {
  const canvas = document.getElementById('salesChart');
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (summaryData.length === 0) return;
  
  // Take top 10 products for chart
  const chartData = summaryData.slice(0, 10);
  const maxAmount = Math.max(...chartData.map(p => p.totalAmount));
  
  // Chart dimensions
  const width = canvas.width;
  const height = canvas.height;
  const padding = 60;
  const barWidth = (width - 2 * padding) / chartData.length;
  const maxBarHeight = height - 2 * padding;
  
  // Colors for bars
  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
  ];
  
  // Draw bars
  chartData.forEach((product, index) => {
    const barHeight = (product.totalAmount / maxAmount) * maxBarHeight;
    const x = padding + index * barWidth + barWidth * 0.1;
    const y = height - padding - barHeight;
    const width = barWidth * 0.8;
    
    // Draw bar
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(x, y, width, barHeight);
    
    // Draw product name (rotated)
    ctx.save();
    ctx.translate(x + width / 2, height - 10);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    const shortName = product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name;
    ctx.fillText(shortName, 0, 0);
    ctx.restore();
    
    // Draw amount on top of bar
    ctx.fillStyle = '#333';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(formatCurrency(product.totalAmount), x + width / 2, y - 5);
  });
  
  // Draw axes
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();
  
  // Chart title
  ctx.fillStyle = '#333';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Top 10 Products by Sales Amount', width / 2, 30);
  
  document.getElementById('chartContainer').style.display = 'block';
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
  if (summaryData.length === 0) {
    alert('No data to export. Please generate a summary first.');
    return;
  }
  
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  let csvContent = `Item Wise Sales Report\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  
  // Summary statistics
  const totalProducts = summaryData.length;
  const totalSales = summaryData.reduce((sum, product) => sum + product.totalAmount, 0);
  const totalQuantity = summaryData.reduce((sum, product) => sum + product.totalQuantity, 0);
  const totalTransactions = summaryData.reduce((sum, product) => sum + product.transactionCount, 0);
  
  csvContent += `Summary Statistics\n`;
  csvContent += `Total Products,${totalProducts}\n`;
  csvContent += `Total Sales,${totalSales}\n`;
  csvContent += `Total Quantity (Sqft),${totalQuantity}\n`;
  csvContent += `Total Transactions,${totalTransactions}\n`;
  csvContent += `Average Price per Sqft,${totalSales / totalQuantity}\n\n`;
  
  csvContent += `Product Details\n`;
  csvContent += `Rank,Product Name,Total Transactions,Total Quantity (Sqft),Total Amount,Average Rate,Market Share %\n`;
  
  summaryData.forEach((product, index) => {
    csvContent += `${index + 1},"${product.name}",${product.transactionCount},${product.totalQuantity},${product.totalAmount},${product.averageRate},${product.marketShare}\n`;
  });
  
  // Top 5 products breakdown
  csvContent += `\nTop 5 Products Performance\n`;
  summaryData.slice(0, 5).forEach((product, index) => {
    csvContent += `\n${index + 1}. ${product.name}\n`;
    csvContent += `Total Sales: ${product.totalAmount}\n`;
    csvContent += `Total Quantity: ${product.totalQuantity} sqft\n`;
    csvContent += `Average Rate: ${product.averageRate} per sqft\n`;
    csvContent += `Market Share: ${product.marketShare.toFixed(2)}%\n`;
    csvContent += `Transaction Count: ${product.transactionCount}\n`;
  });
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `item_wise_sales_${fromDate}_to_${toDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Event listener for sort change
document.getElementById('sortBy').addEventListener('change', () => {
  if (summaryData.length > 0) {
    sortSummaryData();
    displaySummary();
  }
});

// Set default date range (current month)
function setDefaultDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  document.getElementById('fromDate').value = firstDay.toISOString().split('T')[0];
  document.getElementById('toDate').value = today.toISOString().split('T')[0];
}

// Initialize
loadProducts();
setDefaultDates();

