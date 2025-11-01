// Serverless function for hit counter (in-memory)
// Note: Counters reset on server restart in serverless environments

let counters = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id = 'default' } = req.query;

  try {
    if (req.method === 'GET') {
      const count = counters.get(id) || 0;
      return res.status(200).json({
        id,
        count: parseInt(count),
        timestamp: new Date().toISOString(),
        note: 'In-memory counter (resets on server restart)'
      });
    }

    if (req.method === 'POST') {
      const currentCount = counters.get(id) || 0;
      const newCount = currentCount + 1;
      counters.set(id, newCount);
      
      return res.status(200).json({
        id,
        count: newCount,
        timestamp: new Date().toISOString(),
        note: 'In-memory counter (resets on server restart)'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Counter error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
