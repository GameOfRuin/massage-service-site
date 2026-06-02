import http from 'node:http';

type CacheValue = { body: string; createdAt: number };
const cache = new Map<string, CacheValue>();

function getKey(url: string) {
  return url;
}

function getCachedResponse(url: string) {
  const key = getKey(url);
  const hit = cache.get(key);
  if (hit) return hit.body;

  const body = JSON.stringify({ ok: true, url, ts: Date.now() });
  cache.set(key, { body, createdAt: Date.now() });
  return body;
}

const server = http.createServer((req, res) => {
  const url = req.url ?? '/';

  if (url.startsWith('/healthz')) {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }

  const body = getCachedResponse(url);
  res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
  res.end(body);
});

const port = Number(process.env.PORT ?? 3000);
server.listen(port, () => {
  console.log(`ready on http://localhost:${port}`);
});

// TODO: See README Tasks 1-3 and add the first reproduction step.
// TODO: Keep the entry point simple, then replace the cache with a bounded policy.