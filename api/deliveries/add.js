// File: api/deliveries/add.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  try {
    const data = req.body;

    // Validate input (example)
    if (!data.customer || !data.vendor || !data.product) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Save to DB logic here (you mentioned you're using Neon + PostgreSQL)
    // const result = await saveToDatabase(data);

    res.status(200).json({ message: 'Delivery saved successfully' });
  } catch (error) {
    console.error('❌ API error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
