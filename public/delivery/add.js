document.addEventListener('DOMContentLoaded', async () => {
  const customerSelect = document.getElementById('customer');
  const vendorSelect = document.getElementById('vendor');
  const productSelect = document.getElementById('product');
  const deliveryForm = document.getElementById('deliveryForm');

  // Helper: Fetch and populate dropdown
  async function populateDropdown(endpoint, selectElement, labelKey = 'name') {
    try {
      const res = await fetch(`/api/${endpoint}`);
      const data = await res.json();
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item[labelKey] || item.name;
        selectElement.appendChild(option);
      });
    } catch (err) {
      console.error(`Failed to load ${endpoint}:`, err);
    }
  }

  // Populate dropdowns
  await populateDropdown('customers', customerSelect);
  await populateDropdown('vendors', vendorSelect);
  await populateDropdown('products', productSelect);

  // Auto-calculate total_sqft and total_amount
  ['length', 'width', 'height', 'rate'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      const length = parseFloat(document.getElementById('length').value) || 0;
      const width = parseFloat(document.getElementById('width').value) || 0;
      const height = parseFloat(document.getElementById('height').value) || 0;
      const rate = parseFloat(document.getElementById('rate').value) || 0;
      const total_sqft = length * width * height;
      const total_amount = total_sqft * rate;
      document.getElementById('total_sqft').value = total_sqft.toFixed(2);
      document.getElementById('total_amount').value = total_amount.toFixed(2);
    });
  });

  // Form submit handler
  deliveryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const deliveryData = {
      customer_id: customerSelect.value,
      vendor_id: vendorSelect.value,
      product_id: productSelect.value,
      vehicle_no: document.getElementById('vehicle_no').value,
      slip_no: document.getElementById('slip_no').value,
      length: parseFloat(document.getElementById('length').value),
      width: parseFloat(document.getElementById('width').value),
      height: parseFloat(document.getElementById('height').value),
      rate: parseFloat(document.getElementById('rate').value),
      total_sqft: parseFloat(document.getElementById('total_sqft').value),
      total_amount: parseFloat(document.getElementById('total_amount').value)
    };

    try {
      const res = await fetch('/api/deliveries/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliveryData)
      });

      const result = await res.json();
      if (res.ok) {
        alert('✅ Delivery saved!');
        deliveryForm.reset();
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      alert('❌ Network error while saving delivery.');
      console.error(err);
    }
  });
});
