const BASE_URL = "https://jss-pied.vercel.app";

let analysisData = [];
let products = [];
let deliveries = [];
let receivedPayments = [];

// Load initial data
async function loadInitialData() {
  try {
    const [productsRes, deliveriesRes] = await Promise.all([
      fetch(`${BASE_URL}/products`),
      fetch(`${BASE_URL}/deliveries`)
    ]);
    
    products = await productsRes.json();
    deliveries = await deliveriesRes.json();
    
    // Load received payments from localStorage (since we don't have API yet)
    const storedPayments = localStorage.getItem('receivedPayments');
    receivedPayments = storedPayments ? JSON.parse(storedPayments) : [];
    
    populateProductFilter();
    
  } catch (error) {
    console.error('Error loading initial data:', error);
    alert('Error loading data. Please refresh the page.');
  }
}

// Populate product filter
function populateProductFilter() {
  const productFilter = document.getElementById('productFilter');
  products.forEach(product => {
    productFilter.innerHTML += `<option value="${product.id}">${product.name}</option>`;
  });
}

// Generate payment analysis
async function generateAnalysis() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const productFilter = document.getElementById('productFilter').value;
  
  if (!fromDate || !toDate) {
    alert('Please select both from and to dates');
    return;
  }
  
  try {
    // Filter deliveries by date range
    let filteredDeliveries = deliveries.filter(delivery => 
      delivery.date >= fromDate && delivery.date <= toDate
    );
    
    // Apply product filter if selected
    if (productFilter) {
      filteredDeliveries = filteredDeliveries.filter(delivery => 
        delivery.product_id == productFilter
      );
    }
    
    // Group deliveries by product
    const productGroups = {};
    filteredDeliveries.forEach(delivery => {
      const productId = delivery.product_id;
      const productName = delivery.product_name;
      
      if (!productGroups[productId]) {
        productGroups[productId] = {
          id: productId,
          name: productName,
          totalSales: 0,
          totalQuantity: 0,
          transactionCount: 0,
          customers: new Set()
        };
      }
      
      productGroups[productId].totalSales += parseFloat(delivery.total_amount);
      productGroups[productId].totalQuantity += parseFloat(delivery.total_sqft);
      productGroups[productId].transactionCount++;
      productGroups[productId].customers.add(delivery.customer_id);
    });
    
    // Calculate payment collection for each product
    analysisData = Object.values(productGroups).map(product => {
      // Get all customers who bought this product
      const productCustomers = Array.from(product.customers);
      
      // Calculate total payments received from these customers
      // Note: This is a simplified calculation - in reality, you'd want to track
      // payments against specific invoices/products
      const customerPayments = receivedPayments.filter(payment => 
        productCustomers.includes(parseInt(payment.customerId))
      );
      
      // Estimate collected amount based on proportion of sales
      const totalCustomerSales = productCustomers.reduce((sum, customerId) => {
        const customerDeliveries = filteredDeliveries.filter(d => d.customer_id == customerId);
        return sum + customerDeliveries.reduce((s, d) => s + parseFloat(d.total_amount), 0);
      }, 0);
      
      const totalCustomerPayments = customerPayments.reduce((sum, payment) => 
        sum + parseFloat(payment.amount), 0
      );
      
      // Estimate collected amount for this product proportionally
      const collectedAmount = totalCustomerSales > 0 ? 
        (product.totalSales / totalCustomerSales) * totalCustomerPayments : 0;
      
      const pendingAmount = product.totalSales - collectedAmount;
      const collectionRate = product.totalSales > 0 ? 
        (collectedAmount / product.totalSales) * 100 : 0;
      
      return {
        ...product,
        collectedAmount: Math.max(0, collectedAmount),
        pendingAmount: Math.max(0, pendingAmount),
        collectionRate: Math.min(100, Math.max(0, collectionRate)),
        customerCount: product.customers.size
      };
    });
    
    // Sort data
    sortAnalysisData();
    displayAnalysis();
    updateStatsCards();
    
  } catch (error) {
    console.error('Error generating analysis:', error);
    alert('Error generating analysis. Please try again.');
  }
}

// Sort analysis data based on selected criteria
function sortAnalysisData() {
  const sortBy = document.getElementById('sortBy').value;
  
  analysisData.sort((a, b) => {
    switch (sortBy) {
      case 'collection_rate':
        return b.collectionRate - a.collectionRate;
      case 'total_sales':
        return b.totalSales - a.totalSales;
      case 'collected_amount':
        return b.collectedAmount - a.collectedAmount;
      case 'pending_amount':
        return b.pendingAmount - a.pendingAmount;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return b.collectionRate - a.collectionRate;
    }
  });
}

// Display analysis in table
function displayAnalysis() {
  const tableBody = document.querySelector('#analysisTable tbody');
  const table = document.getElementById('analysisTable');
  const noData = document.getElementById('noData');
  const statsCards = document.getElementById('statsCards');
  
  tableBody.innerHTML = '';
  
  if (analysisData.length === 0) {
    table.style.display = 'none';
    statsCards.style.display = 'none';
    noData.textContent = 'No product sales data found for the selected period';
    noData.style.display = 'block';
    return;
  }
  
  analysisData.forEach(product => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${product.name}</strong></td>
      <td class="amount-cell">${formatCurrency(product.totalSales)}</td>
      <td class="amount-cell">${formatCurrency(product.collectedAmount)}</td>
      <td class="pending-cell">${formatCurrency(product.pendingAmount)}</td>
      <td class="percentage-cell">${product.collectionRate.toFixed(1)}%</td>
      <td>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${product.collectionRate}%"></div>
        </div>
        <small>${product.collectionRate.toFixed(1)}% collected</small>
      </td>
      <td class="percentage-cell">${product.transactionCount}</td>
    `;
    tableBody.appendChild(row);
  });
  
  table.style.display = 'table';
  statsCards.style.display = 'grid';
  noData.style.display = 'none';
}

// Update statistics cards
function updateStatsCards() {
  const totalSales = analysisData.reduce((sum, product) => sum + product.totalSales, 0);
  const totalCollected = analysisData.reduce((sum, product) => sum + product.collectedAmount, 0);
  const totalPending = analysisData.reduce((sum, product) => sum + product.pendingAmount, 0);
  const overallCollectionRate = totalSales > 0 ? (totalCollected / totalSales) * 100 : 0;
  
  document.getElementById('overallCollectionRate').textContent = overallCollectionRate.toFixed(1) + '%';
  document.getElementById('totalSalesAmount').textContent = formatCurrency(totalSales);
  document.getElementById('totalCollectedAmount').textContent = formatCurrency(totalCollected);
  document.getElementById('totalPendingAmount').textContent = formatCurrency(totalPending);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Export analysis to CSV
function exportAnalysis() {
  if (analysisData.length === 0) {
    alert('No data to export. Please generate an analysis first.');
    return;
  }
  
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  let csvContent = `Item Wise Payment Analysis Report\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  
  // Summary statistics
  const totalSales = analysisData.reduce((sum, product) => sum + product.totalSales, 0);
  const totalCollected = analysisData.reduce((sum, product) => sum + product.collectedAmount, 0);
  const totalPending = analysisData.reduce((sum, product) => sum + product.pendingAmount, 0);
  const overallCollectionRate = totalSales > 0 ? (totalCollected / totalSales) * 100 : 0;
  
  csvContent += `Summary Statistics\n`;
  csvContent += `Overall Collection Rate,${overallCollectionRate.toFixed(2)}%\n`;
  csvContent += `Total Sales,${totalSales}\n`;
  csvContent += `Total Collected,${totalCollected}\n`;
  csvContent += `Total Pending,${totalPending}\n`;
  csvContent += `Products Analyzed,${analysisData.length}\n\n`;
  
  csvContent += `Product Analysis Details\n`;
  csvContent += `Product Name,Total Sales,Amount Collected,Amount Pending,Collection Rate %,Transactions,Customers\n`;
  
  analysisData.forEach(product => {
    csvContent += `"${product.name}",${product.totalSales},${product.collectedAmount},${product.pendingAmount},${product.collectionRate.toFixed(2)},${product.transactionCount},${product.customerCount}\n`;
  });
  
  // Top and bottom performers
  csvContent += `\nTop 5 Collection Performers\n`;
  const topPerformers = [...analysisData].sort((a, b) => b.collectionRate - a.collectionRate).slice(0, 5);
  topPerformers.forEach((product, index) => {
    csvContent += `${index + 1}. ${product.name} - ${product.collectionRate.toFixed(1)}% collection rate\n`;
  });
  
  csvContent += `\nProducts Needing Attention (Low Collection Rate)\n`;
  const lowPerformers = analysisData.filter(p => p.collectionRate < 50).sort((a, b) => a.collectionRate - b.collectionRate);
  lowPerformers.forEach((product, index) => {
    csvContent += `${index + 1}. ${product.name} - ${product.collectionRate.toFixed(1)}% collection rate (₹${product.pendingAmount.toFixed(0)} pending)\n`;
  });
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `item_wise_payment_analysis_${fromDate}_to_${toDate}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Event listener for sort change
document.getElementById('sortBy').addEventListener('change', () => {
  if (analysisData.length > 0) {
    sortAnalysisData();
    displayAnalysis();
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
loadInitialData();
setDefaultDates();

