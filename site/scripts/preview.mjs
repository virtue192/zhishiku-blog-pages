import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const base = '/zhishiku-blog-pages/';
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (!url.pathname.startsWith(base)) {res.writeHead(302,{Location:base});res.end();return;}
    const path = resolve(root, decodeURIComponent(url.pathname.slice(base.length)) || 'index.html');
    if (relative(root, path).startsWith('..')) throw new Error('Invalid path');
    const content = await readFile(path);
    res.writeHead(200, {'Content-Type':types[extname(path)] || 'application/octet-stream'});
    res.end(content);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(4324, '127.0.0.1', () => console.log(`http://127.0.0.1:4324${base}`));
