const express = require('express');
const router = express.Router();
const pool = require('../db');

// Add Delivery
router.post('/add', async (req, res) => {
    try {
        const {
            customer_id,
            customer_name,
            product_id,
            product_name,
            vendor_id,
            vendor_name,
            vehicle_number,
            length_ft,
            width_ft,
            total_sqft,
            rate,
            total_amount,
            slip_number,
            notes,
            height_ft  // Ensure this field is included
        } = req.body;

        const result = await pool.query(
            `INSERT INTO deliveries (
                customer_id,
                customer_name,
                product_id,
                product_name,
                vendor_id,
                vendor_name,
                vehicle_number,
                length_ft,
                width_ft,
                total_sqft,
                rate,
                total_amount,
                slip_number,
                notes,
                height_ft,
                created_at,
                updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
            ) RETURNING *`, [
                customer_id,
                customer_name,
                product_id,
                product_name,
                vendor_id,
                vendor_name,
                vehicle_number,
                length_ft,
                width_ft,
                total_sqft,
                rate,
                total_amount,
                slip_number,
                notes,
                height_ft
            ]
        );
        
        // Respond with the inserted data
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
