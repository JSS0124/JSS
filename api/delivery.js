// api/delivery.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all deliveries
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, c.name AS customer_name, v.name AS vendor_name, p.name AS product_name
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN vendors v ON d.vendor_id = v.id
      LEFT JOIN products p ON d.product_id = p.id
      ORDER BY d.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("GET deliveries error:", err);
    res.status(500).json({ error: "Failed to fetch deliveries" });
  }
});

// Add new delivery
router.post("/", async (req, res) => {
  try {
    const {
      date,
      slip_number,
      customer_id,
      vehicle_number,
      product_id,
      vendor_id,
      foot,
      az,
      size,
      total_sqft,
      rate,
      total_amount,
      price_level,
      remarks
    } = req.body;

    const result = await pool.query(
      `INSERT INTO deliveries
        (date, slip_number, customer_id, vehicle_number, product_id, vendor_id,
         foot, az, size, total_sqft, rate, total_amount, price_level, remarks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        date,
        slip_number,
        customer_id,
        vehicle_number,
        product_id,
        vendor_id,
        foot,
        az,
        size,
        total_sqft,
        rate,
        total_amount,
        price_level,
        remarks
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST delivery error:", err);
    res.status(500).json({ error: "Failed to save delivery" });
  }
});

// Delete delivery
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM deliveries WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE delivery error:", err);
    res.status(500).json({ error: "Failed to delete delivery" });
  }
});

// Update delivery
router.put("/:id", async (req, res) => {
  try {
    const {
      date,
      slip_number,
      customer_id,
      vehicle_number,
      product_id,
      vendor_id,
      foot,
      az,
      size,
      total_sqft,
      rate,
      total_amount,
      price_level,
      remarks
    } = req.body;

    const result = await pool.query(
      `UPDATE deliveries SET
        date=$1, slip_number=$2, customer_id=$3, vehicle_number=$4, product_id=$5, vendor_id=$6,
        foot=$7, az=$8, size=$9, total_sqft=$10, rate=$11, total_amount=$12,
        price_level=$13, remarks=$14
       WHERE id=$15 RETURNING *`,
      [
        date,
        slip_number,
        customer_id,
        vehicle_number,
        product_id,
        vendor_id,
        foot,
        az,
        size,
        total_sqft,
        rate,
        total_amount,
        price_level,
        remarks,
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT delivery error:", err);
    res.status(500).json({ error: "Failed to update delivery" });
  }
});

module.exports = router;

document.addEventListener("DOMContentLoaded", () => {
  loadCustomers();
  loadProducts();
  loadVendors();
});

function loadCustomers() {
  fetch("/api/customers")
    .then((res) => res.json())
    .then((data) => {
      const customerSelect = document.getElementById("customerSelect");
      customerSelect.innerHTML = '<option value="">Select Customer</option>';
      data.forEach((cust) => {
        const option = document.createElement("option");
        option.value = cust.id;
        option.textContent = cust.name.trim();
        customerSelect.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load customers", err));
}

function loadProducts() {
  fetch("/api/products")
    .then((res) => res.json())
    .then((data) => {
      const productSelect = document.getElementById("productSelect");
      productSelect.innerHTML = '<option value="">Select Product</option>';
      data.forEach((prod) => {
        const option = document.createElement("option");
        option.value = prod.id;
        option.textContent = prod.name;
        productSelect.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load products", err));
}

function loadVendors() {
  fetch("/api/vendors")
    .then((res) => res.json())
    .then((data) => {
      const vendorSelect = document.getElementById("vendorSelect");
      vendorSelect.innerHTML = '<option value="">Select Vendor</option>';
      data.forEach((vend) => {
        const option = document.createElement("option");
        option.value = vend.id;
        option.textContent = vend.name.trim();
        vendorSelect.appendChild(option);
      });
    })
    .catch((err) => console.error("Failed to load vendors", err));
}

