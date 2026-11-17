import 'dotenv/config';
import { Pool } from 'pg';

let connectionString = process.env.DATABASE_URL || '';

// Clean sslmode query param from connection string so it doesn't override our explicit ssl options
if (connectionString) {
  connectionString = connectionString.replace(/[?&]sslmode=[^&]+/g, '').replace(/\?$/, '');
}

const isProduction = process.env.NODE_ENV === 'production';
const isRemote = connectionString.includes('supabase.co') || connectionString.includes('pooler.supabase.com') || isProduction;

// Remote databases (Supabase, cloud hosts) require SSL with rejectUnauthorized: false
// unless a custom root CA certificate bundle is provided.
const sslConfig = isRemote ? { rejectUnauthorized: false } : false;

export const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: parseInt(process.env.PG_MAX_CONNECTIONS || '10', 10),
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.PG_CONNECT_TIMEOUT || '10000', 10),
});

// Idle client error handling
pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error] Unexpected idle client error:', err.message);
});

/**
 * Reusable database query helper
 * @param {string} text - SQL statement with parameterized placeholders ($1, $2, etc.)
 * @param {Array} [params] - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
export async function query(text, params) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error(`[PostgreSQL Query Error]: ${err.message}`);
    throw err;
  }
}

/**
 * Transaction / dedicated client checkout helper
 * Must always be released with client.release() in a finally block!
 * @returns {Promise<import('pg').PoolClient>}
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Returns sanitized connection details without revealing credentials
 */
export function getSanitizedConnectionInfo() {
  if (!process.env.DATABASE_URL) {
    return 'DATABASE_URL is not set';
  }
  try {
    const parsed = new URL(process.env.DATABASE_URL);
    const host = parsed.hostname;
    const port = parsed.port || '5432';
    const db = parsed.pathname.replace(/^\//, '');
    const user = parsed.username || 'unknown';
    return `postgresql://${user}:****@${host}:${port}/${db}`;
  } catch {
    return 'postgresql://[configured, masked]';
  }
}

export default pool;
