
const BASE_URL = "https://jss-pied.vercel.app";

let allDeliveries = [];
let customers = [];
let vendors = [];
let products = [];

// Load initial data
async function loadInitialData() {
  try {
    const [deliveriesRes, customersRes, vendorsRes, productsRes] = await Promise.all([
      fetch(`${BASE_URL}/deliveries`),
      fetch(`${BASE_URL}/customers`),
      fetch(`${BASE_URL}/vendors`),
      fetch(`${BASE_URL}/products`)
    ]);

    allDeliveries = await deliveriesRes.json();
    customers = await customersRes.json();
    vendors = await vendorsRes.json();
    products = await productsRes.json();

    populateFilters();
    populateEditDropdowns();
    displayDeliveries(allDeliveries);
  } catch (err) {
    console.error("Error loading initial data:", err);
    alert("Error loading data. Please refresh the page.");
  }
}

// Populate filter dropdowns
function populateFilters() {
  const customerFilter = document.getElementById("customerFilter");
  const vendorFilter = document.getElementById("vendorFilter");

  customers.forEach(customer => {
    customerFilter.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
  });

  vendors.forEach(vendor => {
    vendorFilter.innerHTML += `<option value="${vendor.id}">${vendor.name}</option>`;
  });
}

// Populate edit modal dropdowns
function populateEditDropdowns() {
  const editCustomer = document.getElementById("editCustomer");
  const editVendor = document.getElementById("editVendor");
  const editProduct = document.getElementById("editProduct");

  customers.forEach(customer => {
    editCustomer.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
  });

  vendors.forEach(vendor => {
    editVendor.innerHTML += `<option value="${vendor.id}">${vendor.name}</option>`;
  });

  products.forEach(product => {
    editProduct.innerHTML += `<option value="${product.id}" data-price="${product.price}" data-price1="${product.price1}" data-price2="${product.price2}" data-price3="${product.price3}">${product.name}</option>`;
  });
}

// Display deliveries in table
function displayDeliveries(deliveries) {
  const tableBody = document.querySelector("#deliveryTable tbody");
  tableBody.innerHTML = "";

  deliveries.forEach(delivery => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${new Date(delivery.date).toLocaleDateString()}</td>
      <td>${delivery.slip_number}</td>
      <td>${delivery.customer_name}</td>
      <td>${delivery.vehicle_number}</td>
      <td>${delivery.product_name}</td>
      <td>${delivery.vendor_name}</td>
      <td>${delivery.total_sqft}</td>
      <td>${delivery.rate}</td>
      <td>${delivery.total_amount}</td>
      <td>
        <button class="btn btn-edit" onclick="editDelivery(${delivery.id})">Edit</button>
        <button class="btn btn-delete" onclick="deleteDelivery(${delivery.id})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Filter deliveries
function filterDeliveries() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const dateFilter = document.getElementById("dateFilter").value;
  const customerFilter = document.getElementById("customerFilter").value;
  const vendorFilter = document.getElementById("vendorFilter").value;

  let filtered = allDeliveries.filter(delivery => {
    const matchesSearch = 
      delivery.slip_number.toLowerCase().includes(searchTerm) ||
      delivery.customer_name.toLowerCase().includes(searchTerm) ||
      delivery.vehicle_number.toLowerCase().includes(searchTerm);
    
    const matchesDate = !dateFilter || delivery.date === dateFilter;
    const matchesCustomer = !customerFilter || delivery.customer_id == customerFilter;
    const matchesVendor = !vendorFilter || delivery.vendor_id == vendorFilter;

    return matchesSearch && matchesDate && matchesCustomer && matchesVendor;
  });

  displayDeliveries(filtered);
}

// Edit delivery
function editDelivery(id) {
  const delivery = allDeliveries.find(d => d.id === id);
  if (!delivery) return;

  document.getElementById("editId").value = delivery.id;
  document.getElementById("editDate").value = delivery.date;
  document.getElementById("editSlipNumber").value = delivery.slip_number;
  document.getElementById("editCustomer").value = delivery.customer_id;
  document.getElementById("editVehicle").value = delivery.vehicle_number;
  document.getElementById("editProduct").value = delivery.product_id;
  document.getElementById("editVendor").value = delivery.vendor_id;
  document.getElementById("editFoot").value = delivery.foot;
  document.getElementById("editAz").value = delivery.az;
  document.getElementById("editSize").value = delivery.size;
  document.getElementById("editTotalSqft").value = delivery.total_sqft;
  document.getElementById("editPriceLevel").value = delivery.price_level || 'price';
  document.getElementById("editRate").value = delivery.rate;
  document.getElementById("editTotalAmount").value = delivery.total_amount;
  document.getElementById("editRemarks").value = delivery.remarks || '';

  document.getElementById("editModal").style.display = "block";
}

// Delete delivery
async function deleteDelivery(id) {
  if (!confirm("Are you sure you want to delete this delivery?")) return;

  try {
    const response = await fetch(`${BASE_URL}/deliveries/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Delivery deleted successfully!");
      loadInitialData(); // Reload data
    } else {
      alert("Error deleting delivery.");
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("Error deleting delivery.");
  }
}

// Calculate totals in edit form
function calculateEditTotals() {
  const foot = parseFloat(document.getElementById("editFoot").value) || 0;
  const az = parseFloat(document.getElementById("editAz").value) || 0;
  const size = parseFloat(document.getElementById("editSize").value) || 0;
  const rate = parseFloat(document.getElementById("editRate").value) || 0;

  const sqft = foot * az * size;
  const total = sqft * rate;

  document.getElementById("editTotalSqft").value = sqft.toFixed(2);
  document.getElementById("editTotalAmount").value = total.toFixed(2);
}

// Update rate when price level/product changes in edit form
function updateEditRate() {
  const selectedProduct = document.getElementById("editProduct").selectedOptions[0];
  const level = document.getElementById("editPriceLevel").value;
  const rateValue = selectedProduct?.dataset[level];

  if (rateValue && !isNaN(rateValue)) {
    document.getElementById("editRate").value = rateValue;
  }

  calculateEditTotals();
}

// Close modal
function closeModal() {
  document.getElementById("editModal").style.display = "none";
}

// Event listeners
document.getElementById("searchInput").addEventListener("input", filterDeliveries);
document.getElementById("dateFilter").addEventListener("change", filterDeliveries);
document.getElementById("customerFilter").addEventListener("change", filterDeliveries);
document.getElementById("vendorFilter").addEventListener("change", filterDeliveries);

// Edit form event listeners
["editFoot", "editAz", "editSize", "editRate"].forEach(id => {
  document.getElementById(id).addEventListener("input", calculateEditTotals);
});
document.getElementById("editPriceLevel").addEventListener("change", updateEditRate);
document.getElementById("editProduct").addEventListener("change", updateEditRate);

// Modal close events
document.querySelector(".close").addEventListener("click", closeModal);
window.addEventListener("click", (event) => {
  if (event.target === document.getElementById("editModal")) {
    closeModal();
  }
});

// Edit form submission
document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    date: document.getElementById("editDate").value,
    slip_number: document.getElementById("editSlipNumber").value,
    customer_id: parseInt(document.getElementById("editCustomer").value),
    vehicle_number: document.getElementById("editVehicle").value,
    product_id: parseInt(document.getElementById("editProduct").value),
    vendor_id: parseInt(document.getElementById("editVendor").value),
    foot: parseFloat(document.getElementById("editFoot").value),
    az: parseFloat(document.getElementById("editAz").value),
    size: parseFloat(document.getElementById("editSize").value),
    total_sqft: parseFloat(document.getElementById("editTotalSqft").value),
    price_level: document.getElementById("editPriceLevel").value,
    rate: parseFloat(document.getElementById("editRate").value),
    total_amount: parseFloat(document.getElementById("editTotalAmount").value),
    remarks: document.getElementById("editRemarks").value
  };

  try {
    const response = await fetch(`${BASE_URL}/deliveries/${document.getElementById("editId").value}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      alert("Delivery updated successfully!");
      closeModal();
      loadInitialData(); // Reload data
    } else {
      alert("Error updating delivery.");
    }
  } catch (err) {
    console.error("Update error:", err);
    alert("Error updating delivery.");
  }
});

// Initialize
loadInitialData();
