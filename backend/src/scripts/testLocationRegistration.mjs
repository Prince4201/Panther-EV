import http from 'node:http';
import app from '../app.js';
import { query } from '../config/pg.js';

async function run() {
  const testEmail = 'location_test_user@pantherev.test';
  await query('DELETE FROM users WHERE email = $1', [testEmail]);

  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, res));
  const port = server.address().port;

  const regPayload = JSON.stringify({
    name: 'UP Test Driver',
    email: testEmail,
    password: 'Password123!',
    phone: '9876543210',
    location: 'Varanasi, Uttar Pradesh, PIN: 221001',
    state: 'Uttar Pradesh',
    city: 'Varanasi',
    pincode: '221001',
    lat: 25.3176,
    lng: 82.9739,
  });

  const res = await new Promise((resolve, reject) => {
    const clientReq = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: '/api/auth/register',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(regPayload),
          Origin: 'https://panther-ev.vercel.app',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        });
      }
    );
    clientReq.on('error', reject);
    clientReq.write(regPayload);
    clientReq.end();
  });

  console.log('REGISTER STATUS:', res.status);
  console.log('ACCOUNT RESPONSE:', res.body.account);

  const dbRow = await query(
    'SELECT id, name, location, address_state, address_city, address_pincode, latitude, longitude FROM users WHERE email = $1',
    [testEmail]
  );
  console.log('DATABASE ROW:', dbRow.rows[0]);

  // Clean up
  await query('DELETE FROM users WHERE email = $1', [testEmail]);
  server.close();

  if (
    res.status === 201 &&
    res.body.account.location === 'Varanasi, Uttar Pradesh, PIN: 221001' &&
    res.body.account.state === 'Uttar Pradesh' &&
    dbRow.rows[0].location === 'Varanasi, Uttar Pradesh, PIN: 221001' &&
    dbRow.rows[0].address_state === 'Uttar Pradesh' &&
    Math.abs(dbRow.rows[0].latitude - 25.3176) < 0.001
  ) {
    console.log('✓ PASS: Registration with live location and state successfully persisted and returned!');
    process.exit(0);
  } else {
    console.error('✗ FAIL: Verification failed!');
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
