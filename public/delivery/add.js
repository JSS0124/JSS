document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("delivery-form");
  const deliveriesTable = document.getElementById("deliveries-table-body");

  const rateInput = document.getElementById("rate");
  const totalSqftInput = document.getElementById("total_sqft");
  const totalAmountInput = document.getElementById("total_amount");

  // Live calculation for total_sqft and total_amount
  function calculateTotals() {
    const length = parseFloat(document.getElementById("length").value) || 0;
    const width = parseFloat(document.getElementById("width").value) || 0;
    const height = parseFloat(document.getElementById("height").value) || 1;
    const rate = parseFloat(rateInput.value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftInput.value = totalSqft.toFixed(2);
    totalAmountInput.value = totalAmount.toFixed(2);
  }

  // Trigger calculation on input changes
  ["length", "width", "height", "rate"].forEach(id => {
    document.getElementById(id).addEventListener("input", calculateTotals);
  });

  // Load existing deliveries
  async function loadDeliveries() {
    try {
      const res = await fetch("https://jss-pied.vercel.app/api/deliveries");
      if (!res.ok) throw new Error("Invalid JSON response from server.");
      const deliveries = await res.json();

      deliveriesTable.innerHTML = "";
      deliveries.forEach(delivery => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${delivery.slip_number}</td>
          <td>${delivery.vehicle_number}</td>
          <td>${delivery.customer_name}</td>
          <td>${delivery.vendor_name}</td>
          <td>${delivery.product_name}</td>
          <td>${delivery.length_ft}</td>
          <td>${delivery.width_ft}</td>
          <td>${delivery.height_ft}</td>
          <td>${delivery.total_sqft}</td>
          <td>${delivery.rate}</td>
          <td>${delivery.total_amount}</td>
          <td>${delivery.notes || ""}</td>
        `;
        deliveriesTable.appendChild(row);
      });
    } catch (err) {
      console.error("Error loading deliveries:", err);
    }
  }

  loadDeliveries();

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://jss-pied.vercel.app/api/deliveries/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error("Unexpected response: " + errText);
      }

      alert("✅ Delivery saved!");
      form.reset();
      calculateTotals();
      loadDeliveries();
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving delivery: " + err.message);
    }
  });
});
