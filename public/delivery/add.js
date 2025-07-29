const BASE_URL = "https://jss-pied.vercel.app";

// Load dropdowns with fallback data
async function loadDropdowns() {
  try {
    // Try to load from API first, if fails use hardcoded data
    let customers, vendors, products;
    
    try {
      const responses = await Promise.all([
        fetch(`${BASE_URL}/api/customers`).then(res => {
          if (!res.ok) throw new Error('API not available');
          return res.json();
        }),
        fetch(`${BASE_URL}/api/vendors`).then(res => {
          if (!res.ok) throw new Error('API not available');
          return res.json();
        }),
        fetch(`${BASE_URL}/api/products`).then(res => {
          if (!res.ok) throw new Error('API not available');
          return res.json();
        })
      ]);
      
      customers = responses[0];
      vendors = responses[1];
      products = responses[2];
    } catch (apiError) {
      console.log('API not available, using fallback data');
      
      // Fallback data
      customers = [
        { id: 1, name: "CYN Developers Gujar Khan" },
        { id: 2, name: "CYN Developers Lahore" },
        { id: 3, name: "Walk-in (Cash) Customer" }
      ];
      
      vendors = [
        { id: 1, name: "Baba Stone Hassan Abdal" },
        { id: 2, name: "Rajput Traders" },
        { id: 3, name: "Retail (Cash) Purchase" },
        { id: 4, name: "Tabassum Crush Supplier" }
      ];
      
      products = [
        { id: 1, name: "Half Down Crush", price: 100, price1: 110, price2: 120, price3: 130 },
        { id: 2, name: "Half Khaalis Crush", price: 90, price1: 100, price2: 110, price3: 120 },
        { id: 3, name: "Sand Lawrencepur", price: 80, price1: 90, price2: 100, price3: 110 }
      ];
    }

    const customerSelect = document.getElementById("customerSelect");
    const vendorSelect = document.getElementById("vendorSelect");
    const productSelect = document.getElementById("productSelect");

    // Clear existing options
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
      productSelect.innerHTML += `<option value="${p.id}" data-price="${p.price || 100}" data-price1="${p.price1 || 110}" data-price2="${p.price2 || 120}" data-price3="${p.price3 || 130}">${p.name}</option>`;
    });
  } catch (err) {
    console.error("Error loading dropdowns:", err);
  }
}

// Calculate sqft and total
function calculateTotals() {
  const foot = parseFloat(document.getElementById("foot").value) || 0;
  const az = parseFloat(document.getElementById("az").value) || 0;
  const size = parseFloat(document.getElementById("size").value) || 0;
  const rate = parseFloat(document.getElementById("rate").value) || 0;

  const sqft = foot * az * size;
  const total = sqft * rate;

  document.getElementById("total_sqft").value = sqft.toFixed(2);
  document.getElementById("total_amount").value = total.toFixed(2);
}

// Autofill rate when price level/product changes
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

// Load deliveries with fallback
async function loadDeliveries() {
  try {
    // Try to load from API, if fails show empty table
    let data = [];
    
    try {
      const res = await fetch(`${BASE_URL}/api/delivery`);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }
      }
    } catch (apiError) {
      console.log('Deliveries API not available');
    }
    
    const tableBody = document.querySelector("#deliveryTable tbody");
    if (tableBody) {
      tableBody.innerHTML = "";

      data.forEach(d => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${d.date || ''}</td>
          <td>${d.slip_number || ''}</td>
          <td>${d.customer_name || ''}</td>
          <td>${d.vehicle_number || ''}</td>
          <td>${d.product_name || ''}</td>
          <td>${d.vendor_name || ''}</td>
          <td>${d.total_sqft || ''}</td>
          <td>${d.rate || ''}</td>
          <td>${d.total_amount || ''}</td>
          <td><button onclick="deleteDelivery(${d.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
      });
    }
  } catch (err) {
    console.error("Error loading deliveries:", err);
  }
}

// Delete delivery
async function deleteDelivery(id) {
  if (confirm("Delete this delivery?")) {
    try {
      const res = await fetch(`${BASE_URL}/api/delivery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const result = await res.json();
        if (result.success) loadDeliveries();
      }
    } catch (err) {
      console.error("Error deleting delivery:", err);
    }
  }
}

// Submit form with better error handling
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById("deliveryForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(e.target);
      const data = Object.fromEntries(formData.entries());

      // Validate required fields
      if (!data.date || !data.slip_number) {
        alert("Please fill in Date and Slip Number");
        return;
      }

      // Convert numeric fields
      data.foot = parseFloat(data.foot) || 0;
      data.az = parseFloat(data.az) || 0;
      data.size = parseFloat(data.size) || 0;
      data.total_sqft = parseFloat(document.getElementById("total_sqft").value) || 0;
      data.rate = parseFloat(data.rate) || 0;
      data.total_amount = parseFloat(document.getElementById("total_amount").value) || 0;

      // Get selected names
      const customerSelect = document.getElementById("customerSelect");
      const vendorSelect = document.getElementById("vendorSelect");
      const productSelect = document.getElementById("productSelect");
      
      data.customer_name = customerSelect.selectedOptions[0]?.text || '';
      data.vendor_name = vendorSelect.selectedOptions[0]?.text || '';
      data.product_name = productSelect.selectedOptions[0]?.text || '';

      try {
        // Try to submit to API
        const res = await fetch(`${BASE_URL}/api/delivery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          const result = await res.json();
          if (result.success || result.data) {
            alert("Delivery saved successfully!");
            e.target.reset();
            document.getElementById("total_sqft").value = "";
            document.getElementById("total_amount").value = "";
            loadDeliveries();
            return;
          }
        }
        
        // If API fails, show the data that would be saved
        console.log("Would save data:", data);
        alert("API not available. Data prepared for saving:\n" + 
              "Date: " + data.date + "\n" +
              "Slip: " + data.slip_number + "\n" +
              "Customer: " + data.customer_name + "\n" +
              "Total: " + data.total_amount + "\n\n" +
              "Please deploy the updated API endpoints to save data.");
        
      } catch (err) {
        console.error("Save error:", err);
        alert("Error saving delivery. Please check console for details.");
      }
    });
  }
});

// Event listeners for calculations
document.addEventListener('DOMContentLoaded', function() {
  ["foot", "az", "size", "rate"].forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", calculateTotals);
    }
  });
  
  const priceLevelSelect = document.getElementById("priceLevelSelect");
  const productSelect = document.getElementById("productSelect");
  
  if (priceLevelSelect) {
    priceLevelSelect.addEventListener("change", updateRate);
  }
  
  if (productSelect) {
    productSelect.addEventListener("change", updateRate);
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadDropdowns();
  loadDeliveries();
});
