document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("deliveryForm");
  const totalSqftField = document.getElementById("total_sqft");
  const totalAmountField = document.getElementById("total_amount");

  // Recalculate when dimensions or rate change
  ["length_ft", "width_ft", "height_ft", "rate"].forEach(id => {
    document.getElementById(id).addEventListener("input", calculateTotals);
  });

  async function calculateTotals() {
    const length = parseFloat(document.getElementById("length_ft").value) || 0;
    const width = parseFloat(document.getElementById("width_ft").value) || 0;
    const height = parseFloat(document.getElementById("height_ft").value) || 0;
    const rate = parseFloat(document.getElementById("rate").value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftField.value = totalSqft.toFixed(2);
    totalAmountField.value = totalAmount.toFixed(2);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      slip_number: document.getElementById("slip_number").value,
      vehicle_number: document.getElementById("vehicle_number").value,
      customer_id: document.getElementById("customer").value,
      vendor_id: document.getElementById("vendor").value,
      product_id: document.getElementById("product").value,
      length_ft: document.getElementById("length_ft").value,
      width_ft: document.getElementById("width_ft").value,
      height_ft: document.getElementById("height_ft").value,
      total_sqft: totalSqftField.value,
      rate: document.getElementById("rate").value,
      total_amount: totalAmountField.value,
      notes: document.getElementById("notes").value,
      date: document.getElementById("date").value,
    };

    try {
      const response = await fetch("/api/deliveries/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Invalid server response. Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("✅ Delivery saved successfully!");
        form.reset();
      } else {
        throw new Error("Failed to save delivery.");
      }

    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving delivery: " + err.message);
    }
  });
});
