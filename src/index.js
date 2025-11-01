// Function to format numbers (1000 -> 1K, 100000 -> 1L, 10000000 -> 1Cr)
function formatNumber(count) {
  const num = parseInt(count);
  if (num >= 10000000) {
    const crore = num / 10000000;
    return crore % 1 === 0 ? `${crore}Cr` : `${crore.toFixed(1)}Cr`;
  } else if (num >= 100000) {
    const lakh = num / 100000;
    return lakh % 1 === 0 ? `${lakh}L` : `${lakh.toFixed(1)}L`;
  } else if (num >= 1000) {
    const thousand = num / 1000;
    return thousand % 1 === 0 ? `${thousand}K` : `${thousand.toFixed(1)}K`;
  }
  return num.toString();
}

// Generate SVG image
function generateSVG(count, formattedCount) {
  const textWidth = formattedCount.length * 6 + 40;
  const svgWidth = Math.max(120, textWidth);
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="20">
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#444"/>
        <stop offset="100%" stop-color="#222"/>
      </linearGradient>
      <rect width="${svgWidth}" height="20" fill="url(#bg)" rx="3"/>
      
      <linearGradient id="eye" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#ff6b6b"/>
        <stop offset="100%" stop-color="#ffd93d"/>
      </linearGradient>
      <circle cx="15" cy="10" r="6" fill="url(#eye)"/>
      <circle cx="15" cy="10" r="2" fill="#000"/>
      
      <text x="30" y="14" font-family="Arial, sans-serif" font-size="11" fill="#fff">Views:</text>
      <text x="${svgWidth - 10}" y="14" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#ffd700" text-anchor="end">${formattedCount}</text>
    </svg>
  `;
}

// HTML demo page
const HTML_PAGE = `<!DOCTYPE html>
<html>
<head>
    <title>Visitor Counter - Cloudflare</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5rem;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }
        .counter {
            font-size: 4rem;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        .buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin: 20px 0;
            flex-wrap: wrap;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        button:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
        }
        .reset {
            background: #e74c3c;
        }
        .reset:hover {
            background: #c0392b;
        }
        .api-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            text-align: left;
        }
        .code-block {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            margin: 10px 0;
            overflow-x: auto;
        }
        .counter-image {
            margin: 20px 0;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
        }
        .status {
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: 600;
        }
        .online {
            background: #d4edda;
            color: #155724;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Visitor Counter</h1>
        <p class="subtitle">Cloudflare Workers + KV Storage</p>
        
        <div class="counter" id="counter">0</div>
        
        <div class="counter-image">
            <img src="?id=demo&format=image" alt="Visitor Counter" id="counterImg" style="height: 30px;">
        </div>

        <div class="buttons">
            <button onclick="incrementCounter()">➕ Add Visitor</button>
            <button onclick="getCounter()">🔄 Refresh</button>
            <button class="reset" onclick="resetCounter()">🗑️ Reset</button>
        </div>

        <div class="status online" id="status">
            ✅ Connected to Cloudflare KV
        </div>

        <div class="api-info">
            <h3>📖 API Usage</h3>
            
            <p><strong>Get Counter Image:</strong></p>
            <div class="code-block" id="imageUrl">Loading...</div>
            
            <p><strong>HTML Embed:</strong></p>
            <div class="code-block">
                &lt;img src="<span id="embedUrl">Loading...</span>" alt="Views"&gt;
            </div>
            
            <p><strong>JSON API:</strong></p>
            <div class="code-block">
                // Get count<br>
                fetch('<span id="jsonUrl">Loading...</span>')<br>
                &nbsp; .then(r => r.json())<br>
                &nbsp; .then(data => console.log(data.count));<br><br>
                
                // Increment count<br>
                fetch('<span id="jsonUrl">Loading...</span>', {<br>
                &nbsp; method: 'POST'<br>
                })<br>
                &nbsp; .then(r => r.json())<br>
                &nbsp; .then(data => console.log(data.count));
            </div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.origin;
        const COUNTER_ID = 'demo';
        
        // Update URLs
        document.getElementById('imageUrl').textContent = API_BASE + '/?id=' + COUNTER_ID + '&format=image';
        document.getElementById('embedUrl').textContent = API_BASE + '/?id=your-page-id&format=image';
        document.getElementById('jsonUrl').textContent = API_BASE + '/?id=' + COUNTER_ID + '&format=json';
        
        async function updateCounter() {
            try {
                const response = await fetch(API_BASE + '/?id=' + COUNTER_ID + '&format=json');
                const data = await response.json();
                document.getElementById('counter').textContent = data.count;
                
                // Update image with cache busting
                document.getElementById('counterImg').src = API_BASE + '/?id=' + COUNTER_ID + '&format=image&t=' + Date.now();
            } catch (error) {
                document.getElementById('status').className = 'status offline';
                document.getElementById('status').textContent = '❌ Connection error';
            }
        }
        
        async function incrementCounter() {
            try {
                const response = await fetch(API_BASE + '/?id=' + COUNTER_ID + '&format=json', {
                    method: 'POST'
                });
                const data = await response.json();
                document.getElementById('counter').textContent = data.count;
                document.getElementById('counterImg').src = API_BASE + '/?id=' + COUNTER_ID + '&format=image&t=' + Date.now();
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function getCounter() {
            await updateCounter();
        }
        
        async function resetCounter() {
            if (!confirm('Are you sure you want to reset the counter to 0?')) return;
            
            try {
                const response = await fetch(API_BASE + '/?id=' + COUNTER_ID + '&format=json', {
                    method: 'DELETE'
                });
                const data = await response.json();
                document.getElementById('counter').textContent = data.count;
                document.getElementById('counterImg').src = API_BASE + '/?id=' + COUNTER_ID + '&format=image&t=' + Date.now();
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        // Auto-update counter image every 10 seconds
        setInterval(() => {
            document.getElementById('counterImg').src = API_BASE + '/?id=' + COUNTER_ID + '&format=image&t=' + Date.now();
        }, 10000);
        
        // Load initial data
        updateCounter();
    </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const id = url.searchParams.get('id') || 'default';
    const format = url.searchParams.get('format');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Serve HTML page for root path
      if (pathname === '/' || pathname === '') {
        return new Response(HTML_PAGE, {
          headers: { 
            'Content-Type': 'text/html; charset=UTF-8',
            ...corsHeaders 
          },
        });
      }

      // Handle image request
      if (format === 'image') {
        let count = await env.COUNTER_STORE.get(id);
        count = count ? parseInt(count) : 0;
        const formattedCount = formatNumber(count);
        const svg = generateSVG(count, formattedCount);

        return new Response(svg, {
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            ...corsHeaders,
          },
        });
      }

      // Handle JSON API
      if (format === 'json' || request.headers.get('accept')?.includes('application/json')) {
        if (request.method === 'GET') {
          let count = await env.COUNTER_STORE.get(id);
          count = count ? parseInt(count) : 0;
          const formattedCount = formatNumber(count);

          return new Response(
            JSON.stringify({
              id,
              count,
              formatted_count: formattedCount,
              timestamp: new Date().toISOString(),
              image_url: `${url.origin}/?id=${id}&format=image`,
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        if (request.method === 'POST') {
          let count = await env.COUNTER_STORE.get(id);
          count = count ? parseInt(count) + 1 : 1;
          await env.COUNTER_STORE.put(id, count.toString());
          const formattedCount = formatNumber(count);

          return new Response(
            JSON.stringify({
              id,
              count,
              formatted_count: formattedCount,
              timestamp: new Date().toISOString(),
              image_url: `${url.origin}/?id=${id}&format=image`,
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }

        if (request.method === 'DELETE') {
          await env.COUNTER_STORE.put(id, '0');
          const formattedCount = formatNumber(0);

          return new Response(
            JSON.stringify({
              id,
              count: 0,
              formatted_count: formattedCount,
              timestamp: new Date().toISOString(),
              image_url: `${url.origin}/?id=${id}&format=image`,
              message: 'Counter reset to 0',
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders,
              },
            }
          );
        }
      }

      // Default response
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          endpoints: {
            'GET /?id=page&format=json': 'Get counter value',
            'POST /?id=page&format=json': 'Increment counter',
            'DELETE /?id=page&format=json': 'Reset counter',
            'GET /?id=page&format=image': 'Get counter image',
          },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  },
};
