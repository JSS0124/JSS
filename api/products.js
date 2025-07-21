const pool = require('../db');
const getRawBody = require('raw-body');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = JSON.parse((await getRawBody(req)).toString());
      const { name, category_id, price, price1, price2, price3 } = body;

      if (!name || !category_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await pool.query(
        `INSERT INTO products (name, category_id, price, price1, price2, price3)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, category_id, price, price1, price2, price3]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('POST error:', err);
      return res.status(500).json({ error: 'Failed to add product' });
    }
  }

  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT products.*, categories.name AS category_name
        FROM products
        JOIN categories ON products.category_id = categories.id
        ORDER BY products.id DESC
      `);

      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('GET error:', err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
