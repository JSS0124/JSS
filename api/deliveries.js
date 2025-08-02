const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET: All deliveries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id, d.slip_number, d.date, d.length_ft, d.width_ft, d.total_sqft,
        d.rate, d.total_amount, d.notes, d.created_at, d.updated_at,
        c.name AS customer_name,
        v.name AS vendor_name,
        p.name AS product_name
      FROM deliveries d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN vendors v ON d.vendor_id = v.id
      LEFT JOIN products p ON d.product_id = p.id
      ORDER BY d.date DESC, d.id DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching deliveries:', err);
    res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// POST: Create delivery
router.post('/', async (req, res) => {
  try {
    const {
      slip_number, date, customer_id, vendor_id, product_id,
      length_ft, width_ft, total_sqft, rate, total_amount,
      notes, vehicle_number
    } = req.body;

    const result = await pool.query(`
      INSERT INTO deliveries 
        (slip_number, date, customer_id, vendor_id, product_id, 
         length_ft, width_ft, total_sqft, rate, total_amount, notes, vehicle_number, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, 
         $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *;
    `, [
      slip_number, date, customer_id, vendor_id, product_id,
      length_ft, width_ft, total_sqft, rate, total_amount, notes, vehicle_number
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating delivery:', err);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      slip_number, date, customer_id, vendor_id, product_id,
      length_ft, width_ft, total_sqft, rate, total_amount,
      notes, vehicle_number
    } = req.body;

    const result = await pool.query(`
      INSERT INTO deliveries 
        (slip_number, date, customer_id, vendor_id, product_id, 
         length_ft, width_ft, total_sqft, rate, total_amount, notes, vehicle_number, created_at)
      VALUES 
        ($1, $2, $3, $4, $5, 
         $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *;
    `, [
      slip_number, date, customer_id, vendor_id, product_id,
      length_ft, width_ft, total_sqft, rate, total_amount, notes, vehicle_number
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating delivery:', err);
    res.status(500).json({ error: 'Failed to create delivery' });
  }
});


// DELETE: Delete delivery
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM deliveries WHERE id = $1 RETURNING *;
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.status(200).json({ message: '✅ Delivery deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting delivery:', err);
    res.status(500).json({ error: 'Failed to delete delivery' });
  }
});

module.exports = router;
