document.addEventListener('DOMContentLoaded', () => {
  const productSelect = document.getElementById('product');
  const vendorSelect = document.getElementById('vendor');
  const customerSelect = document.getElementById('customer');

  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const rateInput = document.getElementById('rate');

  const totalSqftInput = document.getElementById('total_sqft');
  const totalAmountInput = document.getElementById('total_amount');

  const deliveryForm = document.getElementById('deliveryForm');

  async function fetchAndPopulateDropdown(url, selectElement, labelField = 'name') {
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = item[labelField];
          selectElement.appendChild(option);
        });
      }
    } catch (err) {
      console.error(`❌ Error loading ${url}:`, err);
    }
  }

  // Load dropdowns
  fetchAndPopulateDropdown('/api/products', productSelect);
  fetchAndPopulateDropdown('/api/vendors', vendorSelect);
  fetchAndPopulateDropdown('/api/customers', customerSelect);

  // Calculate totals
  function calculateTotals() {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftInput.value = totalSqft.toFixed(2);
    totalAmountInput.value = totalAmount.toFixed(2);
  }

  [lengthInput, widthInput, heightInput, rateInput].forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  // Handle form submission
  deliveryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
      customer_id: customerSelect.value,
      vendor_id: vendorSelect.value,
      product_id: productSelect.value,
      vehicle_number: document.getElementById('vehicle_number').value,
      slip_number: document.getElementById('slip_number').value,
      length: parseFloat(lengthInput.value),
      width: parseFloat(widthInput.value),
      height: parseFloat(heightInput.value),
      rate: parseFloat(rateInput.value),
      total_sqft: parseFloat(totalSqftInput.value),
      total_amount: parseFloat(totalAmountInput.value),
    };

    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();

      if (res.ok) {
        alert('✅ Delivery saved successfully!');
        deliveryForm.reset();
        totalSqftInput.value = '';
        totalAmountInput.value = '';
      } else {
        throw new Error(result.message || 'Something went wrong.');
      }
    } catch (err) {
      console.error('❌ Save error:', err);
      alert('Failed to save delivery. Check console.');
    }
  });
});
