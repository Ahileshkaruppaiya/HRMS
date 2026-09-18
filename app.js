// VRM Enterprise HRMS - Production Plesk / IISNode Server
// Compatible with Node.js 14, 16, 18, 20, 22+ (Zero external dependencies)
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;

// Resolve static directory (root dist, H/dist, or current dir)
const candidates = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, 'H', 'dist'),
  path.join(__dirname, 'public'),
  __dirname
];

let STATIC_DIR = candidates.find(dir => fs.existsSync(path.join(dir, 'index.html'))) || path.join(__dirname, 'dist');
console.log('[HRMS Server] Static directory set to:', STATIC_DIR);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json'
};

const server = http.createServer((req, res) => {
  // Normalize URL
  let reqPath = (req.url || '/').split('?')[0];
  try {
    reqPath = decodeURIComponent(reqPath);
  } catch {
    reqPath = '/';
  }

  // Health check endpoint
  if (reqPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString(), app: 'VRM Enterprise HRMS' }));
    return;
  }

  // Determine candidate file path
  let filePath = path.join(STATIC_DIR, reqPath === '/' ? 'index.html' : reqPath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(STATIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if target file exists and is not a directory
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(req, res, filePath);
    } else {
      // Fallback for Single Page Application (SPA) routing: serve index.html
      const indexPath = path.join(STATIC_DIR, 'index.html');
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          serveFile(req, res, indexPath);
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>VRM Enterprise HRMS</h1><p>Building or static files not found. Please ensure dist folder is present.</p>');
        }
      });
    }
  });
});

function serveFile(req, res, targetPath) {
  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const acceptEncoding = req.headers['accept-encoding'] || '';

  // Cache headers: assets can be cached aggressively, html should not be cached
  const isHtml = ext === '.html';
  const headers = {
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': isHtml ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000, immutable'
  };

  const rawStream = fs.createReadStream(targetPath);

  // Compress text-based assets with gzip if supported
  if (acceptEncoding.includes('gzip') && (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('svg'))) {
    headers['Content-Encoding'] = 'gzip';
    res.writeHead(200, headers);
    rawStream.pipe(zlib.createGzip()).pipe(res);
  } else {
    res.writeHead(200, headers);
    rawStream.pipe(res);
  }
}

server.listen(PORT, () => {
  console.log(`VRM Enterprise HRMS Server listening on port ${PORT}`);
});
