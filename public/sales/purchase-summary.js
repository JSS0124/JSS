const BASE_URL = "https://jss-pied.vercel.app";

let purchaseData = [];
let vendors = [];
let products = [];

// Load vendors and products for filters
async function loadFilters() {
  try {
    const [vendorsRes, productsRes] = await Promise.all([
      fetch(`${BASE_URL}/vendors`),
      fetch(`${BASE_URL}/products`)
    ]);
    
    vendors = await vendorsRes.json();
    products = await productsRes.json();
    
    const vendorFilter = document.getElementById('vendorFilter');
    const productFilter = document.getElementById('productFilter');
    
    vendors.forEach(vendor => {
      vendorFilter.innerHTML += `<option value="${vendor.id}">${vendor.name}</option>`;
    });
    
    products.forEach(product => {
      productFilter.innerHTML += `<option value="${product.id}">${product.name}</option>`;
    });
  } catch (error) {
    console.error('Error loading filters:', error);
  }
}

// Generate purchase summary
async function generateSummary() {
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  const vendorFilter = document.getElementById('vendorFilter').value;
  const productFilter = document.getElementById('productFilter').value;
  
  if (!fromDate || !toDate) {
    alert('Please select both from and to dates');
    return;
  }
  
  try {
    // Fetch all deliveries (which represent purchases from vendors)
    const response = await fetch(`${BASE_URL}/deliveries`);
    const allDeliveries = await response.json();
    
    // Filter deliveries by date range
    let filteredDeliveries = allDeliveries.filter(delivery => 
      delivery.date >= fromDate && delivery.date <= toDate
    );
    
    // Apply vendor filter
    if (vendorFilter) {
      filteredDeliveries = filteredDeliveries.filter(delivery => 
        delivery.vendor_id == vendorFilter
      );
    }
    
    // Apply product filter
    if (productFilter) {
      filteredDeliveries = filteredDeliveries.filter(delivery => 
        delivery.product_id == productFilter
      );
    }
    
    purchaseData = filteredDeliveries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displaySummary();
    updatePeriodInfo(fromDate, toDate);
    displayPurchaseTable();
    displayVendorAnalysis();
    
  } catch (error) {
    console.error('Error generating summary:', error);
    alert('Error generating summary. Please try again.');
  }
}

// Display summary cards
function displaySummary() {
  const summaryCards = document.getElementById('summaryCards');
  const noData = document.getElementById('noData');
  
  if (purchaseData.length === 0) {
    summaryCards.style.display = 'none';
    document.getElementById('vendorAnalysis').style.display = 'none';
    document.getElementById('purchaseTable').style.display = 'none';
    noData.textContent = 'No purchase data found for the selected period';
    noData.style.display = 'block';
    return;
  }
  
  // Calculate summary statistics
  const totalPurchases = purchaseData.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount), 0);
  const totalQuantity = purchaseData.reduce((sum, purchase) => sum + parseFloat(purchase.total_sqft), 0);
  const averagePurchase = totalPurchases / purchaseData.length;
  const activeVendors = new Set(purchaseData.map(purchase => purchase.vendor_id)).size;
  
  // Update summary cards
  document.getElementById('totalPurchases').textContent = formatCurrency(totalPurchases);
  document.getElementById('purchaseCount').textContent = `${purchaseData.length} transactions`;
  document.getElementById('averagePurchase').textContent = formatCurrency(averagePurchase);
  document.getElementById('totalQuantity').textContent = totalQuantity.toFixed(2);
  document.getElementById('activeVendors').textContent = activeVendors;
  
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

// Display purchase table
function displayPurchaseTable() {
  const tableBody = document.querySelector('#purchaseTable tbody');
  const table = document.getElementById('purchaseTable');
  
  tableBody.innerHTML = '';
  
  purchaseData.forEach(purchase => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${new Date(purchase.date).toLocaleDateString()}</td>
      <td>${purchase.slip_number}</td>
      <td class="vendor-cell">${purchase.vendor_name}</td>
      <td>${purchase.product_name}</td>
      <td>${purchase.customer_name}</td>
      <td class="quantity-cell">${purchase.total_sqft}</td>
      <td>${formatCurrency(purchase.rate)}</td>
      <td class="amount-cell">${formatCurrency(purchase.total_amount)}</td>
    `;
    tableBody.appendChild(row);
  });
  
  table.style.display = 'table';
}

// Display vendor analysis
function displayVendorAnalysis() {
  const vendorAnalysis = document.getElementById('vendorAnalysis');
  const vendorStats = document.getElementById('vendorStats');
  
  // Group purchases by vendor
  const vendorGroups = {};
  purchaseData.forEach(purchase => {
    const vendorId = purchase.vendor_id;
    const vendorName = purchase.vendor_name;
    
    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        name: vendorName,
        totalAmount: 0,
        totalQuantity: 0,
        transactionCount: 0
      };
    }
    
    vendorGroups[vendorId].totalAmount += parseFloat(purchase.total_amount);
    vendorGroups[vendorId].totalQuantity += parseFloat(purchase.total_sqft);
    vendorGroups[vendorId].transactionCount++;
  });
  
  // Sort vendors by total amount
  const sortedVendors = Object.values(vendorGroups)
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 6); // Top 6 vendors
  
  vendorStats.innerHTML = '';
  
  sortedVendors.forEach((vendor, index) => {
    const vendorStat = document.createElement('div');
    vendorStat.className = 'vendor-stat';
    vendorStat.innerHTML = `
      <h4>${vendor.name}</h4>
      <div class="value">${formatCurrency(vendor.totalAmount)}</div>
      <small>${vendor.transactionCount} transactions</small>
    `;
    vendorStats.appendChild(vendorStat);
  });
  
  vendorAnalysis.style.display = 'block';
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
  if (purchaseData.length === 0) {
    alert('No data to export. Please generate a summary first.');
    return;
  }
  
  const fromDate = document.getElementById('fromDate').value;
  const toDate = document.getElementById('toDate').value;
  
  let csvContent = `Purchase Summary Report\n`;
  csvContent += `Period: ${fromDate} to ${toDate}\n\n`;
  
  // Summary statistics
  const totalPurchases = purchaseData.reduce((sum, purchase) => sum + parseFloat(purchase.total_amount), 0);
  const totalQuantity = purchaseData.reduce((sum, purchase) => sum + parseFloat(purchase.total_sqft), 0);
  const averagePurchase = totalPurchases / purchaseData.length;
  const activeVendors = new Set(purchaseData.map(purchase => purchase.vendor_id)).size;
  
  csvContent += `Summary Statistics\n`;
  csvContent += `Total Purchases,${totalPurchases}\n`;
  csvContent += `Total Transactions,${purchaseData.length}\n`;
  csvContent += `Average Purchase,${averagePurchase}\n`;
  csvContent += `Total Quantity (Sqft),${totalQuantity}\n`;
  csvContent += `Active Vendors,${activeVendors}\n\n`;
  
  // Vendor analysis
  const vendorGroups = {};
  purchaseData.forEach(purchase => {
    const vendorId = purchase.vendor_id;
    const vendorName = purchase.vendor_name;
    
    if (!vendorGroups[vendorId]) {
      vendorGroups[vendorId] = {
        name: vendorName,
        totalAmount: 0,
        transactionCount: 0
      };
    }
    
    vendorGroups[vendorId].totalAmount += parseFloat(purchase.total_amount);
    vendorGroups[vendorId].transactionCount++;
  });
  
  const sortedVendors = Object.values(vendorGroups)
    .sort((a, b) => b.totalAmount - a.totalAmount);
  
  csvContent += `Vendor Analysis\n`;
  csvContent += `Vendor Name,Total Amount,Transaction Count,Average per Transaction\n`;
  sortedVendors.forEach(vendor => {
    const avgPerTransaction = vendor.totalAmount / vendor.transactionCount;
    csvContent += `"${vendor.name}",${vendor.totalAmount},${vendor.transactionCount},${avgPerTransaction}\n`;
  });
  
  csvContent += `\nDetailed Purchase Data\n`;
  csvContent += `Date,Slip No,Vendor,Product,Customer,Quantity (Sqft),Rate,Amount\n`;
  
  purchaseData.forEach(purchase => {
    csvContent += `${purchase.date},${purchase.slip_number},"${purchase.vendor_name}","${purchase.product_name}","${purchase.customer_name}",${purchase.total_sqft},${purchase.rate},${purchase.total_amount}\n`;
  });
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `purchase_summary_${fromDate}_to_${toDate}.csv`;
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
loadFilters();
setDefaultDates();

