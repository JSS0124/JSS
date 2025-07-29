const BASE_URL = "https://jss-pied.vercel.app";

let ledgerData = [];

// Generate ledger
async function generateLedger() {
  const transactionType = document.getElementById('transactionType').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  try {
    // Fetch all deliveries
    const deliveriesResponse = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await deliveriesResponse.json();
    
    // Filter for cash transactions
    let cashTransactions = allDeliveries.filter(delivery => {
      const isCashCustomer = delivery.customer_name && 
        (delivery.customer_name.toLowerCase().includes('cash') || 
         delivery.customer_name.toLowerCase().includes('walk-in'));
      
      const isCashVendor = delivery.vendor_name && 
        (delivery.vendor_name.toLowerCase().includes('cash') || 
         delivery.vendor_name.toLowerCase().includes('retail'));
      
      return isCashCustomer || isCashVendor;
    });
    
    // Apply date filters
    if (fromDate) {
      cashTransactions = cashTransactions.filter(delivery => 
        delivery.date >= fromDate
      );
    }
    
    if (toDate) {
      cashTransactions = cashTransactions.filter(delivery => 
        delivery.date <= toDate
      );
    }
    
    // Apply transaction type filter
    if (transactionType === 'sales') {
      cashTransactions = cashTransactions.filter(delivery => 
        delivery.customer_name && delivery.customer_name.toLowerCase().includes('cash')
      );
    } else if (transactionType === 'purchases') {
      cashTransactions = cashTransactions.filter(delivery => 
        delivery.vendor_name && delivery.vendor_name.toLowerCase().includes('cash')
      );
    }
    
    // Transform data for display
    ledgerData = cashTransactions.map(delivery => {
      const isCashSale = delivery.customer_name && 
        delivery.customer_name.toLowerCase().includes('cash');
      
      return {
        date: delivery.date,
        type: isCashSale ? 'Cash Sale' : 'Cash Purchase',
        party_name: isCashSale ? delivery.customer_name : delivery.vendor_name,
        slip_no: delivery.slip_number,
        product: delivery.product_name,
        quantity: delivery.total_sqft,
        amount: parseFloat(delivery.total_amount),
        is_sale: isCashSale,
        data: delivery
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    displayLedger();
    updateSummary();
    
  } catch (error) {
    console.error('Error generating ledger:', error);
    alert('Error generating ledger. Please try again.');
  }
}

// Display ledger in table
function displayLedger() {
  const tableBody = document.querySelector('#ledgerTable tbody');
  const table = document.getElementById('ledgerTable');
  const noData = document.getElementById('noData');
  const summaryCards = document.getElementById('summaryCards');
  
  tableBody.innerHTML = '';
  
  if (ledgerData.length === 0) {
    table.style.display = 'none';
    summaryCards.style.display = 'none';
    noData.textContent = 'No cash transactions found for the selected criteria';
    noData.style.display = 'block';
    return;
  }
  
  ledgerData.forEach(entry => {
    const row = document.createElement('tr');
    row.className = entry.is_sale ? 'cash-sale' : 'cash-purchase';
    row.innerHTML = `
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td><strong>${entry.type}</strong></td>
      <td>${entry.party_name}</td>
      <td>${entry.slip_no}</td>
      <td>${entry.product}</td>
      <td>${entry.quantity}</td>
      <td class="${entry.is_sale ? 'amount-positive' : 'amount-negative'}">
        ${formatCurrency(entry.amount)}
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  table.style.display = 'table';
  summaryCards.style.display = 'grid';
  noData.style.display = 'none';
}

// Update summary cards
function updateSummary() {
  const cashSales = ledgerData.filter(entry => entry.is_sale);
  const cashPurchases = ledgerData.filter(entry => !entry.is_sale);
  
  const totalCashSales = cashSales.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCashPurchases = cashPurchases.reduce((sum, entry) => sum + entry.amount, 0);
  const netCashFlow = totalCashSales - totalCashPurchases;
  
  document.getElementById('totalCashSales').textContent = formatCurrency(totalCashSales);
  document.getElementById('totalCashPurchases').textContent = formatCurrency(totalCashPurchases);
  document.getElementById('netCashFlow').textContent = formatCurrency(Math.abs(netCashFlow));
  
  // Update net cash flow color
  const netFlowElement = document.getElementById('netCashFlow');
  netFlowElement.parentElement.style.background = netCashFlow >= 0 
    ? 'linear-gradient(135deg, #28a745 0%, #218838 100%)' // Green for positive cash flow
    : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'; // Red for negative cash flow
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Export ledger to CSV
function exportLedger() {
  if (ledgerData.length === 0) {
    alert('No data to export. Please generate a ledger first.');
    return;
  }
  
  const transactionType = document.getElementById('transactionType').value;
  const fromDate = document.getElementById('fromDate').value || 'All';
  const toDate = document.getElementById('toDate').value || 'All';
  
  let csvContent = `Cash Parties Ledger Report\n`;
  csvContent += `Transaction Type: ${transactionType}\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  csvContent += `Date,Type,Party Name,Slip No,Product,Quantity (Sqft),Amount\n`;
  
  ledgerData.forEach(entry => {
    csvContent += `${entry.date},${entry.type},"${entry.party_name}",${entry.slip_no},"${entry.product}",${entry.quantity},${entry.amount}\n`;
  });
  
  // Add summary
  const cashSales = ledgerData.filter(entry => entry.is_sale);
  const cashPurchases = ledgerData.filter(entry => !entry.is_sale);
  
  const totalCashSales = cashSales.reduce((sum, entry) => sum + entry.amount, 0);
  const totalCashPurchases = cashPurchases.reduce((sum, entry) => sum + entry.amount, 0);
  const netCashFlow = totalCashSales - totalCashPurchases;
  
  csvContent += `\nSummary\n`;
  csvContent += `Total Cash Sales,${totalCashSales}\n`;
  csvContent += `Total Cash Purchases,${totalCashPurchases}\n`;
  csvContent += `Net Cash Flow,${netCashFlow}\n`;
  csvContent += `\nTransaction Breakdown\n`;
  csvContent += `Cash Sales Count,${cashSales.length}\n`;
  csvContent += `Cash Purchases Count,${cashPurchases.length}\n`;
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cash_parties_ledger_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Set default date range (current month)
function setDefaultDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  document.getElementById('fromDate').value = firstDay.toISOString().split('T')[0];
  document.getElementById('toDate').value = today.toISOString().split('T')[0];
}

// Initialize
setDefaultDates();

