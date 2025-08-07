document.getElementById("delivery-form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    customer: document.getElementById("customer").value,
    vendor: document.getElementById("vendor").value,
    product: document.getElementById("product").value,
    vehicle_no: document.getElementById("vehicle_no").value,
    length: parseFloat(document.getElementById("length").value),
    width: parseFloat(document.getElementById("width").value),
    height: parseFloat(document.getElementById("height").value),
    rate: parseFloat(document.getElementById("rate").value),
    total_sqft: parseFloat(document.getElementById("total_sqft").value),
    total_amount: parseFloat(document.getElementById("total_amount").value),
  };

  try {
    const response = await fetch("/api/deliveries/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Server responded with ${response.status}: ${errorData}`);
    }

    const result = await response.json();
    alert("✅ Delivery saved successfully");
    console.log("Server response:", result);
  } catch (error) {
    console.error("❌ Save error:", error.message);
    alert("❌ Failed to save delivery. Check console for details.");
  }
});
