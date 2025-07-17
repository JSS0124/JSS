const express = require('express');
const router = express.Router();
const pool = require('../db');

// Auto-calculate sqft
const calculateSqft = (foot, size, az) => {
  return parseFloat(foot) * parseFloat(size) * parseFloat(az);
};

router.post('/add-delivery', async (req, res) => {
  const {
    slip_number,
    vehicle_number,
    foot,
    size,
    az,
    client_id,
    vendor_id,
    product_id
  } = req.body;

  try {
    const sqft = calculateSqft(foot, size, az);

    // Insert into deliveries table
    const deliveryResult = await pool.query(
      `INSERT INTO deliveries 
        (slip_number, vehicle_number, foot, size, az, sqft, client_id, vendor_id, product_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [slip_number, vehicle_number, foot, size, az, sqft, client_id, vendor_id, product_id]
    );

    const delivery_id = deliveryResult.rows[0].id;

    // Get vendor rate
    const vendorRateResult = await pool.query(
      `SELECT rate FROM vendor_rates WHERE vendor_id = $1 AND product_id = $2`,
      [vendor_id, product_id]
    );
    const vendor_rate = vendorRateResult.rows[0]?.rate || 0;
    const vendor_total = sqft * vendor_rate;

    // Insert vendor ledger
    await pool.query(
      `INSERT INTO vendor_ledger (vendor_id, delivery_id, product_id, rate, total)
       VALUES ($1, $2, $3, $4, $5)`,
      [vendor_id, delivery_id, product_id, vendor_rate, vendor_total]
    );

    // Get client rate
    const clientRateResult = await pool.query(
      `SELECT rate FROM client_rates WHERE client_id = $1 AND product_id = $2`,
      [client_id, product_id]
    );
    const client_rate = clientRateResult.rows[0]?.rate || 0;
    const client_total = sqft * client_rate;

    // Insert client ledger
    await pool.query(
      `INSERT INTO client_ledger (client_id, delivery_id, product_id, rate, total)
       VALUES ($1, $2, $3, $4, $5)`,
      [client_id, delivery_id, product_id, client_rate, client_total]
    );

    res.status(200).json({
      message: '✅ Delivery & ledgers recorded successfully.',
      delivery_id,
      sqft,
      vendor_total,
      client_total
    });
    } catch (error) {
  console.error("❌ ERROR:", error.message);
  res.status(500).json({ error: '❌ ' + error.message });
  }

});

module.exports = router;

// POST /api/delivery/add
router.post('/add', async (req, res) => {
  const { slipNo, client, product, sqft, vehicle, date } = req.body;

  try {
    await pool.query(
      `INSERT INTO deliveries (slip_no, client, product, sqft, vehicle_no, date)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [slipNo, client, product, sqft, vehicle, date]
    );
    res.status(200).json({ message: 'Delivery added successfully.' });
  } catch (error) {
    console.error('Error inserting delivery:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});
