const fetchDropdownData = async () => {
  try {
    const [customers, products, vendors] = await Promise.all([
      fetch("/api/customers").then((res) => res.json()),
      fetch("/api/products").then((res) => res.json()),
      fetch("/api/vendors").then((res) => res.json())
    ]);

    // Populate Customer dropdown
    const customerSelect = document.getElementById("customer");
    customers.forEach((cust) => {
      const option = document.createElement("option");
      option.value = cust.id;
      option.textContent = cust.name?.trim(); // clean extra tabs
      customerSelect.appendChild(option);
    });

    // Populate Product dropdown
    const productSelect = document.getElementById("product");
    products.forEach((prod) => {
      const option = document.createElement("option");
      option.value = prod.id;
      option.textContent = prod.name?.trim();
      productSelect.appendChild(option);
    });

    // Populate Vendor dropdown
    const vendorSelect = document.getElementById("vendor");
    vendors.forEach((ven) => {
      const option = document.createElement("option");
      option.value = ven.id;
      option.textContent = ven.name?.trim();
      vendorSelect.appendChild(option);
    });

  } catch (error) {
    console.error("Error loading dropdowns", error);
  }
};

window.addEventListener("DOMContentLoaded", fetchDropdownData);
