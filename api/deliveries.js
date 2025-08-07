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
            date,
            notes
        } = req.body;

        const result = await pool.query(
            INSERT INTO deliveries (
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
                date,
                notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *,
            [
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
                date,
                notes
            ]
        );

        res.status(201).json({ success: true, delivery: result.rows[0] });
    } catch (err) {
        console.error('Error saving delivery:', err.message);
        res.status(500).json({ success: false, message: 'Error saving delivery' });
    }
});
