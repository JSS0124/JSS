const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const {
        date, slipNumber, vehicleNumber, customer, vendor,
        product, foot, az, size, totalSqft,
        rate, totalAmount, remarks
    } = req.body || {};

    if (!date || !customer || !product) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const query = `
            INSERT INTO deliveries (
                date, slip_number, vehicle_number, customer, vendor, product, foot, az, size,
                total_sqft, rate, total_amount, remarks
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING id
        `;
        const values = [
            date, slipNumber, vehicleNumber, customer, vendor,
            product, foot, az, size, totalSqft,
            rate, totalAmount, remarks
        ];

        const result = await pool.query(query, values);
        res.status(200).json({ message: "Delivery added", id: result.rows[0].id });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database insert failed" });
    }
};
