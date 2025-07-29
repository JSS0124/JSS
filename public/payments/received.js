const BASE_URL = "https://jss-pied.vercel.app";

let selectedPaymentMethod = '';
let customers = [];
let receivedPayments = [];
let deliveries = [];

// Load initial data
async function loadInitialData() {
  try {
    const [customersRes, deliveriesRes] = await Promise.all([
      fetch(`${BASE_URL}/customers`),
      fetch(`${BASE_URL}/deliveries`)
    ]);
    
    customers = await customersRes.json();
    deliveries = await deliveriesRes.json();
    
    populateCustomers();
    loadReceivedPayments();
    updateSummaryCards();
    
  } catch (error) {
    console.error('Error loading initial data:', error);
    alert('Error loading data. Please refresh the page.');
  }
}

// Populate customer dropdown
function populateCustomers() {
  const customerSelect = document.getElementById('customerSelect');
  customers.forEach(customer => {
    customerSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
  });
}

// Update outstanding amount for selected customer
function updateOutstanding() {
  const customerId = document.getElementById('customerSelect').value;
  const outstandingInfo = document.getElementById('outstandingInfo');
  const outstandingAmount = document.getElementById('outstandingAmount');
  
  if (!customerId) {
    outstandingInfo.style.display = 'none';
    return;
  }
  
  // Calculate outstanding amount for this customer
  const customerDeliveries = deliveries.filter(d => d.customer_id == customerId);
  const totalSales = customerDeliveries.reduce((sum, d) => sum + parseFloat(d.total_amount), 0);
  
  // Get payments received from this customer
  const customerPayments = receivedPayments.filter(p => p.customerId == customerId);
  const totalPayments = customerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  const outstanding = totalSales - totalPayments;
  
  outstandingAmount.textContent = formatCurrency(outstanding);
  outstandingInfo.style.display = 'block';
}

// Select payment method
function selectPaymentMethod(method) {
  // Remove previous selection
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
  });
  
  // Add selection to clicked method
  event.target.closest('.payment-method').classList.add('selected');
  selectedPaymentMethod = method;
  
  // Show/hide relevant fields based on method
  const referenceField = document.getElementById('referenceNumber');
  const bankField = document.getElementById('bankSource');
  
  if (method === 'cash') {
    referenceField.required = false;
    bankField.required = false;
    referenceField.placeholder = 'Receipt number (optional)';
    bankField.placeholder = 'Cash received by';
  } else if (method === 'bank') {
    referenceField.required = true;
    bankField.required = true;
    referenceField.placeholder = 'Transaction ID';
    bankField.placeholder = 'Bank name';
  } else if (method === 'cheque') {
    referenceField.required = true;
    bankField.required = true;
    referenceField.placeholder = 'Cheque number';
    bankField.placeholder = 'Bank name';
  } else if (method === 'online') {
    referenceField.required = true;
    bankField.required = false;
    referenceField.placeholder = 'Transaction ID';
    bankField.placeholder = 'Platform (UPI/Card/etc.)';
  }
}

// Load received payments (mock implementation using localStorage)
function loadReceivedPayments() {
  const storedPayments = localStorage.getItem('receivedPayments');
  receivedPayments = storedPayments ? JSON.parse(storedPayments) : [];
  displayPayments();
}

// Save received payments to localStorage
function saveReceivedPayments() {
  localStorage.setItem('receivedPayments', JSON.stringify(receivedPayments));
}

// Display payments in table
function displayPayments() {
  const tableBody = document.querySelector('#paymentsTable tbody');
  const noPayments = document.getElementById('noPayments');
  
  tableBody.innerHTML = '';
  
  if (receivedPayments.length === 0) {
    noPayments.style.display = 'block';
    return;
  }
  
  noPayments.style.display = 'none';
  
  // Sort payments by date (newest first)
  const sortedPayments = receivedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedPayments.forEach((payment, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(payment.date).toLocaleDateString()}</td>
      <td>${payment.customerName}</td>
      <td>${payment.method}</td>
      <td>${payment.reference || '-'}</td>
      <td>${payment.invoiceRef || '-'}</td>
      <td class="amount-cell">${formatCurrency(payment.amount)}</td>
      <td><span class="status-received">Received</span></td>
      <td>
        <button class="btn" style="background: #dc3545; color: white; padding: 0.3rem 0.6rem; font-size: 0.8rem;" 
                onclick="deletePayment(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Update summary cards
function updateSummaryCards() {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Today's collections
  const todayPayments = receivedPayments.filter(p => p.date === today);
  const todayTotal = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  // This month's collections
  const monthPayments = receivedPayments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const monthTotal = monthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  // Calculate total outstanding
  const totalSales = deliveries.reduce((sum, d) => sum + parseFloat(d.total_amount), 0);
  const totalReceived = receivedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const totalOutstanding = totalSales - totalReceived;
  
  document.getElementById('todayCollections').textContent = formatCurrency(todayTotal);
  document.getElementById('monthCollections').textContent = formatCurrency(monthTotal);
  document.getElementById('totalOutstanding').textContent = formatCurrency(totalOutstanding);
}

// Delete payment
function deletePayment(index) {
  if (confirm('Are you sure you want to delete this payment record?')) {
    receivedPayments.splice(index, 1);
    saveReceivedPayments();
    displayPayments();
    updateSummaryCards();
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Export payments to CSV
function exportPayments() {
  if (receivedPayments.length === 0) {
    alert('No payments to export.');
    return;
  }
  
  let csvContent = `Received Payments Report\n`;
  csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
  csvContent += `Date,Customer Name,Payment Method,Reference,Invoice Reference,Amount,Notes\n`;
  
  receivedPayments.forEach(payment => {
    csvContent += `${payment.date},"${payment.customerName}",${payment.method},"${payment.reference || ''}","${payment.invoiceRef || ''}",${payment.amount},"${payment.notes || ''}"\n`;
  });
  
  // Add summary
  const totalAmount = receivedPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const today = new Date().toISOString().split('T')[0];
  const todayPayments = receivedPayments.filter(p => p.date === today);
  const todayTotal = todayPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  
  csvContent += `\nSummary\n`;
  csvContent += `Total Payments Received,${receivedPayments.length}\n`;
  csvContent += `Total Amount Received,${totalAmount}\n`;
  csvContent += `Today's Collections,${todayTotal}\n`;
  csvContent += `Payments Today,${todayPayments.length}\n`;
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `received_payments_report_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// Form submission
document.getElementById('paymentForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (!selectedPaymentMethod) {
    alert('Please select a payment method');
    return;
  }
  
  const customerId = document.getElementById('customerSelect').value;
  const customerName = document.getElementById('customerSelect').selectedOptions[0].text;
  
  const formData = {
    date: document.getElementById('paymentDate').value,
    customerId: customerId,
    customerName: customerName,
    amount: parseFloat(document.getElementById('paymentAmount').value),
    method: selectedPaymentMethod,
    reference: document.getElementById('referenceNumber').value,
    bankSource: document.getElementById('bankSource').value,
    invoiceRef: document.getElementById('invoiceReference').value,
    notes: document.getElementById('paymentNotes').value,
    timestamp: new Date().toISOString()
  };
  
  // Add to received payments array
  receivedPayments.push(formData);
  saveReceivedPayments();
  displayPayments();
  updateSummaryCards();
  
  // Reset form
  document.getElementById('paymentForm').reset();
  document.querySelectorAll('.payment-method').forEach(el => {
    el.classList.remove('selected');
  });
  selectedPaymentMethod = '';
  document.getElementById('outstandingInfo').style.display = 'none';
  
  alert('Payment recorded successfully!');
});

// Set default date to today
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('paymentDate').value = today;
}

// Initialize
loadInitialData();
setDefaultDate();

