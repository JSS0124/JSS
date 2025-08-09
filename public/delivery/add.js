document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deliveryForm");

  const lengthInput = document.getElementById("length_ft");
  const widthInput = document.getElementById("width_ft");
  const heightInput = document.getElementById("height_ft");
  const totalSqftInput = document.getElementById("total_sqft");
  const rateInput = document.getElementById("rate");
  const totalAmountInput = document.getElementById("total_amount");

  // Auto-calc Total Sqft & Total Amount
  function updateTotals() {
    const l = parseFloat(lengthInput.value) || 0;
    const w = parseFloat(widthInput.value) || 0;
    const h = parseFloat(heightInput.value) || 0;
    const sqft = l * w * h;
    totalSqftInput.value = sqft.toFixed(2);

    const rate = parseFloat(rateInput.value) || 0;
    totalAmountInput.value = (sqft * rate).toFixed(2);
  }

  [lengthInput, widthInput, heightInput, rateInput].forEach(el => {
    el.addEventListener("input", updateTotals);
  });

  // Populate dropdowns
  async function populateSelect(id, endpoint, valueKey = "id", textKey = "name") {
    const select = document.getElementById(id);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      select.innerHTML = `<option value="">Select</option>`;
      data.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item[valueKey];
        opt.textContent = item[textKey];
        select.appendChild(opt);
      });
    } catch (err) {
      console.error(`Error loading ${id}:`, err);
    }
  }

  populateSelect("customer", "/api/customers", "id", "name");
  populateSelect("vendor", "/api/vendors", "id", "name");
  populateSelect("product", "/api/products", "id", "name");

  // Handle form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/deliveries/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Delivery saved successfully!");
        form.reset();
        totalSqftInput.value = "";
        totalAmountInput.value = "";
      } else {
        alert(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to save delivery.");
    }
  });
});
