const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    let data;
    try {
        data = req.body;
        if (!data || typeof data !== "object") {
            return res.status(400).json({ error: "Invalid request body" });
        }
    } catch {
        return res.status(400).json({ error: "Invalid JSON" });
    }

    const { customer, product, quantity, deliveryDate, status } = data;
    if (!customer || !product || !quantity || !deliveryDate) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const query = `
            INSERT INTO deliveries (customer, product, quantity, delivery_date, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `;
        const values = [customer, product, quantity, deliveryDate, status || "Pending"];

        const result = await pool.query(query, values);
        res.status(200).json({ message: "Delivery added", id: result.rows[0].id });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database insert failed" });
    }
};
