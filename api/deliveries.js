const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/deliveries', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id, d.slip_number, d.vehicle_number, d.sqft,
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

module.exports = router;

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
