const express = require('express');
const pool = require('../db');
const router = express.Router();

// ✅ GET all deliveries
router.get('/deliveries', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id, d.slip_number, d.vehicle_number, d.sqft, d.rate, d.total,
        d.created_at,
        c.name AS client_name,
        v.name AS vendor_name,
        p.name AS product_name
      FROM deliveries d
      JOIN clients c ON d.client_id = c.id
      JOIN vendors v ON d.vendor_id = v.id
      JOIN products p ON d.product_id = p.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Failed to fetch deliveries' });
  }
});

// ✅ POST new delivery
router.post('/delivery', async (req, res) => {
  try {
    const {
      slipNumber,
      vehicleNumber,
      clientId,
      vendorId,
      productId,
      sqft,
      rate,
      total
    } = req.body;

    await pool.query(
      `INSERT INTO deliveries
        (slip_number, vehicle_number, client_id, vendor_id, product_id, sqft, rate, total, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [slipNumber, vehicleNumber, clientId, vendorId, productId, sqft, rate, total]
    );

    res.status(201).json({ message: '✅ Delivery saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

// ✅ DELETE a delivery
router.delete('/deliveries/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM deliveries WHERE id = $1', [id]);
    res.json({ message: '✅ Delivery deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Failed to delete delivery' });
  }
});

module.exports = router;
