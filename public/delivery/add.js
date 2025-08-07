document.addEventListener("DOMContentLoaded", async () => {
  const productSelect = document.getElementById("product");
  const vendorSelect = document.getElementById("vendor");
  const customerSelect = document.getElementById("customer");
  const lengthInput = document.getElementById("length");
  const widthInput = document.getElementById("width");
  const heightInput = document.getElementById("height");
  const totalSqftInput = document.getElementById("total_sqft");
  const rateInput = document.getElementById("rate");
  const totalAmountInput = document.getElementById("total_amount");
  const form = document.getElementById("delivery-form");

  const fetchAndPopulate = async (url, select) => {
    try {
      const res = await fetch(url);
      const items = await res.json();
      items.forEach(item => {
        const opt = document.createElement("option");
        opt.value = item.id;
        opt.textContent = item.name;
        select.appendChild(opt);
      });
    } catch (error) {
      console.error(`❌ Error loading ${url}:`, error);
    }
  };

  await fetchAndPopulate("/api/products", productSelect);
  await fetchAndPopulate("/api/vendors", vendorSelect);
  await fetchAndPopulate("/api/customers", customerSelect);

  const updateTotals = () => {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    const height = parseFloat(heightInput.value) || 0;
    const rate = parseFloat(rateInput.value) || 0;

    const sqft = length * width * height;
    totalSqftInput.value = sqft.toFixed(2);

    const amount = sqft * rate;
    totalAmountInput.value = amount.toFixed(2);
  };

  [lengthInput, widthInput, heightInput, rateInput].forEach(input =>
    input.addEventListener("input", updateTotals)
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      slip_number: document.getElementById("slip_number").value,
      vehicle_number: document.getElementById("vehicle_number").value,
      customer_id: customerSelect.value,
      vendor_id: vendorSelect.value,
      product_id: productSelect.value,
      length_ft: lengthInput.value,
      width_ft: widthInput.value,
      height_ft: heightInput.value,
      rate: rateInput.value,
      total_sqft: totalSqftInput.value,
      total_amount: totalAmountInput.value,
      notes: document.getElementById("notes").value,
      date: document.getElementById("date").value
    };

    try {
      const response = await fetch("/api/deliveries/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Invalid server response:\n${errorText}`);
      }

      const result = await response.json();
      alert("✅ Delivery saved!");
      form.reset();
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("❌ Failed to save delivery.");
    }
  });
});
