// Serverless function for hit counter with image generation
let counters = new Map();

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id = 'default', format } = req.query;

  try {
    // Handle image request
    if (format === 'image' || req.headers.accept?.includes('image/')) {
      const count = counters.get(id) || 0;
      
      // Create SVG image
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="120" height="20">
          <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#444"/>
            <stop offset="100%" stop-color="#222"/>
          </linearGradient>
          <rect width="120" height="20" fill="url(#bg)" rx="3"/>
          
          <linearGradient id="eye" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#ff6b6b"/>
            <stop offset="100%" stop-color="#ffd93d"/>
          </linearGradient>
          <circle cx="15" cy="10" r="6" fill="url(#eye)"/>
          <circle cx="15" cy="10" r="2" fill="#000"/>
          
          <text x="30" y="14" font-family="Arial, sans-serif" font-size="11" fill="#fff">Views:</text>
          <text x="70" y="14" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffd700">${count}</text>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).send(svg);
    }

    // Handle JSON API requests
    if (req.method === 'GET') {
      const count = counters.get(id) || 0;
      return res.status(200).json({
        id,
        count: parseInt(count),
        timestamp: new Date().toISOString(),
        image_url: `${getBaseUrl(req)}/api/counter?id=${id}&format=image`,
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
        image_url: `${getBaseUrl(req)}/api/counter?id=${id}&format=image`,
        note: 'In-memory counter (resets on server restart)'
      });
    }

    if (req.method === 'DELETE') {
      counters.set(id, 0);
      return res.status(200).json({
        id,
        count: 0,
        timestamp: new Date().toISOString(),
        image_url: `${getBaseUrl(req)}/api/counter?id=${id}&format=image`,
        message: 'Counter reset to 0'
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

function getBaseUrl(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`;
}
