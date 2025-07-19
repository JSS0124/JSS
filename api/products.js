// /api/products.js
import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT p.*, c.name AS category_name
        FROM products p
        JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
      `);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  else if (req.method === 'POST') {
    const { name, category_id, price, price1, price2, price3 } = req.body;

    if (!name || !category_id) {
      return res.status(400).json({ error: 'Name and Category ID required' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO products (name, category_id, price, price1, price2, price3)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, category_id, price, price1, price2, price3]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save product' });
    }
  }

  else if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      await pool.query('DELETE FROM products WHERE id = $1', [id]);
      res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
