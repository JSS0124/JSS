document.addEventListener('DOMContentLoaded', () => {
  const BASE_URL = 'https://jss-pied.vercel.app';

  async function populateDropdown(endpoint, dropdownId) {
    try {
      const res = await fetch(`${BASE_URL}/${endpoint}`);
      const data = await res.json();
      const dropdown = document.getElementById(dropdownId);
      if (!dropdown) return;

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

  const lengthInput = document.getElementById('length_ft');
  const widthInput = document.getElementById('width_ft');
  const heightInput = document.getElementById('height_ft');
  const rateInput = document.getElementById('rate');
  const totalSqftInput = document.getElementById('total_sqft');
  const totalAmountInput = document.getElementById('total_amount');

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

  [lengthInput, widthInput, heightInput, rateInput].forEach(input => {
    input.addEventListener('input', calculateTotals);
  });

  // Submit form
  const form = document.getElementById('deliveryForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

   fetch('/api/deliveries/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(deliveryData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Delivery saved:', data);
})
.catch(err => {
  console.error('❌ Save error:', err);
});

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Unknown error');
      }

      alert('✅ Delivery saved successfully!');
      form.reset();
      totalSqftInput.value = '';
      totalAmountInput.value = '';
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Failed to save delivery. See console for details.');
    }
  });
});
