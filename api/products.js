// api/products.js
import pool from '../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
      `);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  if (req.method === 'POST') {
    const { name, category_id, price, price1, price2, price3 } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO products (name, category_id, price, price1, price2, price3)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, category_id, price, price1, price2, price3]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save product' });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return res.status(200).json({ message: 'Deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
