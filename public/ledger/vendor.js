const BASE_URL = "https://jss-pied.vercel.app";

let vendors = [];
let ledgerData = [];

// Load vendors on page load
async function loadVendors() {
  try {
    const response = await fetch(`${BASE_URL}/vendors`);
    vendors = await response.json();
    
    const vendorSelect = document.getElementById('vendorSelect');
    vendors.forEach(vendor => {
      vendorSelect.innerHTML += `<option value="${vendor.id}">${vendor.name}</option>`;
    });
  } catch (error) {
    console.error('Error loading vendors:', error);
    alert('Error loading vendors. Please refresh the page.');
  }
}

// Generate ledger
async function generateLedger() {
  const vendorId = document.getElementById('vendorSelect').value;
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  if (!vendorId) {
    alert('Please select a vendor');
    return;
  }
  
  try {
    // Fetch deliveries for the selected vendor
    const deliveriesResponse = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await deliveriesResponse.json();
    
    // Filter deliveries by vendor and date range
    let filteredDeliveries = allDeliveries.filter(delivery => 
      delivery.vendor_id == vendorId
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
    
    // TODO: Fetch payments to vendors (when payment system is implemented)
    const payments = []; // Placeholder for payments
    
    // Generate ledger entries
    ledgerData = [];
    let runningBalance = 0;
    
    // Combine deliveries and payments, sort by date
    const allTransactions = [
      ...filteredDeliveries.map(d => ({
        date: d.date,
        type: 'purchase',
        particulars: `Purchase - ${d.product_name} (${d.customer_name})`,
        slip_no: d.slip_number,
        debit: 0,
        credit: parseFloat(d.total_amount), // Credit because we owe the vendor
        data: d
      })),
      ...payments.map(p => ({
        date: p.date,
        type: 'payment',
        particulars: `Payment Made`,
        slip_no: p.reference_no || '',
        debit: parseFloat(p.amount), // Debit because we paid the vendor
        credit: 0,
        data: p
      }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate running balance (negative means we owe money)
    allTransactions.forEach(transaction => {
      runningBalance += transaction.credit - transaction.debit;
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
      <td class="${entry.balance >= 0 ? 'balance-negative' : 'balance-positive'}">
        ${formatCurrency(Math.abs(entry.balance))} ${entry.balance >= 0 ? 'Cr' : 'Dr'}
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
  const totalPurchases = ledgerData.reduce((sum, entry) => sum + entry.credit, 0);
  const totalPayments = ledgerData.reduce((sum, entry) => sum + entry.debit, 0);
  const outstandingPayable = totalPurchases - totalPayments;
  
  document.getElementById('totalPurchases').textContent = formatCurrency(totalPurchases);
  document.getElementById('totalPayments').textContent = formatCurrency(totalPayments);
  document.getElementById('outstandingPayable').textContent = formatCurrency(Math.abs(outstandingPayable));
  
  // Update outstanding payable color
  const balanceElement = document.getElementById('outstandingPayable');
  balanceElement.parentElement.style.background = outstandingPayable >= 0 
    ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' // Red for money we owe
    : 'linear-gradient(135deg, #28a745 0%, #218838 100%)'; // Green for overpayment
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
  
  const vendorName = document.getElementById('vendorSelect').selectedOptions[0].text;
  const fromDate = document.getElementById('fromDate').value || 'All';
  const toDate = document.getElementById('toDate').value || 'All';
  
  let csvContent = `Vendor Ledger Report\n`;
  csvContent += `Vendor: ${vendorName}\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  csvContent += `Date,Particulars,Slip No,Debit,Credit,Balance\n`;
  
  ledgerData.forEach(entry => {
    csvContent += `${entry.date},"${entry.particulars}",${entry.slip_no},${entry.debit},${entry.credit},${entry.balance}\n`;
  });
  
  // Add summary
  const totalPurchases = ledgerData.reduce((sum, entry) => sum + entry.credit, 0);
  const totalPayments = ledgerData.reduce((sum, entry) => sum + entry.debit, 0);
  const outstandingPayable = totalPurchases - totalPayments;
  
  csvContent += `\nSummary\n`;
  csvContent += `Total Purchases,${totalPurchases}\n`;
  csvContent += `Total Payments,${totalPayments}\n`;
  csvContent += `Outstanding Payable,${outstandingPayable}\n`;
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vendor_ledger_${vendorName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
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
loadVendors();
setDefaultDates();

