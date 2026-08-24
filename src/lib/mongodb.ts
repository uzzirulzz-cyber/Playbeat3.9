import { MongoClient, Db } from 'mongodb';

/**
 * MongoDB connection helper.
 *
 * SECURITY:
 *  - The connection string is read from process.env.MONGODB_URI at runtime.
 *  - The actual connection string NEVER appears in source code, .env.example,
 *    or git history. It lives only in the local gitignored .env file or in the
 *    hosting platform's secret store (Vercel/Render/Heroku config vars).
 *  - The MongoClient instance is cached outside hot-reload to avoid connection
 *    storms during development.
 */

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'playbeat';

if (!MONGODB_URI) {
  // Don't throw at module load — server may legitimately start without Mongo
  // (e.g. local dev with SQLite only). The /api/health/db endpoint will
  // surface the missing connection to the operator.
  console.warn(
    '[mongodb] MONGODB_URI is not set. MongoDB-dependent endpoints will be disabled. ' +
    'Set MONGODB_URI in your .env file (see .env.example).'
  );
}

// Cache the client outside hot-reload so we don't open a new pool every save.
// This pattern is recommended by MongoDB for Next.js / Vite dev servers.
declare global {
  // eslint-disable-next-line no-var
  var __mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var __mongoDb: Db | undefined;
  // eslint-disable-next-line no-var
  var __mongoConnPromise: Promise<{ client: MongoClient; db: Db }> | undefined;
}

async function connectMongo(): Promise<{ client: MongoClient; db: Db }> {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set it in your .env file.');
  }

  // Reuse a pending connection attempt if one is in flight.
  if (globalThis.__mongoConnPromise) {
    return globalThis.__mongoConnPromise;
  }

  // Reuse an existing live client.
  if (globalThis.__mongoClient && globalThis.__mongoDb) {
    return { client: globalThis.__mongoClient, db: globalThis.__mongoDb };
  }

  globalThis.__mongoConnPromise = (async () => {
    const client = new MongoClient(MONGODB_URI, {
      // Shorter timeout — fail fast to in-memory fallback rather than
      // hanging the request for 30s on Atlas cold-starts or unreachable
      // networks. Atlas typically connects in <3s when reachable.
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
    });

    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    globalThis.__mongoClient = client;
    globalThis.__mongoDb = db;

    console.info(
      `[mongodb] Connected to "${MONGODB_DB_NAME}" on cluster ${MONGODB_URI.split('@')[1]?.split('/')[0] ?? 'unknown'}`
    );

    return { client, db };
  })().catch((err) => {
    // Reset the in-flight promise so the next attempt can retry.
    globalThis.__mongoConnPromise = undefined;
    throw err;
  });

  return globalThis.__mongoConnPromise;
}

/**
 * Get the shared MongoDB Db instance. Throws if MONGODB_URI is not set.
 */
export async function getDb(): Promise<Db> {
  const { db } = await connectMongo();
  return db;
}

/**
 * Get the shared MongoClient. Useful for transactions and admin commands.
 */
export async function getClient(): Promise<MongoClient> {
  const { client } = await connectMongo();
  return client;
}

/**
 * Lightweight ping used by the /api/health/db endpoint.
 * Returns { ok: true, dbName, serverInfo } on success, or { ok: false, error } on failure.
 * Never throws — designed to be called directly from a route handler.
 */
export async function pingMongo(): Promise<{ ok: boolean; dbName?: string; serverInfo?: any; error?: string }> {
  if (!MONGODB_URI) {
    return { ok: false, error: 'MONGODB_URI is not configured' };
  }
  try {
    const { client, db } = await connectMongo();
    const adminDb = client.db('admin');
    const serverInfo = await adminDb.command({ buildInfo: 1 });
    return {
      ok: true,
      dbName: db.databaseName,
      serverInfo: {
        version: serverInfo.version,
        gitVersion: serverInfo.gitVersion,
      },
    };
  } catch (err: any) {
    return { ok: false, error: err.message || String(err) };
  }
}

/**
 * Whether MongoDB is configured. Useful for the app to fall back to
 * the in-memory store when not configured (e.g. local dev without Atlas).
 */
export const isMongoConfigured = Boolean(MONGODB_URI);

/**
 * Sanitized host — safe to log or expose in /api/health (no credentials).
 * Returns "<host>" or "not-configured".
 */
export const mongoHostSanitized = MONGODB_URI
  ? (MONGODB_URI.split('@')[1]?.split('/')[0] ?? 'unknown-host')
  : 'not-configured';
