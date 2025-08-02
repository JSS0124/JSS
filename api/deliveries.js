router.post('/delivery', async (req, res) => {
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

  try {
    await pool.query(
      `INSERT INTO deliveries
        (slip_number, vehicle_number, customer_id, vendor_id, product_id, total_sqft, rate, total_amount, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [slipNumber, vehicleNumber, clientId, vendorId, productId, sqft, rate, total]
    );
    res.json({ message: '✅ Delivery saved successfully' });
  } catch (err) {
    console.error('❌ Error saving delivery:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});
