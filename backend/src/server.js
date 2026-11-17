import { env } from './config/env.js';
import { query } from './config/pg.js';
import app from './app.js';
import { runMigrations } from './seed/migrate.js';

try {
  await query('SELECT NOW()');
  console.log('PostgreSQL connected');
} catch (err) {
  console.error('Failed to connect to PostgreSQL database:', err.message);
  process.exit(1);
}

await runMigrations();
app.listen(env.port, () => console.log(`Panther API running on http://localhost:${env.port}/api`));
