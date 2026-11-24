import { query } from '../config/pg.js';

async function run() {
  const sql = `
    UPDATE products
    SET image = REPLACE(image, 'https://pantherev.com/', '/vehicles/')
    WHERE image LIKE 'https://pantherev.com/%'
    RETURNING slug, name, image;
  `;
  const res = await query(sql);
  console.log('Updated products successfully:');
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
