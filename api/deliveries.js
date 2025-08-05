const express = require('express');
const pool = require('../db');
const router = express.Router();

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/deliveries");
  const deliveries = await res.json();

  const table = document.createElement("table");
  table.innerHTML = `
    <tr>
      <th>Slip #</th>
      <th>Vehicle #</th>
      <th>Customer</th>
      <th>Vendor</th>
      <th>Product</th>
      <th>Length</th>
      <th>Width</th>
      <th>Height</th>
      <th>Total Sqft</th>
      <th>Amount</th>
      <th>Date</th>
    </tr>
  `;

  deliveries.forEach((d) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${d.slip_number}</td>
      <td>${d.vehicle_number}</td>
      <td>${d.customer_name}</td>
      <td>${d.vendor_name}</td>
      <td>${d.product_name}</td>
      <td>${d.length_ft}</td>
      <td>${d.width_ft}</td>
      <td>${d.height_ft}</td>
      <td>${d.total_sqft}</td>
      <td>${d.total_amount}</td>
      <td>${d.date}</td>
    `;
    table.appendChild(row);
  });

  document.body.appendChild(table);
});
