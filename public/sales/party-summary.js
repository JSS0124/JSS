const BASE_URL = "https://jss-pied.vercel.app";

let summaryData = [];

// Generate party/client wise summary
async function generateSummary() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  if (!fromDate || !toDate) {
    alert('Please select both from and to dates');
    return;
  }
  
  try {
    // Fetch all deliveries
    const response = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await response.json();
    
    // Filter deliveries by date range
    const filteredDeliveries = allDeliveries.filter(delivery => 
      delivery.date >= fromDate && delivery.date <= toDate
    );
    
    // Group by customer
    const customerGroups = {};
    filteredDeliveries.forEach(delivery => {
      const customerId = delivery.customer_id;
      const customerName = delivery.customer_name;
      
      if (!customerGroups[customerId]) {
        customerGroups[customerId] = {
          id: customerId,
          name: customerName,
          transactions: [],
          totalAmount: 0,
          totalQuantity: 0,
          transactionCount: 0
        };
      }
      
      customerGroups[customerId].transactions.push(delivery);
      customerGroups[customerId].totalAmount += parseFloat(delivery.total_amount);
      customerGroups[customerId].totalQuantity += parseFloat(delivery.total_sqft);
      customerGroups[customerId].transactionCount++;
    });
    
    // Convert to array and calculate additional metrics
    summaryData = Object.values(customerGroups).map(customer => ({
      ...customer,
      averagePerTransaction: customer.totalAmount / customer.transactionCount,
      lastTransaction: Math.max(...customer.transactions.map(t => new Date(t.date)))
    }));
    
    // Sort data
    sortSummaryData();
    displaySummary();
    updateStatsCards();
    
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
    noData.textContent = 'No customer data found for the selected period';
    noData.style.display = 'block';
    return;
  }
  
  summaryData.forEach((customer, index) => {
    const row = document.createElement('tr');
    if (index === 0) row.classList.add('top-customer'); // Highlight top customer
    
    row.innerHTML = `
      <td class="count-cell">${index + 1}</td>
      <td><strong>${customer.name}</strong></td>
      <td class="count-cell">${customer.transactionCount}</td>
      <td class="quantity-cell">${customer.totalQuantity.toFixed(2)}</td>
      <td class="amount-cell">${formatCurrency(customer.totalAmount)}</td>
      <td class="amount-cell">${formatCurrency(customer.averagePerTransaction)}</td>
      <td>${new Date(customer.lastTransaction).toLocaleDateString()}</td>
    `;
    tableBody.appendChild(row);
  });
  
  table.style.display = 'table';
  statsCards.style.display = 'grid';
  noData.style.display = 'none';
}

// Update statistics cards
function updateStatsCards() {
  const totalCustomers = summaryData.length;
  const activeCustomers = summaryData.filter(c => c.transactionCount > 0).length;
  const topCustomerSales = summaryData.length > 0 ? summaryData[0].totalAmount : 0;
  const totalSales = summaryData.reduce((sum, customer) => sum + customer.totalAmount, 0);
  const averagePerCustomer = totalCustomers > 0 ? totalSales / totalCustomers : 0;
  
  document.getElementById('totalCustomers').textContent = totalCustomers;
  document.getElementById('activeCustomers').textContent = activeCustomers;
  document.getElementById('topCustomerSales').textContent = formatCurrency(topCustomerSales);
  document.getElementById('averagePerCustomer').textContent = formatCurrency(averagePerCustomer);
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
  
  let csvContent = `Party/Client Wise Summary Report\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  
  // Summary statistics
  const totalCustomers = summaryData.length;
  const totalSales = summaryData.reduce((sum, customer) => sum + customer.totalAmount, 0);
  const totalQuantity = summaryData.reduce((sum, customer) => sum + customer.totalQuantity, 0);
  const totalTransactions = summaryData.reduce((sum, customer) => sum + customer.transactionCount, 0);
  
  csvContent += `Summary Statistics\n`;
  csvContent += `Total Customers,${totalCustomers}\n`;
  csvContent += `Total Sales,${totalSales}\n`;
  csvContent += `Total Quantity (Sqft),${totalQuantity}\n`;
  csvContent += `Total Transactions,${totalTransactions}\n`;
  csvContent += `Average per Customer,${totalSales / totalCustomers}\n\n`;
  
  csvContent += `Customer Details\n`;
  csvContent += `Rank,Customer Name,Total Transactions,Total Quantity (Sqft),Total Amount,Average per Transaction,Last Transaction\n`;
  
  summaryData.forEach((customer, index) => {
    csvContent += `${index + 1},"${customer.name}",${customer.transactionCount},${customer.totalQuantity},${customer.totalAmount},${customer.averagePerTransaction},${new Date(customer.lastTransaction).toLocaleDateString()}\n`;
  });
  
  // Top 5 customers breakdown
  csvContent += `\nTop 5 Customers Breakdown\n`;
  summaryData.slice(0, 5).forEach((customer, index) => {
    csvContent += `\n${index + 1}. ${customer.name}\n`;
    csvContent += `Total Amount: ${customer.totalAmount}\n`;
    csvContent += `Total Transactions: ${customer.transactionCount}\n`;
    csvContent += `Total Quantity: ${customer.totalQuantity} sqft\n`;
    csvContent += `Average per Transaction: ${customer.averagePerTransaction}\n`;
  });
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `party_wise_summary_${fromDate}_to_${toDate}.csv`;
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
setDefaultDates();

