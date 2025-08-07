document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('deliveryForm');
  const customerDropdown = document.getElementById('customer');
  const vendorDropdown = document.getElementById('vendor');
  const productDropdown = document.getElementById('product');

  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const rateInput = document.getElementById('rate');

  const totalSqftInput = document.getElementById('totalSqft');
  const totalAmountInput = document.getElementById('totalAmount');

  // Auto calculate totalSqft and totalAmount
  const calculateTotals = () => {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftInput.value = totalSqft.toFixed(2);
    totalAmountInput.value = totalAmount.toFixed(2);
  };

  [lengthInput, widthInput, heightInput, rateInput].forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      customer: customerDropdown.value,
      vendor: vendorDropdown.value,
      product: productDropdown.value,
      vehicleNumber: document.getElementById('vehicleNumber').value,
      length: parseFloat(lengthInput.value),
      width: parseFloat(widthInput.value),
      height: parseFloat(heightInput.value),
      rate: parseFloat(rateInput.value),
      totalSqft: parseFloat(totalSqftInput.value),
      totalAmount: parseFloat(totalAmountInput.value),
      date: document.getElementById('date').value,
    };

    try {
      const res = await fetch('/api/deliveries/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to save');
      }

      alert('✅ Delivery saved successfully!');
      form.reset();
      totalSqftInput.value = '';
      totalAmountInput.value = '';
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('❌ Failed to save delivery. Check console.');
    }
  });

  // Populate dropdowns
  const populateDropdown = async (id, endpoint) => {
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      const dropdown = document.getElementById(id);
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.name || item.customer_name;
        option.textContent = item.name || item.customer_name;
        dropdown.appendChild(option);
      });
    } catch (error) {
      console.error(`❌ Error loading ${id}:`, error);
    }
  };

  populateDropdown('customer', '/api/customers/list');
  populateDropdown('vendor', '/api/vendors/list');
  populateDropdown('product', '/api/products/list');
});
