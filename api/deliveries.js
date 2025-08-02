const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const {
      slipNumber,
      vehicleNumber,
      customerId,
      vendorId,
      productId,
      totalSqft,
      rate,
      totalAmount,
      lengthFt,
      widthFt,
      notes
    } = req.body;

    await pool.query(
      `INSERT INTO deliveries
        (slip_number, vehicle_number, customer_id, vendor_id, product_id, total_sqft, rate, total_amount, length_ft, width_ft, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        slipNumber,
        vehicleNumber,
        customerId,
        vendorId,
        productId,
        totalSqft,
        rate,
        totalAmount,
        lengthFt,
        widthFt,
        notes
      ]
    );

    res.json({ message: 'Delivery saved successfully' });
  } catch (error) {
    console.error('Error saving delivery:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
