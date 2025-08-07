const BASE_URL = "https://jss-pied.vercel.app";

// Load dropdowns
async function loadDropdowns() {
  try {
    const [customers, vendors, products] = await Promise.all([
      fetch(`${BASE_URL}/customers`).then(res => res.json()),
      fetch(`${BASE_URL}/vendors`).then(res => res.json()),
      fetch(`${BASE_URL}/products`).then(res => res.json())
    ]);

    const customerSelect = document.getElementById("customerSelect");
    const vendorSelect = document.getElementById("vendorSelect");
    const productSelect = document.getElementById("productSelect");

    customerSelect.innerHTML = '<option value="">Select Customer</option>';
    vendorSelect.innerHTML = '<option value="">Select Vendor</option>';
    productSelect.innerHTML = '<option value="">Select Product</option>';

    customers.forEach(c => {
      customerSelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });

    vendors.forEach(v => {
      vendorSelect.innerHTML += `<option value="${v.id}">${v.name}</option>`;
    });

    products.forEach(p => {
      productSelect.innerHTML += `<option value="${p.id}" data-price="${p.price}" data-price1="${p.price1}" data-price2="${p.price2}" data-price3="${p.price3}">${p.name}</option>`;
    });

  } catch (err) {
    console.error("❌ Error loading dropdowns:", err);
  }
}

// Calculate sqft and total
function calculateTotals() {
  const length = parseFloat(document.getElementById("length_ft").value) || 0;
  const width = parseFloat(document.getElementById("width_ft").value) || 0;
  const height = parseFloat(document.getElementById("height_ft").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;

  const sqft = length * width * height;
  const total = sqft * rate;

  document.getElementById("total_sqft").value = sqft.toFixed(2);
  document.getElementById("total_amount").value = total.toFixed(2);
}

// Update rate based on price level
function updateRate() {
  const selectedProduct = document.getElementById("productSelect").selectedOptions[0];
  const level = document.getElementById("priceLevelSelect").value;
  const rateValue = selectedProduct?.dataset[level];

  if (rateValue && !isNaN(rateValue)) {
    document.getElementById("rate").value = rateValue;
  } else {
    document.getElementById("rate").value = "";
  }

  calculateTotals();
}

// Load deliveries table
async function loadDeliveries() {
  try {
    const res = await fetch(`${BASE_URL}/deliveries`);
    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Invalid JSON response from server.");
    }

    const data = await res.json();
    const tableBody = document.querySelector("#deliveryTable tbody");
    tableBody.innerHTML = "";

    data.forEach(d => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${d.date}</td>
        <td>${d.slip_number}</td>
        <td>${d.customer_name}</td>
        <td>${d.vehicle_number || ''}</td>
        <td>${d.product_name}</td>
        <td>${d.vendor_name}</td>
        <td>${d.total_sqft}</td>
        <td>${d.rate}</td>
        <td>${d.total_amount}</td>
        <td><button onclick="deleteDelivery(${d.id})">Delete</button></td>
      `;
      tableBody.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Error loading deliveries:", err);
  }
}

// Delete delivery
async function deleteDelivery(id) {
  if (confirm("Delete this delivery?")) {
    try {
      const res = await fetch(`${BASE_URL}/delivery?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) loadDeliveries();
    } catch (err) {
      console.error("❌ Error deleting delivery:", err);
    }
  }
}

// Handle form submission
document.getElementById("deliveryForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.target;
  const data = {
    date: form.date.value,
    slip_number: form.slip_number.value,
    customer_id: parseInt(form.customerSelect.value),
    vendor_id: parseInt(form.vendorSelect.value),
    product_id: parseInt(form.productSelect.value),
    price_level: form.priceLevelSelect.value,
    vehicle_number: form.vehicle_number.value || "",
    length_ft: parseFloat(form.length_ft.value) || 0,
    width_ft: parseFloat(form.width_ft.value) || 0,
    height_ft: parseFloat(form.height_ft.value) || 0,
    rate: parseFloat(form.rate.value) || 0,
    total_sqft: parseFloat(document.getElementById("total_sqft").value) || 0,
    total_amount: parseFloat(document.getElementById("total_amount").value) || 0
  };

  if (!data.date || !data.slip_number || !data.customer_id || !data.vendor_id || !data.product_id) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/deliveries/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error("Invalid server response:\n" + text);
    }

    const result = await res.json();

    if (result.success || result.message === "Delivery added") {
      alert("✅ Delivery saved!");
      form.reset();
      document.getElementById("total_sqft").value = "";
      document.getElementById("total_amount").value = "";
      loadDeliveries();
    } else {
      alert("Error saving delivery: " + (result.error || "Unknown error"));
    }
  } catch (err) {
    console.error("❌ Save error:", err);
    alert("Failed to save delivery. Check console.");
  }
});

// Attach listeners
["length_ft", "width_ft", "height_ft", "rate"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", calculateTotals);
});

if (document.getElementById("priceLevelSelect")) {
  document.getElementById("priceLevelSelect").addEventListener("change", updateRate);
}

if (document.getElementById("productSelect")) {
  document.getElementById("productSelect").addEventListener("change", updateRate);
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();
  loadDeliveries();
});
