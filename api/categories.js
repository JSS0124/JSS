const pool = require('../db'); // go one level up from /api
const getRawBody = require('raw-body');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT * FROM categories ORDER BY id DESC');
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('GET error:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = JSON.parse((await getRawBody(req)).toString());
      const { name } = body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const code = name.toLowerCase().replace(/\s+/g, '-');

      const result = await pool.query(
        'INSERT INTO categories (code, name) VALUES ($1, $2) RETURNING *',
        [code, name]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('POST error:', err);
      return res.status(500).json({ error: 'Failed to save category' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
