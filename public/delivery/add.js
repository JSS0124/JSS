document.addEventListener("DOMContentLoaded", async () => {
  await loadDropdown("customers");
  await loadDropdown("vendors");
  await loadDropdown("products");

  document.getElementById("delivery-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      slip_number: document.getElementById("slip_number").value,
      vehicle_number: document.getElementById("vehicle_number").value,
      customer_id: document.getElementById("customer_id").value,
      vendor_id: document.getElementById("vendor_id").value,
      product_id: document.getElementById("product_id").value,
      length_ft: document.getElementById("length_ft").value,
      width_ft: document.getElementById("width_ft").value,
      height_ft: document.getElementById("height_ft").value,
      date: document.getElementById("date").value,
      notes: document.getElementById("notes").value,
    };

    const res = await fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      alert("Delivery added successfully!");
      location.reload();
    } else {
      alert("Error saving delivery.");
    }
  });
});

async function loadDropdown(endpoint) {
  const res = await fetch(`/api/${endpoint}`);
  const data = await res.json();
  const select = document.getElementById(`${endpoint.slice(0, -1)}_id`);

  data.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}
