const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get all
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM deliveries ORDER BY date DESC, id DESC');
  res.json(rows);
});

// Add Delivery
router.post('/', async (req, res) => {
  try {
    const {
      slip_number, vehicle_number,
      customer_id, customer_name,
      vendor_id, vendor_name,
      product_id, product_name,
      length_ft, width_ft,
      total_sqft, rate, total_amount,
      date, notes
    } = req.body;
    const q = `
      INSERT INTO deliveries
        (slip_number, vehicle_number,
         customer_id, customer_name,
         vendor_id, vendor_name,
         product_id, product_name,
         length_ft, width_ft,
         total_sqft, rate, total_amount,
         date, notes, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())
      RETURNING *
    `;
    const values = [
      slip_number, vehicle_number,
      customer_id, customer_name,
      vendor_id, vendor_name,
      product_id, product_name,
      length_ft, width_ft,
      total_sqft, rate, total_amount,
      date, notes
    ];
    const result = await pool.query(q, values);
    res.status(201).json({ success: true, delivery: result.rows[0] });
  } catch (err) {
    console.error('Delivery POST error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
