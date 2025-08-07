// API base
const API_BASE = '/api';

// Load dropdown data
async function loadDropdown(endpoint, selectId, labelKey = 'name') {
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`);
    if (!response.ok) throw new Error('Failed to fetch ' + endpoint);

    const data = await response.json();
    const select = document.getElementById(selectId);
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = item[labelKey] || item.name;
      select.appendChild(option);
    });
  } catch (error) {
    console.error(`Error loading ${endpoint}:`, error);
  }
}

// Load dropdowns on page load
window.addEventListener('DOMContentLoaded', () => {
  loadDropdown('products', 'product');
  loadDropdown('vendors', 'vendor');
  loadDropdown('customers', 'customer');
});

// Calculate sqft and amount
function calculateTotals() {
  const length = parseFloat(document.getElementById('length').value) || 0;
  const width = parseFloat(document.getElementById('width').value) || 0;
  const height = parseFloat(document.getElementById('height').value) || 0;
  const rate = parseFloat(document.getElementById('rate').value) || 0;

  const total_sqft = length * width * height;
  const total_amount = total_sqft * rate;

  document.getElementById('total_sqft').value = total_sqft.toFixed(2);
  document.getElementById('total_amount').value = total_amount.toFixed(2);
}

// Attach calculation events
['length', 'width', 'height', 'rate'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculateTotals);
});

// Form submission
document.getElementById('delivery-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = {
    customer_id: document.getElementById('customer').value,
    vendor_id: document.getElementById('vendor').value,
    product_id: document.getElementById('product').value,
    slip_number: document.getElementById('slip_number').value,
    vehicle_number: document.getElementById('vehicle_number').value,
    length: parseFloat(document.getElementById('length').value),
    width: parseFloat(document.getElementById('width').value),
    height: parseFloat(document.getElementById('height').value),
    rate: parseFloat(document.getElementById('rate').value),
    total_sqft: parseFloat(document.getElementById('total_sqft').value),
    total_amount: parseFloat(document.getElementById('total_amount').value),
    delivery_date: document.getElementById('delivery_date').value
  };

  try {
    const response = await fetch(`${API_BASE}/deliveries/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Error saving delivery: ' + errorText);
    }

    alert('✅ Delivery saved successfully!');
    document.getElementById('delivery-form').reset();
    document.getElementById('total_sqft').value = '';
    document.getElementById('total_amount').value = '';
  } catch (err) {
    console.error('Save error:', err);
    alert('❌ Failed to save delivery. See console for details.');
  }
});
