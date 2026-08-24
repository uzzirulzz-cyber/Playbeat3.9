import { Pool, PoolClient } from 'pg';

/**
 * PostgreSQL (Neon) connection helper.
 *
 * SECURITY:
 *  - The connection string is read from process.env.POSTGRES_URL at runtime.
 *  - The actual connection string NEVER appears in source code or git history.
 *  - It lives only in the local gitignored .env file.
 *
 * Uses a connection pool for efficient query handling.
 * Falls back gracefully if PostgreSQL is not configured.
 */

const POSTGRES_URL = process.env.POSTGRES_URL;

let pool: Pool | null = null;

if (!POSTGRES_URL) {
  console.warn(
    '[postgres] POSTGRES_URL is not set. PostgreSQL endpoints will be disabled. ' +
    'Set it in your .env file (see .env.example).'
  );
}

export const isPostgresConfigured = Boolean(POSTGRES_URL);

/**
 * Get the shared connection pool.
 */
export function getPool(): Pool {
  if (!pool && POSTGRES_URL) {
    pool = new Pool({
      connectionString: POSTGRES_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: POSTGRES_URL.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
    });

    pool.on('error', (err) => {
      console.error('[postgres] Pool error:', err.message);
    });
  }
  if (!pool) {
    throw new Error('POSTGRES_URL is not configured');
  }
  return pool;
}

/**
 * Execute a query with parameters.
 * Returns null on error (so the server never crashes).
 */
export async function query(text: string, params?: (string | number | boolean | null)[]): Promise<any[] | null> {
  if (!isPostgresConfigured) return null;
  try {
    const pool = getPool();
    const res = await pool.query(text, params);
    return res.rows;
  } catch (err: any) {
    console.warn('[postgres] Query error:', err.message?.substring(0, 80));
    return null;
  }
}

/**
 * Test the PostgreSQL connection.
 */
export async function pingPostgres(): Promise<{ ok: boolean; error?: string }> {
  if (!isPostgresConfigured) {
    return { ok: false, error: 'POSTGRES_URL is not configured' };
  }
  try {
    const rows = await query('SELECT NOW() as now, version() as version');
    if (rows && rows.length > 0) {
      return { ok: true };
    }
    return { ok: false, error: 'No response from database' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

/**
 * Initialize the database schema (create tables if they don't exist).
 */
export async function initPostgresSchema(): Promise<void> {
  if (!isPostgresConfigured) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      sku TEXT,
      description TEXT,
      short_description TEXT,
      category_id TEXT,
      category_name TEXT,
      product_type TEXT DEFAULT 'digital',
      price NUMERIC(10,2),
      compare_at_price NUMERIC(10,2),
      stock INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      images TEXT[],
      tags TEXT[],
      is_featured BOOLEAN DEFAULT false,
      is_trending BOOLEAN DEFAULT false,
      rating NUMERIC(2,1) DEFAULT 5.0,
      review_count INTEGER DEFAULT 0,
      data JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      items JSONB,
      subtotal NUMERIC(10,2),
      discount NUMERIC(10,2),
      tax NUMERIC(10,2),
      total NUMERIC(10,2),
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'processing',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT DEFAULT 'customer',
      phone TEXT,
      country TEXT,
      status TEXT DEFAULT 'active',
      password_hash TEXT,
      total_spent NUMERIC(10,2) DEFAULT 0,
      orders_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      admin_name TEXT,
      admin_email TEXT,
      action TEXT,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    )`,
  ];

  for (const stmt of statements) {
    await query(stmt);
  }
  console.info('[postgres] Schema initialized');
}
