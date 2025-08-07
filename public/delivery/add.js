document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("deliveryForm");
  const lengthInput = document.getElementById("length");
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const rateInput = document.getElementById("rate");
  const totalSqftField = document.getElementById("total_sqft");
  const totalAmountField = document.getElementById("total_amount");

  // Recalculate when dimensions or rate change
  [lengthInput, widthInput, heightInput, rateInput].forEach(input => {
    input.addEventListener("input", updateTotals);
  });

  function updateTotals() {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftField.value = totalSqft.toFixed(2);
    totalAmountField.value = totalAmount.toFixed(2);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      slip_number: document.getElementById("slip_number").value,
      customer_id: document.getElementById("customer_id").value,
      vendor_id: document.getElementById("vendor_id").value,
      product_id: document.getElementById("product_id").value,
      vehicle_number: document.getElementById("vehicle_number").value,
      length: parseFloat(lengthInput.value),
      width: parseFloat(widthInput.value),
      height: parseFloat(heightInput.value),
      rate: parseFloat(rateInput.value),
      total_sqft: parseFloat(totalSqftField.value),
      total_amount: parseFloat(totalAmountField.value),
    };

    try {
      const response = await fetch("/api/deliveries/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Server error:", text);
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();
      console.log("Delivery saved:", result);
      alert("✅ Delivery saved successfully!");

      form.reset();
      updateTotals();

    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving delivery.");
    }
  });
});
