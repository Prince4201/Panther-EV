import http from 'node:http';
import app from '../app.js';
import { env } from '../config/env.js';
import { query } from '../config/pg.js';
import bcrypt from 'bcryptjs';

function parseCookies(header) {
  if (!header) return [];
  const raw = Array.isArray(header) ? header : [header];
  return raw.map((c) => {
    const parts = c.split(';').map((p) => p.trim());
    const [nameVal, ...attrs] = parts;
    const [name, ...valParts] = nameVal.split('=');
    const val = valParts.join('=');
    const flags = {};
    for (const attr of attrs) {
      const [k, ...vParts] = attr.split('=');
      flags[k.toLowerCase()] = vParts.length ? vParts.join('=') : true;
    }
    return { name, value: val, flags, raw: c };
  });
}

function req(server, options, bodyData = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const opt = {
      hostname: '127.0.0.1',
      port,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {},
    };
    const clientReq = http.request(opt, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch { /* not json */ }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          cookies: parseCookies(res.headers['set-cookie']),
          body: json || data,
        });
      });
    });
    clientReq.on('error', reject);
    if (bodyData) {
      clientReq.write(typeof bodyData === 'string' ? bodyData : JSON.stringify(bodyData));
    }
    clientReq.end();
  });
}

async function run() {
  console.log('='.repeat(60));
  console.log('Panther EV Authentication Cookie & CORS Verification');
  console.log('='.repeat(60));

  // Ensure test accounts exist in database
  const testUserEmail = 'authtest_user@pantherev.test';
  const testAdminEmail = 'authtest_admin@pantherev.test';
  const testPass = 'TestPass123!Secure';
  const hash = await bcrypt.hash(testPass, 10);

  await query('DELETE FROM users WHERE email = $1', [testUserEmail]);
  await query(
    'INSERT INTO users (name, email, password_hash, active, created_at, last_active_at) VALUES ($1, $2, $3, true, NOW(), NOW())',
    ['Test User', testUserEmail, hash]
  );

  const existingAdmin = await query('SELECT * FROM admins WHERE email = $1', [testAdminEmail]);
  if (!existingAdmin.rows.length) {
    await query(
      'INSERT INTO admins (name, email, password_hash, role, active, created_at, last_login_at) VALUES ($1, $2, $3, $4, true, NOW(), NOW())',
      ['Test Admin', testAdminEmail, hash, 'admin']
    );
  } else {
    await query('UPDATE admins SET password_hash = $1, active = true WHERE email = $2', [hash, testAdminEmail]);
  }

  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, '127.0.0.1', res));

  try {
    const vercelOrigin = 'https://panther-ev.vercel.app';

    // ==========================================
    // TEST 1: Production Mode (Cross-site Vercel -> Render)
    // ==========================================
    console.log('\n--- TEST 1: Production Mode (Cross-site Vercel -> Render) ---');
    process.env.NODE_ENV = 'production';
    env.isProd = true;

    // 1A. CORS Preflight
    console.log('\n1A. Testing CORS preflight from https://panther-ev.vercel.app...');
    const preflight = await req(server, {
      path: '/api/auth/login',
      method: 'OPTIONS',
      headers: {
        Origin: vercelOrigin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
    console.log('Preflight status:', preflight.status);
    console.log('Access-Control-Allow-Origin:', preflight.headers['access-control-allow-origin']);
    console.log('Access-Control-Allow-Credentials:', preflight.headers['access-control-allow-credentials']);
    if (
      preflight.headers['access-control-allow-origin'] === vercelOrigin &&
      preflight.headers['access-control-allow-credentials'] === 'true'
    ) {
      console.log('✓ PASS: CORS preflight allows exact Vercel origin with credentials: true (no wildcard)');
    } else {
      console.error('✗ FAIL: CORS preflight rejected or wildcard used');
      process.exit(1);
    }

    // 1B. User Login
    console.log('\n1B. Testing POST /api/auth/login (Customer)...');
    const userLogin = await req(
      server,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          Origin: vercelOrigin,
          'Content-Type': 'application/json',
        },
      },
      { email: testUserEmail, password: testPass }
    );

    console.log('Login status:', userLogin.status);
    console.log('Response body role:', userLogin.body?.role);
    console.log('User Cookie headers:');
    userLogin.cookies.forEach((c) => console.log('  ->', c.raw));

    const userCookie = userLogin.cookies.find((c) => c.name === 'panther_user' && c.value);
    if (!userCookie) {
      console.error('✗ FAIL: panther_user cookie was not issued');
      process.exit(1);
    }

    const sameSiteVal = userCookie.flags['samesite']?.toLowerCase();
    const isSecure = !!userCookie.flags['secure'];
    const isHttpOnly = !!userCookie.flags['httponly'];
    const pathVal = userCookie.flags['path'];

    if (sameSiteVal === 'none' && isSecure && isHttpOnly && pathVal === '/') {
      console.log('✓ PASS: panther_user cookie correctly set with SameSite=None, Secure, HttpOnly, Path=/');
    } else {
      console.error(`✗ FAIL: Cookie attributes invalid! SameSite=${sameSiteVal}, Secure=${isSecure}, HttpOnly=${isHttpOnly}, Path=${pathVal}`);
      process.exit(1);
    }

    // 1C. User GET /api/auth/me (Simulate page load / refresh on /account)
    console.log('\n1C. Testing GET /api/auth/me with panther_user cookie (Account refresh simulation)...');
    const meRes = await req(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}`,
      },
    });

    console.log('Me status:', meRes.status);
    console.log('Me body role:', meRes.body?.role);
    console.log('Me body user:', meRes.body?.account?.email);
    if (meRes.status === 200 && meRes.body?.role === 'user' && meRes.body?.account?.email === testUserEmail) {
      console.log('✓ PASS: GET /api/auth/me authenticated successfully via cross-site panther_user cookie!');
    } else {
      console.error('✗ FAIL: GET /api/auth/me failed to authenticate with cookie');
      process.exit(1);
    }

    // 1D. User Logout
    console.log('\n1D. Testing POST /api/auth/logout...');
    const logoutRes = await req(server, {
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}`,
      },
    });

    console.log('Logout status:', logoutRes.status);
    console.log('Logout clear cookies:');
    logoutRes.cookies.forEach((c) => console.log('  ->', c.raw));

    const clearedUserCookie = logoutRes.cookies.find((c) => c.name === 'panther_user');
    if (
      clearedUserCookie &&
      clearedUserCookie.flags['samesite']?.toLowerCase() === 'none' &&
      clearedUserCookie.flags['secure'] &&
      clearedUserCookie.flags['path'] === '/'
    ) {
      console.log('✓ PASS: panther_user cookie cleared with matching Path=/, Secure, SameSite=None');
    } else {
      console.error('✗ FAIL: Clear cookie attributes do not match creation attributes');
      process.exit(1);
    }

    // 1E. Subsequent GET /api/auth/me after logout
    console.log('\n1E. Verifying GET /api/auth/me after logout returns null...');
    const postLogoutMe = await req(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: { Origin: vercelOrigin },
    });
    if (postLogoutMe.body?.role === null && postLogoutMe.body?.account === null) {
      console.log('✓ PASS: Signed-out state verified (role: null, account: null)');
    } else {
      console.error('✗ FAIL: Signed-out state failed');
      process.exit(1);
    }

    // 1F. Admin Login via POST /api/admin/login
    console.log('\n1F. Testing POST /api/admin/login (Admin authentication)...');
    const adminLogin = await req(
      server,
      {
        path: '/api/admin/login',
        method: 'POST',
        headers: {
          Origin: vercelOrigin,
          'Content-Type': 'application/json',
        },
      },
      { email: testAdminEmail, password: testPass }
    );

    console.log('Admin login status:', adminLogin.status);
    const adminCookie = adminLogin.cookies.find((c) => c.name === 'panther_admin' && c.value);
    if (
      adminCookie &&
      adminCookie.flags['samesite']?.toLowerCase() === 'none' &&
      adminCookie.flags['secure'] &&
      adminCookie.flags['httponly'] &&
      adminCookie.flags['path'] === '/'
    ) {
      console.log('✓ PASS: panther_admin cookie correctly set with SameSite=None, Secure, HttpOnly, Path=/');
    } else {
      console.error('✗ FAIL: panther_admin cookie attributes invalid');
      process.exit(1);
    }

    // 1G. Admin GET /api/admin/me
    console.log('\n1G. Testing GET /api/admin/me with panther_admin cookie...');
    const adminMeRes = await req(server, {
      path: '/api/admin/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_admin=${adminCookie.value}`,
      },
    });
    console.log('Admin Me status:', adminMeRes.status);
    console.log('Admin email:', adminMeRes.body?.admin?.email);
    if (adminMeRes.status === 200 && adminMeRes.body?.admin?.email === testAdminEmail) {
      console.log('✓ PASS: GET /api/admin/me authenticated successfully via cross-site panther_admin cookie!');
    } else {
      console.error('✗ FAIL: GET /api/admin/me failed');
      process.exit(1);
    }

    // 1H. Admin Logout
    console.log('\n1H. Testing POST /api/admin/logout...');
    const adminLogoutRes = await req(server, {
      path: '/api/admin/logout',
      method: 'POST',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_admin=${adminCookie.value}`,
      },
    });
    const clearedAdminCookie = adminLogoutRes.cookies.find((c) => c.name === 'panther_admin');
    if (
      clearedAdminCookie &&
      clearedAdminCookie.flags['samesite']?.toLowerCase() === 'none' &&
      clearedAdminCookie.flags['secure'] &&
      clearedAdminCookie.flags['path'] === '/'
    ) {
      console.log('✓ PASS: panther_admin cookie cleared with matching SameSite=None, Secure, Path=/');
    } else {
      console.error('✗ FAIL: panther_admin clear cookie attributes do not match');
      process.exit(1);
    }

    // ==========================================
    // TEST 2: Local Development Mode (localhost)
    // ==========================================
    console.log('\n--- TEST 2: Local Development Mode (localhost:3000 -> localhost:5000) ---');
    process.env.NODE_ENV = 'development';
    env.isProd = false;

    console.log('\n2A. Testing POST /api/auth/login in Development Mode...');
    const devLogin = await req(
      server,
      {
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          Origin: 'http://localhost:3000',
          'Content-Type': 'application/json',
        },
      },
      { email: testUserEmail, password: testPass }
    );

    const devCookie = devLogin.cookies.find((c) => c.name === 'panther_user' && c.value);
    console.log('Dev Cookie header:', devCookie?.raw);
    const devSameSite = devCookie?.flags['samesite']?.toLowerCase();
    const devSecure = !!devCookie?.flags['secure'];

    if (devSameSite === 'lax' && !devSecure) {
      console.log('✓ PASS: Local dev cookie uses SameSite=Lax without Secure (compatible with plain HTTP localhost)');
    } else {
      console.error(`✗ FAIL: Local dev cookie should use SameSite=Lax and no Secure, got SameSite=${devSameSite}, Secure=${devSecure}`);
      process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('ALL AUTHENTICATION LIFECYCLE TESTS PASSED SUCCESSFULLY!');
    console.log('='.repeat(60));
  } finally {
    server.close();
    // Clean up test user
    await query('DELETE FROM users WHERE email = $1', [testUserEmail]);
    process.exit(0);
  }
}

run().catch((e) => {
  console.error('FATAL TEST ERROR:', e);
  process.exit(1);
});
