import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from './worker.mjs';
import { LocalSQLiteD1 } from './sqlite-d1.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 8787);
const dbPath = resolve(process.env.AUTH_DB_PATH || '.local/auth.sqlite');
const env = {
  AUTH_ORIGIN: process.env.AUTH_ORIGIN || `http://localhost:${port}`,
  AUTH_RP_ID: process.env.AUTH_RP_ID || 'localhost',
  AUTH_DB_GENERATION: process.env.AUTH_DB_GENERATION,
  AUTH_SESSION_IDLE_MS: process.env.AUTH_SESSION_IDLE_MS || '2592000000',
  AUTH_SESSION_ABSOLUTE_MS: process.env.AUTH_SESSION_ABSOLUTE_MS || '7776000000',
  AUTH_TERMINAL_SESSION_RETENTION_MS: process.env.AUTH_TERMINAL_SESSION_RETENTION_MS || '7776000000',
  AUTH_CHALLENGE_TTL_MS: process.env.AUTH_CHALLENGE_TTL_MS || '300000',
  AUTH_PREAUTH_TTL_MS: process.env.AUTH_PREAUTH_TTL_MS || '600000',
  AUTH_INVITE_TTL_MS: process.env.AUTH_INVITE_TTL_MS || '604800000',
  AUTH_RECOVERY_CODE_COUNT: process.env.AUTH_RECOVERY_CODE_COUNT || '10',
  AUTH_RATE_WINDOW_MS: process.env.AUTH_RATE_WINDOW_MS || '60000',
  AUTH_RATE_LIMIT: process.env.AUTH_RATE_LIMIT || '10',
  AUTH_RATE_LIMIT_KEY: process.env.AUTH_RATE_LIMIT_KEY,
  AUTH_OPERATOR_SECRET: process.env.AUTH_OPERATOR_SECRET,
};
if (!env.AUTH_RATE_LIMIT_KEY || !env.AUTH_OPERATOR_SECRET || !env.AUTH_DB_GENERATION) {
  throw new Error('Set AUTH_RATE_LIMIT_KEY, AUTH_OPERATOR_SECRET, and an externally managed AUTH_DB_GENERATION in the process environment; values are never read from disk or printed.');
}
await mkdir(dirname(dbPath), { recursive: true });
const db = new LocalSQLiteD1(dbPath);
await db.exec(await readFile(resolve(root, 'migrations/0001_auth.sql'), 'utf8'));
env.AUTH_DB = db;

const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 65536) { outgoing.writeHead(413, { 'cache-control': 'no-store' }); outgoing.end(); return; }
      chunks.push(chunk);
    }
    const host = incoming.headers.host || `localhost:${port}`;
    const url = new URL(incoming.url || '/', `http://${host}`);
    const method = incoming.method || 'GET';
    const requestHeaders = new Headers(incoming.headers);
    // In a local direct server, never trust a client-supplied Cloudflare proxy header.
    requestHeaders.set('cf-connecting-ip', incoming.socket.remoteAddress || '127.0.0.1');
    const request = new Request(url, { method, headers: requestHeaders,
      ...(['GET', 'HEAD'].includes(method) || size === 0 ? {} : { body: Buffer.concat(chunks) }) });
    const response = await worker.fetch(request, env);
    const headers = Object.fromEntries(response.headers.entries());
    const setCookies = response.headers.getSetCookie?.() || [];
    delete headers['set-cookie'];
    if (setCookies.length) headers['set-cookie'] = setCookies;
    outgoing.writeHead(response.status, headers);
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(503, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    outgoing.end(JSON.stringify({ error: 'temporarily_unavailable' }));
  }
});
server.listen(port, '127.0.0.1', () => process.stdout.write(`Local SQLite auth API listening at http://localhost:${port}\n`));
const stop = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
