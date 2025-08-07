document.addEventListener('DOMContentLoaded', () => {
  const customerSelect = document.getElementById('customer');
  const vendorSelect = document.getElementById('vendor');
  const productSelect = document.getElementById('product');
  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const rateInput = document.getElementById('rate');
  const totalSqftInput = document.getElementById('total_sqft');
  const totalAmountInput = document.getElementById('total_amount');
  const form = document.getElementById('delivery-form');

  async function fetchDropdownData(endpoint, selectElement) {
    try {
      const response = await fetch(`/api/${endpoint}`);
      const data = await response.json();

      selectElement.innerHTML = '<option value="">Select</option>';
      data.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name || item.customer_name || item.vendor_name || item.product_name;
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error(`Failed to load ${endpoint}`, error);
    }
  }

  // Load dropdowns
  fetch(`${BASE_URL}/customers`);
  fetch(`${BASE_URL}/vendors`));
  fetch(`${BASE_URL}/products`);

  // Auto-calculate total_sqft and total_amount
  [lengthInput, widthInput, heightInput, rateInput].forEach(input => {
    input.addEventListener('input', () => {
      const length = parseFloat(lengthInput.value) || 0;
      const width = parseFloat(widthInput.value) || 0;
      const height = parseFloat(heightInput.value) || 1;
      const rate = parseFloat(rateInput.value) || 0;

      const totalSqft = length * width * height;
      const totalAmount = totalSqft * rate;

      totalSqftInput.value = totalSqft.toFixed(2);
      totalAmountInput.value = totalAmount.toFixed(2);
    });
  });

  // Submit delivery
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      customer_id: customerSelect.value,
      vendor_id: vendorSelect.value,
      product_id: productSelect.value,
      vehicle_number: document.getElementById('vehicle_number').value,
      length: parseFloat(lengthInput.value) || 0,
      width: parseFloat(widthInput.value) || 0,
      height: parseFloat(heightInput.value) || 1,
      rate: parseFloat(rateInput.value) || 0,
      total_sqft: parseFloat(totalSqftInput.value) || 0,
      total_amount: parseFloat(totalAmountInput.value) || 0,
      slip_number: document.getElementById('slip_number').value,
    };

    try {
      const response = await fetch('/api/deliveries/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save delivery');
      }

      const result = await response.json();
      alert('✅ Delivery saved successfully!');
      form.reset();
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('❌ Failed to save delivery. Check console.');
    }
  });
});
