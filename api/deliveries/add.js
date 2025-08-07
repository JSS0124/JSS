document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("deliveryForm");
  const totalSqftField = document.getElementById("total_sqft");
  const totalAmountField = document.getElementById("total_amount");

  // Recalculate when dimensions or rate change
  ["length_ft", "width_ft", "height_ft", "rate"].forEach(id => {
    document.getElementById(id).addEventListener("input", calculateTotals);
  });

  async function calculateTotals() {
    const length = parseFloat(document.getElementById("length_ft").value) || 0;
    const width = parseFloat(document.getElementById("width_ft").value) || 0;
    const height = parseFloat(document.getElementById("height_ft").value) || 0;
    const rate = parseFloat(document.getElementById("rate").value) || 0;

    const totalSqft = length * width * height;
    const totalAmount = totalSqft * rate;

    totalSqftField.value = totalSqft.toFixed(2);
    totalAmountField.value = totalAmount.toFixed(2);
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      slip_number: document.getElementById("slip_number").value,
      vehicle_number: document.getElementById("vehicle_number").value,
      customer_id: document.getElementById("customer").value,
      vendor_id: document.getElementById("vendor").value,
      product_id: document.getElementById("product").value,
      length_ft: document.getElementById("length_ft").value,
      width_ft: document.getElementById("width_ft").value,
      height_ft: document.getElementById("height_ft").value,
      total_sqft: totalSqftField.value,
      rate: document.getElementById("rate").value,
      total_amount: totalAmountField.value,
      notes: document.getElementById("notes").value,
      date: document.getElementById("date").value,
    };

    try {
      const response = await fetch("/api/deliveries/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Invalid server response. Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert("✅ Delivery saved successfully!");
        form.reset();
      } else {
        throw new Error("Failed to save delivery.");
      }

    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Error saving delivery: " + err.message);
    }
  });
});

// File: api/deliveries/add.js

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      slip_number,
      vehicle_number,
      customer_id,
      vendor_id,
      product_id,
      length_ft,
      width_ft,
      height_ft,
      total_sqft,
      rate,
      total_amount,
      notes,
      date,
    } = req.body;

    const result = await sql`
      INSERT INTO deliveries (
        slip_number,
        vehicle_number,
        customer_id,
        vendor_id,
        product_id,
        length_ft,
        width_ft,
        height_ft,
        total_sqft,
        rate,
        total_amount,
        notes,
        date
      )
      VALUES (
        ${slip_number},
        ${vehicle_number},
        ${customer_id},
        ${vendor_id},
        ${product_id},
        ${length_ft},
        ${width_ft},
        ${height_ft},
        ${total_sqft},
        ${rate},
        ${total_amount},
        ${notes},
        ${date}
      )
      RETURNING *;
    `;

    return res.status(200).json({ message: 'Delivery added successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
