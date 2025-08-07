document.addEventListener('DOMContentLoaded', async () => {
  const customerSelect = document.getElementById('customer');
  const vendorSelect = document.getElementById('vendor');
  const productSelect = document.getElementById('product');
  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const rateInput = document.getElementById('rate');
  const totalSqftInput = document.getElementById('total_sqft');
  const totalAmountInput = document.getElementById('total_amount');
  const form = document.getElementById('deliveryForm');

  // Helper to fetch and populate dropdowns
  async function populateDropdown(apiEndpoint, selectElement) {
    try {
      const res = await fetch(apiEndpoint);
      const data = await res.json();
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name || item.customer_name || item.vendor_name || item.product_name;
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error(`Error loading ${apiEndpoint}`, error);
    }
  }

  await populateDropdown('/api/customers', customerSelect);
  await populateDropdown('/api/vendors', vendorSelect);
  await populateDropdown('/api/products', productSelect);

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

  form.addEventListener('submit', async (e) => {
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
      const res = await fetch('/api/deliveries/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (res.ok) {
        alert('Delivery saved successfully!');
        form.reset();
      } else {
        console.error('Error saving delivery:', result);
        alert('Error saving delivery: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form.');
    }
  });
});
