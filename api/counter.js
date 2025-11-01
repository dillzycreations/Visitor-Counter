// Serverless function for hit counter
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
    const { kv } = await import('@vercel/kv');

    if (req.method === 'GET') {
      const count = await kv.get(`counter:${id}`) || 0;
      return res.status(200).json({
        id,
        count: parseInt(count),
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'POST') {
      const newCount = await kv.incr(`counter:${id}`);
      return res.status(200).json({
        id,
        count: newCount,
        timestamp: new Date().toISOString()
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
