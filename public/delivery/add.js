const BASE = "/api"; // relative suffix works on Vercel

async function loadDropdowns() {
  const [customers, vendors, products] = await Promise.all([
    fetch(`${BASE}/customers`).then(r => r.json()),
    fetch(`${BASE}/vendors`).then(r => r.json()),
    fetch(`${BASE}/products`).then(r => r.json())
  ]);
  const c = document.getElementById("customerSelect");
  const v = document.getElementById("vendorSelect");
  const p = document.getElementById("productSelect");
  customers.forEach(x => c.insertAdjacentHTML("beforeend", `<option value="${x.id}">${x.name}</option>`));
  vendors.forEach(x => v.insertAdjacentHTML("beforeend", `<option value="${x.id}">${x.name}</option>`));
  products.forEach(x => p.insertAdjacentHTML("beforeend", `<option value="${x.id}" data-price="${x.price}">${x.name}</option>`));
}

function calculateTotals() {
  const foot = parseFloat(document.querySelector("[name='length_ft']").value) || 0;
  const width = parseFloat(document.querySelector("[name='width_ft']").value) || 0;
  const rate = parseFloat(document.querySelector("[name='rate']").value) || 0;
  const sqft = (foot * width).toFixed(2);
  document.querySelector("[name='total_sqft']").value = sqft;
  document.querySelector("[name='total_amount']").value = (sqft * rate).toFixed(2);
}

function updateRate() {
  const sel = document.getElementById("productSelect");
  const lvl = sel.selectedOptions[0]?.dataset.price;
  document.querySelector("[name='rate']").value = lvl || '';
  calculateTotals();
}

async function loadDeliveries() {
  const res = await fetch(`${BASE}`);
  const rows = await res.json();
  const tbody = document.querySelector("#deliveryTable tbody");
  tbody.innerHTML = "";
  rows.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.date}</td><td>${d.slip_number}</td><td>${d.customer_name}</td><td>${d.vendor_name}</td>
      <td>${d.product_name}</td><td>${d.vehicle_number}</td><td>${d.total_sqft}</td>
      <td>${d.rate}</td><td>${d.total_amount}</td><td>${d.notes || ''}</td>`;
    tbody.append(tr);
  });
}

document.getElementById("deliveryForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  calculateTotals();
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (res.ok && json.success) {
      alert("Delivery saved");
      e.target.reset();
      loadDeliveries();
    } else {
      alert("Error: " + (json.message || json.error));
    }
  } catch(err) {
    console.error(err);
    alert("Network/server error");
  }
});

["length_ft", "width_ft", "rate"].forEach(name => {
  document.getElementsByName(name)[0].addEventListener("input", calculateTotals);
});

document.getElementById("productSelect").addEventListener("change", updateRate);

document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();
  loadDeliveries();
});
