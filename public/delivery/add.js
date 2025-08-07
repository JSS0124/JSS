async function populateDropdown(url, selectId, labelKey) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const select = document.getElementById(selectId);
    if (!select) {
      console.error(`❌ Select element with ID '${selectId}' not found`);
      return;
    }

    data.forEach(item => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item[labelKey];
      select.appendChild(option);
    });
  } catch (error) {
    console.error(`❌ Failed to load ${selectId}:`, error);
  }
}

// Load dropdowns
populateDropdown("/api/customers", "customer", "customer_name");
populateDropdown("/api/vendors", "vendor", "vendor_name");
populateDropdown("/api/products", "product", "product_name");

// Calculate total_sqft and total_amount
["length_ft", "width_ft", "height_ft", "rate"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", calculateTotals);
});

function calculateTotals() {
  const l = parseFloat(document.getElementById("length_ft").value) || 0;
  const w = parseFloat(document.getElementById("width_ft").value) || 0;
  const h = parseFloat(document.getElementById("height_ft").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;

  const totalSqft = l * w * h;
  const totalAmount = totalSqft * rate;

  document.getElementById("total_sqft").value = totalSqft.toFixed(2);
  document.getElementById("total_amount").value = totalAmount.toFixed(2);
}

// Submit form
document.getElementById("deliveryForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/api/deliveries/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("✅ Delivery saved successfully!");
      this.reset();
      document.getElementById("total_sqft").value = "";
      document.getElementById("total_amount").value = "";
    } else {
      const error = await response.text();
      alert("❌ Failed to save: " + error);
    }
  } catch (err) {
    console.error("❌ Error submitting form:", err);
    alert("❌ Error submitting form.");
  }
});
