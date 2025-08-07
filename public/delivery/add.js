document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'https://jss-pied.vercel.app/api';

  async function populateDropdown(endpoint, dropdownId) {
    try {
      const res = await fetch(`${BASE_URL}/${endpoint}`);
      const data = await res.json();
      const dropdown = document.getElementById(dropdownId);
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        dropdown.appendChild(option);
      });
    } catch (error) {
      console.error(`❌ Failed to load ${endpoint}:`, error);
    }
  }

  populateDropdown('customers', 'customer');
  populateDropdown('vendors', 'vendor');
  populateDropdown('products', 'product');

  // ✅ Total sqft and amount calculations
  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const rateInput = document.getElementById('rate');
  const totalSqftInput = document.getElementById('total_sqft');
  const totalAmountInput = document.getElementById('total_amount');

  const inputs = [lengthInput, widthInput, heightInput, rateInput];

  inputs.forEach(input => {
    if (input) {
      input.addEventListener('input', calculateTotals);
    }
  });

  function calculateTotals() {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 1;
    const rate = parseFloat(rateInput.value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftInput.value = totalSqft.toFixed(2);
    totalAmountInput.value = totalAmount.toFixed(2);
  }
});
