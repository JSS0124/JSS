document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
  loadProducts();
  loadVendors();
  attachAutoCalculations();

  const deliveryForm = document.getElementById("deliveryForm");
  deliveryForm.addEventListener("submit", handleSubmit);
});

// Load Customers into dropdown
function loadCustomers() {
  fetch("/api/customers")
    .then((res) => res.json())
    .then((data) => {
      const select = document.getElementById("customerSelect");
      select.innerHTML = '<option value="">Select Customer</option>';
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name.trim();
        select.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load customers", err));
}

// Load Products into dropdown
function loadProducts() {
  fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      const select = document.getElementById("productSelect");
      select.innerHTML = '<option value="">Select Product</option>';
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load products", err));
}

// Load Vendors into dropdown
function loadVendors() {
  fetch("/api/vendors")
    .then((res) => res.json())
    .then((data) => {
      const select = document.getElementById("vendorSelect");
      select.innerHTML = '<option value="">Select Vendor</option>';
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name.trim();
        select.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load vendors", err));
}

// Auto-calculate Total Sqft and Total Amount
function attachAutoCalculations() {
  const lengthInput = document.getElementById("length");
  const widthInput = document.getElementById("width");
  const rateInput = document.getElementById("rate");

  [lengthInput, widthInput, rateInput].forEach((input) => {
    input.addEventListener("input", calculateTotals);
  });
}

function calculateTotals() {
  const length = parseFloat(document.getElementById("length").value) || 0;
  const width = parseFloat(document.getElementById("width").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;

  const totalSqft = length * width;
  const totalAmount = totalSqft * rate;

  document.getElementById("total_sqft").value = totalSqft.toFixed(2);
  document.getElementById("total_amount").value = totalAmount.toFixed(2);
}

// Handle form submission
function handleSubmit(event) {
  event.preventDefault();

  const formData = {
    date: document.getElementById("date").value,
    slip_no: document.getElementById("slipNo").value,
    vehicle_no: document.getElementById("vehicleNo").value,
    customer_id: document.getElementById("customerSelect").value,
    product_id: document.getElementById("productSelect").value,
    vendor_id: document.getElementById("vendorSelect").value,
    length: parseFloat(document.getElementById("length").value) || 0,
    width: parseFloat(document.getElementById("width").value) || 0,
    rate: parseFloat(document.getElementById("rate").value) || 0,
    total_sqft: parseFloat(document.getElementById("total_sqft").value) || 0,
    total_amount: parseFloat(document.getElementById("total_amount").value) || 0,
  };

  fetch("/api/deliveries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to save delivery");
      return res.json();
    })
    .then((data) => {
      alert("✅ Delivery saved successfully!");
      document.getElementById("deliveryForm").reset();
      document.getElementById("total_sqft").value = "";
      document.getElementById("total_amount").value = "";
    })
    .catch((err) => {
      console.error("Save error:", err);
      alert("❌ Failed to save delivery. See console for details.");
    });
}
