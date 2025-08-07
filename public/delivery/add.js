const BASE_URL = "https://jss-pied.vercel.app";

// Load dropdowns
async function loadDropdowns() {
  try {
    const [customers, vendors, products] = await Promise.all([
      fetch(`${BASE_URL}/api/customers`).then(res => res.json()),
      fetch(`${BASE_URL}/api/vendors`).then(res => res.json()),
      fetch(`${BASE_URL}/api/products`).then(res => res.json())
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

// Autofill rate on price level change
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

// Load deliveries into table
async function loadDeliveries() {
  try {
    const res = await fetch(`${BASE_URL}/api/deliveries`);
    const contentType = res.headers.get("content-type");

    if (!res.ok || !contentType.includes("application/json")) {
      throw new Error("Invalid response loading deliveries.");
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
      const res = await fetch(`${BASE_URL}/api/deliveries?id=${id}`, {
        method: "DELETE",
      });
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

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  data.length_ft = parseFloat(data.length_ft) || 0;
  data.width_ft = parseFloat(data.width_ft) || 0;
  data.height_ft = parseFloat(data.height_ft) || 0;
  data.total_sqft = parseFloat(document.getElementById("total_sqft").value) || 0;
  data.rate = parseFloat(data.rate) || 0;
  data.total_amount = parseFloat(document.getElementById("total_amount").value) || 0;

  data.customer_id = parseInt(data.customer_id) || null;
  data.vendor_id = parseInt(data.vendor_id) || null;
  data.product_id = parseInt(data.product_id) || null;
  data.vehicle_number = data.vehicle_number?.trim() || "";

  if (!data.date || !data.slip_number || !data.customer_id || !data.vendor_id || !data.product_id) {
    alert("⚠️ Required fields are missing.");
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
      console.error("❌ Unexpected response:", text);
      throw new Error("Invalid server response.");
    }

    const result = await res.json();

    if (result.success || result.message) {
      alert("✅ Delivery saved!");
      e.target.reset();
      document.getElementById("total_sqft").value = "";
      document.getElementById("total_amount").value = "";
      loadDeliveries();
    } else {
      alert("❌ Failed to save delivery.");
    }
  } catch (err) {
    console.error("❌ Save error:", err);
    alert("❌ Error: " + err.message);
  }
});

// Attach event listeners
["length_ft", "width_ft", "height_ft", "rate"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", calculateTotals);
});

document.getElementById("priceLevelSelect")?.addEventListener("change", updateRate);
document.getElementById("productSelect")?.addEventListener("change", updateRate);

document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();
  loadDeliveries();
});
