// File: /api/deliveries/add.js

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const data = req.body;

      // TODO: Save to database here
      console.log('Received delivery:', data);

      res.status(200).json({ success: true, message: 'Delivery saved successfully' });
    } catch (error) {
      console.error('Error saving delivery:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
