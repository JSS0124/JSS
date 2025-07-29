const BASE_URL = "https://jss-pied.vercel.app";

let customers = [];
let ledgerData = [];

// Load customers on page load
async function loadCustomers() {
  try {
    const response = await fetch(`${BASE_URL}/customers`);
    customers = await response.json();
    
    const clientSelect = document.getElementById('clientSelect');
    customers.forEach(customer => {
      clientSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
    });
  } catch (error) {
    console.error('Error loading customers:', error);
    alert('Error loading customers. Please refresh the page.');
  }
}

// Generate ledger
async function generateLedger() {
  const clientId = document.getElementById('clientSelect').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  if (!clientId) {
    alert('Please select a client');
    return;
  }
  
  try {
    // Fetch deliveries for the selected client
    const deliveriesResponse = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await deliveriesResponse.json();
    
    // Filter deliveries by client and date range
    let filteredDeliveries = allDeliveries.filter(delivery => 
      delivery.customer_id == clientId
    );
    
    if (fromDate) {
      filteredDeliveries = filteredDeliveries.filter(delivery => 
        delivery.date >= fromDate
      );
    }
    
    if (toDate) {
      filteredDeliveries = filteredDeliveries.filter(delivery => 
        delivery.date <= toDate
      );
    }
    
    // TODO: Fetch payments for the selected client (when payment system is implemented)
    const payments = []; // Placeholder for payments
    
    // Generate ledger entries
    ledgerData = [];
    let runningBalance = 0;
    
    // Combine deliveries and payments, sort by date
    const allTransactions = [
      ...filteredDeliveries.map(d => ({
        date: d.date,
        type: 'delivery',
        particulars: `Sale - ${d.product_name}`,
        slip_no: d.slip_number,
        debit: parseFloat(d.total_amount),
        credit: 0,
        data: d
      })),
      ...payments.map(p => ({
        date: p.date,
        type: 'payment',
        particulars: `Payment Received`,
        slip_no: p.reference_no || '',
        debit: 0,
        credit: parseFloat(p.amount),
        data: p
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate running balance
    allTransactions.forEach(transaction => {
      runningBalance += transaction.debit - transaction.credit;
      ledgerData.push({
        ...transaction,
        balance: runningBalance
      });
    });
    
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
    noData.textContent = 'No transactions found for the selected criteria';
    noData.style.display = 'block';
    return;
  }
  
  ledgerData.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>${entry.particulars}</td>
      <td>${entry.slip_no}</td>
      <td class="debit">${entry.debit > 0 ? formatCurrency(entry.debit) : ''}</td>
      <td class="credit">${entry.credit > 0 ? formatCurrency(entry.credit) : ''}</td>
      <td class="${entry.balance >= 0 ? 'balance-positive' : 'balance-negative'}">
        ${formatCurrency(Math.abs(entry.balance))} ${entry.balance >= 0 ? 'Dr' : 'Cr'}
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
  const totalSales = ledgerData.reduce((sum, entry) => sum + entry.debit, 0);
  const totalPayments = ledgerData.reduce((sum, entry) => sum + entry.credit, 0);
  const outstandingBalance = totalSales - totalPayments;
  
  document.getElementById('totalSales').textContent = formatCurrency(totalSales);
  document.getElementById('totalPayments').textContent = formatCurrency(totalPayments);
  document.getElementById('outstandingBalance').textContent = formatCurrency(Math.abs(outstandingBalance));
  
  // Update outstanding balance color
  const balanceElement = document.getElementById('outstandingBalance');
  balanceElement.parentElement.style.background = outstandingBalance >= 0 
    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
    : 'linear-gradient(135deg, #28a745 0%, #218838 100%)';
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
  
  const clientName = document.getElementById('clientSelect').selectedOptions[0].text;
  const fromDate = document.getElementById('fromDate').value || 'All';
  const toDate = document.getElementById('toDate').value || 'All';
  
  let csvContent = `Client Ledger Report\n`;
  csvContent += `Client: ${clientName}\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  csvContent += `Date,Particulars,Slip No,Debit,Credit,Balance\n`;
  
  ledgerData.forEach(entry => {
    csvContent += `${entry.date},"${entry.particulars}",${entry.slip_no},${entry.debit},${entry.credit},${entry.balance}\n`;
  });
  
  // Add summary
  const totalSales = ledgerData.reduce((sum, entry) => sum + entry.debit, 0);
  const totalPayments = ledgerData.reduce((sum, entry) => sum + entry.credit, 0);
  const outstandingBalance = totalSales - totalPayments;
  
  csvContent += `\nSummary\n`;
  csvContent += `Total Sales,${totalSales}\n`;
  csvContent += `Total Payments,${totalPayments}\n`;
  csvContent += `Outstanding Balance,${outstandingBalance}\n`;
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `client_ledger_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
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
loadCustomers();
setDefaultDates();

