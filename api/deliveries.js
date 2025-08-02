// deliveries.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all deliveries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM deliveries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add a new delivery
router.post('/', async (req, res) => {
  try {
    const {
      slip_number,
      vehicle_number,
      customer_id,
      vendor_id,
      product_id,
      total_sqft,
      rate,
      total_amount,
      foot,        // this will go in length_ft
      az,          // this will go in width_ft
      size,        // not used in DB, optional if needed in future
      notes
    } = req.body;

    await pool.query(
      `INSERT INTO deliveries
        (slip_number, vehicle_number, customer_id, vendor_id, product_id, total_sqft, rate, total_amount, length_ft, width_ft, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        slip_number,
        vehicle_number,
        customer_id,
        vendor_id,
        product_id,
        total_sqft,
        rate,
        total_amount,
        foot,      // mapped to length_ft
        az,        // mapped to width_ft
        notes
      ]
    );

    res.json({ success: true, message: 'Delivery saved successfully' });
  } catch (error) {
    console.error('Error saving delivery:', error);
    res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
