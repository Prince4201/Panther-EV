import 'dotenv/config';
import { pool, getSanitizedConnectionInfo } from '../config/pg.js';

async function testPostgresConnection() {
  console.log('='.repeat(60));
  console.log('PostgreSQL Connection Diagnostic Tool');
  console.log('='.repeat(60));

  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.trim()) {
    console.error('\n[ERROR] DATABASE_URL is not defined in backend/.env');
    console.error('\nPlease update backend/.env with your Supabase connection string:');
    console.error('DATABASE_URL=postgresql://postgres:[PASSWORD]@db.poklpdncpsdjwxrpvnvq.supabase.co:5432/postgres?sslmode=require');
    console.error('(or the Supabase transaction pooler on port 6543)');
    console.log('='.repeat(60));
    process.exit(1);
  }

  console.log(`\nConnecting to: ${getSanitizedConnectionInfo()}`);
  console.log('Testing connection...\n');

  let client;
  try {
    const startTime = Date.now();
    client = await pool.connect();
    const connectDuration = Date.now() - startTime;
    console.log(`[SUCCESS] Connected to PostgreSQL in ${connectDuration}ms!`);

    // Run test queries
    const timeRes = await client.query('SELECT NOW() AS current_timestamp;');
    const envRes = await client.query('SELECT current_database() AS db_name, current_user AS db_user, version() AS pg_version;');
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('\n--- PostgreSQL Server Information ---');
    console.log(`Database Name:     ${envRes.rows[0].db_name}`);
    console.log(`Current User:      ${envRes.rows[0].db_user}`);
    console.log(`Server Timestamp:  ${timeRes.rows[0].current_timestamp.toISOString()}`);
    console.log(`PostgreSQL Version: ${envRes.rows[0].pg_version.split(' on ')[0]}`);

    console.log('\n--- Public Tables Detected ---');
    if (tablesRes.rows.length === 0) {
      console.log('No public tables found. (Have you run 01_schema.sql?)');
    } else {
      console.log(`Found ${tablesRes.rows.length} tables:`);
      tablesRes.rows.forEach((r, idx) => {
        console.log(`  ${idx + 1}. ${r.table_name}`);
      });
    }

    console.log('\n[RESULT] Connection pool and query execution tested successfully!');
    console.log('='.repeat(60));
  } catch (err) {
    console.error('\n[FAILURE] Unable to connect to PostgreSQL database.');
    console.error(`Error Code:    ${err.code || 'UNKNOWN'}`);
    console.error(`Error Message: ${err.message}`);

    if (err.message.includes('password authentication failed')) {
      console.error('\nTroubleshooting Tip: Please verify your Supabase database password in backend/.env.');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('\nTroubleshooting Tip: Verify the host name in DATABASE_URL.');
    } else if (err.message.includes('timeout')) {
      console.error('\nTroubleshooting Tip: Connection timed out. Check network connectivity or firewall.');
    }
    console.log('='.repeat(60));
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testPostgresConnection();
