document.addEventListener("DOMContentLoaded", async () => {
  const customerSelect = document.getElementById("customer");
  const vendorSelect = document.getElementById("vendor");
  const productSelect = document.getElementById("product");

  const lengthInput = document.getElementById("length");
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const rateInput = document.getElementById("rate");

  const totalSqftInput = document.getElementById("total_sqft");
  const totalAmountInput = document.getElementById("total_amount");

  const form = document.getElementById("delivery-form");

  // Helper: fetch and populate dropdowns
  async function populateDropdown(endpoint, selectElement) {
    try {
      const res = await fetch(`/api/${endpoint}`);
      const data = await res.json();
      selectElement.innerHTML = `<option value="">Select ${endpoint}</option>`;
      data.forEach(item => {
        selectElement.innerHTML += `<option value="${item.id}">${item.name}</option>`;
      });
    } catch (err) {
      console.error(`❌ Failed to load ${endpoint}:`, err);
    }
  }

  // Load dropdowns
  await populateDropdown("customers", customerSelect);
  await populateDropdown("vendors", vendorSelect);
  await populateDropdown("products", productSelect);

  // Recalculate sqft and amount
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
    input.addEventListener("input", calculateTotals);
  });

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      slip_number: document.getElementById("slip_number").value,
      vehicle_number: document.getElementById("vehicle_number").value,
      customer_id: customerSelect.value,
      vendor_id: vendorSelect.value,
      product_id: productSelect.value,
      length_ft: parseFloat(lengthInput.value),
      width_ft: parseFloat(widthInput.value),
      height_ft: parseFloat(heightInput.value),
      rate: parseFloat(rateInput.value),
      total_sqft: parseFloat(totalSqftInput.value),
      total_amount: parseFloat(totalAmountInput.value),
      notes: document.getElementById("notes").value,
      date: document.getElementById("date").value,
    };

    try {
      const response = await fetch("/api/deliveries/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Delivery saved!");
        form.reset();
        totalSqftInput.value = "";
        totalAmountInput.value = "";
      } else {
        console.error("❌ Failed:", result);
        alert("❌ Failed to save delivery.");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      alert("❌ Network or server error.");
    }
  });
});
