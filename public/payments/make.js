const BASE_URL = "https://jss-pied.vercel.app";

let selectedPaymentMethod = '';
let vendors = [];
let customers = [];
let payments = [];

// Load initial data
async function loadInitialData() {
  try {
    const [vendorsRes, customersRes] = await Promise.all([
      fetch(`${BASE_URL}/vendors`),
      fetch(`${BASE_URL}/customers`)
    ]);
    
    vendors = await vendorsRes.json();
    customers = await customersRes.json();
    
    // Load existing payments (mock data for now since payments API doesn't exist yet)
    loadPayments();
    
  } catch (error) {
    console.error('Error loading initial data:', error);
    alert('Error loading data. Please refresh the page.');
  }
}

// Update party options based on payment type
function updatePartyOptions() {
  const paymentType = document.getElementById('paymentType').value;
  const partySelect = document.getElementById('partySelect');
  
  partySelect.innerHTML = '<option value="">Select Party</option>';
  
  if (paymentType === 'vendor') {
    vendors.forEach(vendor => {
      partySelect.innerHTML += `<option value="vendor_${vendor.id}">${vendor.name}</option>`;
    });
  } else if (paymentType === 'customer') {
    customers.forEach(customer => {
      partySelect.innerHTML += `<option value="customer_${customer.id}">${customer.name}</option>`;
    });
  } else if (paymentType === 'expense') {
    // Add common expense categories
    const expenseCategories = [
      'Office Rent', 'Utilities', 'Transportation', 'Office Supplies',
      'Marketing', 'Professional Services', 'Insurance', 'Maintenance',
      'Fuel', 'Miscellaneous'
    ];
    expenseCategories.forEach(category => {
      partySelect.innerHTML += `<option value="expense_${category}">${category}</option>`;
    });
  }
  
  // Reset outstanding info
  document.getElementById('outstandingInfo').style.display = 'none';
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
  const bankField = document.getElementById('bankAccount');
  
  if (method === 'cash') {
    referenceField.required = false;
    bankField.required = false;
    referenceField.placeholder = 'Receipt number (optional)';
    bankField.placeholder = 'Cash source (optional)';
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

// Load payments (mock implementation)
function loadPayments() {
  // Since we don't have a payments API yet, we'll use localStorage for demo
  const storedPayments = localStorage.getItem('payments');
  payments = storedPayments ? JSON.parse(storedPayments) : [];
  displayPayments();
}

// Save payments to localStorage (temporary solution)
function savePayments() {
  localStorage.setItem('payments', JSON.stringify(payments));
}

// Display payments in table
function displayPayments() {
  const tableBody = document.querySelector('#paymentsTable tbody');
  const noPayments = document.getElementById('noPayments');
  
  tableBody.innerHTML = '';
  
  if (payments.length === 0) {
    noPayments.style.display = 'block';
    return;
  }
  
  noPayments.style.display = 'none';
  
  // Sort payments by date (newest first)
  const sortedPayments = payments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  sortedPayments.forEach((payment, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(payment.date).toLocaleDateString()}</td>
      <td>${payment.partyName}</td>
      <td>${payment.type}</td>
      <td>${payment.method}</td>
      <td>${payment.reference || '-'}</td>
      <td class="amount-cell">${formatCurrency(payment.amount)}</td>
      <td><span class="status-paid">Paid</span></td>
      <td>
        <button class="btn" style="background: #dc3545; color: white; padding: 0.3rem 0.6rem; font-size: 0.8rem;" 
                onclick="deletePayment(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Delete payment
function deletePayment(index) {
  if (confirm('Are you sure you want to delete this payment record?')) {
    payments.splice(index, 1);
    savePayments();
    displayPayments();
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
  if (payments.length === 0) {
    alert('No payments to export.');
    return;
  }
  
  let csvContent = `Payments Report\n`;
  csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
  csvContent += `Date,Party Name,Payment Type,Method,Reference,Amount,Description\n`;
  
  payments.forEach(payment => {
    csvContent += `${payment.date},"${payment.partyName}",${payment.type},${payment.method},"${payment.reference || ''}",${payment.amount},"${payment.description || ''}"\n`;
  });
  
  // Add summary
  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  csvContent += `\nSummary\n`;
  csvContent += `Total Payments,${payments.length}\n`;
  csvContent += `Total Amount,${totalAmount}\n`;
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
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
  
  const formData = {
    date: document.getElementById('paymentDate').value,
    type: document.getElementById('paymentType').value,
    party: document.getElementById('partySelect').value,
    amount: parseFloat(document.getElementById('paymentAmount').value),
    method: selectedPaymentMethod,
    reference: document.getElementById('referenceNumber').value,
    bank: document.getElementById('bankAccount').value,
    description: document.getElementById('paymentDescription').value,
    timestamp: new Date().toISOString()
  };
  
  // Get party name for display
  const partySelect = document.getElementById('partySelect');
  formData.partyName = partySelect.selectedOptions[0].text;
  
  // Add to payments array
  payments.push(formData);
  savePayments();
  displayPayments();
  
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

