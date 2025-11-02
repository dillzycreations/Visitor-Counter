export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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
      // Serve HTML page for root
      if (url.pathname === '/') {
        const html = `<!DOCTYPE html>
<html>
<head>
    <title>Visitor Counter</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea, #764ba2);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .counter {
            font-size: 4rem;
            font-weight: bold;
            color: #667eea;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            margin: 10px;
            font-size: 1rem;
        }
        button:hover {
            background: #5a6fd8;
        }
        .counter-image {
            margin: 20px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Visitor Counter</h1>
        <p>Cloudflare Workers + KV Storage</p>
        
        <div class="counter" id="counter">0</div>
        
        <div class="counter-image">
            <img src="/?id=demo&format=image" alt="Visitor Counter" id="counterImg" style="height: 30px;">
        </div>

        <div>
            <button onclick="incrementCounter()">➕ Add Visitor</button>
            <button onclick="getCounter()">🔄 Refresh</button>
        </div>

        <div style="margin-top: 30px; background: #f8f9fa; padding: 15px; border-radius: 8px;">
            <h3>Usage:</h3>
            <code style="font-family: monospace; background: #2d3748; color: white; padding: 10px; display: block; border-radius: 5px;">
                &lt;img src="https://bh.cricketstream745.workers.dev/?id=your-page&format=image"&gt;
            </code>
        </div>
    </div>

    <script>
        async function updateCounter() {
            try {
                const response = await fetch('/?id=demo&format=json');
                const data = await response.json();
                document.getElementById('counter').textContent = data.count;
                
                // Update image with cache busting
                document.getElementById('counterImg').src = '/?id=demo&format=image&t=' + Date.now();
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function incrementCounter() {
            try {
                const response = await fetch('/?id=demo&format=json', {
                    method: 'POST'
                });
                const data = await response.json();
                document.getElementById('counter').textContent = data.count;
                document.getElementById('counterImg').src = '/?id=demo&format=image&t=' + Date.now();
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function getCounter() {
            await updateCounter();
        }
        
        // Auto-update counter image every 10 seconds
        setInterval(() => {
            document.getElementById('counterImg').src = '/?id=demo&format=image&t=' + Date.now();
        }, 10000);
        
        // Load initial data
        updateCounter();
    </script>
</body>
</html>`;
        return new Response(html, {
          headers: { 
            'Content-Type': 'text/html; charset=UTF-8',
            ...corsHeaders 
          },
        });
      }

      // Format number function
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

      // Handle image request
      if (format === 'image') {
        let count = await env.COUNTER_STORE.get(id);
        count = count ? parseInt(count) : 0;
        const formattedCount = formatNumber(count);
        
        // Calculate dynamic width
        const textWidth = formattedCount.length * 6 + 40;
        const svgWidth = Math.max(120, textWidth);
        
        const svg = `
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

        return new Response(svg, {
          headers: { 
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            ...corsHeaders 
          },
        });
      }

      // Handle JSON API
      if (format === 'json' || request.headers.get('accept')?.includes('application/json')) {
        if (request.method === 'GET') {
          let count = await env.COUNTER_STORE.get(id);
          count = count ? parseInt(count) : 0;
          const formattedCount = formatNumber(count);

          return new Response(JSON.stringify({
            id,
            count,
            formatted_count: formattedCount,
            timestamp: new Date().toISOString(),
            image_url: `${url.origin}/?id=${id}&format=image`,
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        if (request.method === 'POST') {
          let count = await env.COUNTER_STORE.get(id);
          count = count ? parseInt(count) + 1 : 1;
          await env.COUNTER_STORE.put(id, count.toString());
          const formattedCount = formatNumber(count);

          return new Response(JSON.stringify({
            id,
            count,
            formatted_count: formattedCount,
            timestamp: new Date().toISOString(),
            image_url: `${url.origin}/?id=${id}&format=image`,
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }

        if (request.method === 'DELETE') {
          await env.COUNTER_STORE.put(id, '0');
          const formattedCount = formatNumber(0);

          return new Response(JSON.stringify({
            id,
            count: 0,
            formatted_count: formattedCount,
            timestamp: new Date().toISOString(),
            image_url: `${url.origin}/?id=${id}&format=image`,
            message: 'Counter reset to 0',
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          });
        }
      }

      // Default response
      return new Response(JSON.stringify({
        message: 'Visitor Counter API',
        endpoints: {
          'GET /?id=page&format=json': 'Get counter value',
          'POST /?id=page&format=json': 'Increment counter',
          'GET /?id=page&format=image': 'Get counter image',
        },
        your_url: 'https://bh.cricketstream745.workers.dev/'
      }), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
