const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const pool = require('../db');
const router = express.Router();

// Set up multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '❌ No file uploaded.' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    let insertedCount = 0;

    for (const row of rows) {
      const {
        slip_number,
        vehicle_number,
        foot,
        size,
        az,
        client_id,
        vendor_id,
        product_id
      } = row;

      const sqft = foot * size * az;

      // Fetch vendor rate
      const vendorRateResult = await pool.query(
        'SELECT rate FROM vendor_rates WHERE vendor_id = $1 AND product_id = $2',
        [vendor_id, product_id]
      );
      const vendorRateRow = vendorRateResult.rows[0];
      if (!vendorRateRow) {
        return res.status(400).json({
          error: `❌ No vendor rate found for vendor_id=${vendor_id}, product_id=${product_id}`
        });
      }
      const vendorRate = vendorRateRow.rate;
      const vendorTotal = sqft * vendorRate;

      // Fetch client rate
      const clientRateResult = await pool.query(
        'SELECT rate FROM client_rates WHERE client_id = $1 AND product_id = $2',
        [client_id, product_id]
      );
      const clientRateRow = clientRateResult.rows[0];
      if (!clientRateRow) {
        return res.status(400).json({
          error: `❌ No client rate found for client_id=${client_id}, product_id=${product_id}`
        });
      }
      const clientRate = clientRateRow.rate;
      const clientTotal = sqft * clientRate;

      // Insert delivery
      const deliveryResult = await pool.query(
        `INSERT INTO deliveries
          (slip_number, vehicle_number, foot, size, az, sqft, client_id, vendor_id, product_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          slip_number,
          vehicle_number,
          foot,
          size,
          az,
          sqft,
          client_id,
          vendor_id,
          product_id
        ]
      );
      const delivery_id = deliveryResult.rows[0].id;

      // Insert into vendor ledger
      await pool.query(
        `INSERT INTO vendor_ledger (vendor_id, delivery_id, sqft, amount)
         VALUES ($1, $2, $3, $4)`,
        [vendor_id, delivery_id, sqft, vendorTotal]
      );

      // Insert into client ledger
      await pool.query(
        `INSERT INTO client_ledger (client_id, delivery_id, sqft, amount)
         VALUES ($1, $2, $3, $4)`,
        [client_id, delivery_id, sqft, clientTotal]
      );

      insertedCount++;
    }

    res.json({ message: `✅ ${insertedCount} deliveries uploaded successfully.` });
  } catch (err) {
    console.error('❌ Upload Error:', err);
    res.status(500).json({ error: '❌ Something went wrong during upload.' });
  }
});

module.exports = router;
