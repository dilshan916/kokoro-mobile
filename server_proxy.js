const http = require('http');

const PORT = 8080;
const TARGET_PORT = 8000;

const server = http.createServer((req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const options = {
    hostname: '127.0.0.1',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${TARGET_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Forward status & headers
    const headers = { ...proxyRes.headers, 'access-control-allow-origin': '*' };
    res.writeHead(proxyRes.statusCode || 200, headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] ${req.url}:`, err.message);
    res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: `Proxy failed to reach Kokoro Python server: ${err.message}` }));
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Kokoro Node Proxy] Listening on http://0.0.0.0:${PORT} -> Forwarding to http://127.0.0.1:${TARGET_PORT}`);
});
