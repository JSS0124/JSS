async function fetchCustomers() {
  try {
    const res = await fetch("/api/customers");
    if (!res.ok) throw new Error("Failed to fetch customers");
    const data = await res.json();
    const tbody = document.querySelector("#customersTable tbody");
    tbody.innerHTML = "";

    data.forEach(customer => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${sanitizeHTML(customer.name)}</td>
        <td>${sanitizeHTML(customer.contact_person || "")}</td>
        <td>${sanitizeHTML(customer.contact_number || "")}</td>
        <td>${sanitizeHTML(customer.client_type)}</td>
        <td>${sanitizeHTML(customer.address || "")}</td>
        <td>${sanitizeHTML(customer.price_level)}</td>
        <td class="actions">
          <button onclick='editCustomer(${customer.id})'>Edit</button>
          <button class="delete" onclick="deleteCustomer(${customer.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    showError("Failed to load customers. Please try again.");
  }
}

async function addCustomer(e) {
  e.preventDefault();
  clearErrors();

  const id = document.getElementById("editId").value;
  const name = document.getElementById("name").value;
  const contactNumber = document.getElementById("contact_number").value;

  // Client-side validation
  if (!name) {
    showError("nameError", "Customer name is required");
    return;
  }
  if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
    showError("contactNumberError", "Enter a valid 10-digit phone number");
    return;
  }

  const payload = {
    name,
    contact_person: document.getElementById("contact_person").value,
    contact_number: contactNumber,
    client_type: document.getElementById("client_type").value,
    address: document.getElementById("address").value,
    price_level: document.getElementById("price_level").value,
  };

  try {
    const res = await fetch(`/api/customers${id ? "/" + id : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      resetForm();
      fetchCustomers();
    } else {
      const errorData = await res.json();
      showError("nameError", errorData.error || "Failed to save customer");
    }
  } catch (error) {
    showError("nameError", "Network error. Please try again.");
  }
}

function editCustomer(id) {
  fetch(`/api/customers/${id}`)
    .then(res => res.json())
    .then(customer => {
      document.getElementById("editId").value = customer.id;
      document.getElementById("name").value = customer.name;
      document.getElementById("contact_person").value = customer.contact_person || "";
      document.getElementById("contact_number").value = customer.contact_number || "";
      document.getElementById("client_type").value = customer.client_type;
      document.getElementById("address").value = customer.address || "";
      document.getElementById("price_level").value = customer.price_level;
    })
    .catch(() => showError("nameError", "Failed to load customer data"));
}

function resetForm() {
  document.getElementById("customerForm").reset();
  document.getElementById("editId").value = "";
  clearErrors();
}

async function deleteCustomer(id) {
  if (confirm("Are you sure you want to delete this customer?")) {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      } else {
        showError("nameError", "Failed to delete customer");
      }
    } catch (error) {
      showError("nameError", "Network error. Please try again.");
    }
  }
}

function showError(elementId, message) {
  document.getElementById(elementId).textContent = message;
}

function clearErrors() {
  document.querySelectorAll(".error").forEach(el => (el.textContent = ""));
}

// Simple XSS sanitization
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

document.getElementById("customerForm").addEventListener("submit", addCustomer);
fetchCustomers();
