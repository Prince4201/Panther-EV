import http from 'node:http';
import jwt from 'jsonwebtoken';
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
  console.log('Panther EV Comprehensive Authentication & Session Verification');
  console.log('='.repeat(60));

  // Ensure test accounts exist in database
  const testUserEmail = 'authtest_user@pantherev.test';
  const testAdminEmail = 'authtest_admin@pantherev.test';
  const testPass = 'TestPass123!Secure';
  const hash = await bcrypt.hash(testPass, 10);

  await query('DELETE FROM users WHERE email = $1', [testUserEmail]);
  const userInsertRes = await query(
    'INSERT INTO users (name, email, password_hash, active, created_at, last_active_at) VALUES ($1, $2, $3, true, NOW(), NOW()) RETURNING id',
    ['Test User', testUserEmail, hash]
  );
  const testUserId = userInsertRes.rows[0].id;

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

    // 1B. User Login & Cookie Creation
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

    // Verify NO duplicate Set-Cookie for panther_user
    const userCookies = userLogin.cookies.filter((c) => c.name === 'panther_user');
    if (userCookies.length !== 1) {
      console.error(`✗ FAIL: Expected exactly 1 panther_user Set-Cookie header, got ${userCookies.length} (duplicate deletion+set bug!)`);
      process.exit(1);
    }
    console.log('✓ PASS: No conflicting duplicate Set-Cookie: panther_user headers sent');

    const userCookie = userCookies[0];
    const sameSiteVal = userCookie.flags['samesite']?.toLowerCase();
    const isSecure = !!userCookie.flags['secure'];
    const isHttpOnly = !!userCookie.flags['httponly'];
    const isPartitioned = !!userCookie.flags['partitioned'];
    const pathVal = userCookie.flags['path'];

    if (sameSiteVal === 'none' && isSecure && isHttpOnly && isPartitioned && pathVal === '/') {
      console.log('✓ PASS: panther_user cookie correctly configured with SameSite=None, Secure, HttpOnly, Partitioned, Path=/');
    } else {
      console.error(`✗ FAIL: Cookie attributes invalid! SameSite=${sameSiteVal}, Secure=${isSecure}, HttpOnly=${isHttpOnly}, Partitioned=${isPartitioned}, Path=${pathVal}`);
      process.exit(1);
    }

    // 1C. Cache-Control and ETag Verification on /api/auth/me
    console.log('\n1C. Testing Cache-Control, ETag, and Conditional GET on /api/auth/me...');
    const initialMeRes = await req(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}`,
      },
    });

    console.log('Cache-Control:', initialMeRes.headers['cache-control']);
    console.log('ETag header present:', !!initialMeRes.headers['etag']);
    if (
      initialMeRes.headers['cache-control']?.includes('no-store') &&
      !initialMeRes.headers['etag']
    ) {
      console.log('✓ PASS: Cache-Control: no-store set and ETag disabled (eliminates 304 caching bug)');
    } else {
      console.error('✗ FAIL: Cache-Control missing no-store or ETag still present');
      process.exit(1);
    }

    // Verify conditional request (If-None-Match) NEVER returns 304
    const conditionalMeRes = await req(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        'If-None-Match': 'W/"1c-e7wIeT97aC10p+nsuC7p6x8VzVU"',
        Cookie: `panther_user=${userCookie.value}`,
      },
    });
    console.log('Conditional request status:', conditionalMeRes.status);
    if (conditionalMeRes.status === 200 && conditionalMeRes.body?.role === 'user') {
      console.log('✓ PASS: Conditional request returns 200 OK with fresh data (NEVER 304 Not Modified)');
    } else {
      console.error(`✗ FAIL: Expected 200 OK, got ${conditionalMeRes.status}`);
      process.exit(1);
    }

    // 1D. Authenticated /api/auth/my-inquiries
    console.log('\n1D. Testing GET /api/auth/my-inquiries with authenticated customer cookie...');
    const inqRes = await req(server, {
      path: '/api/auth/my-inquiries',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}`,
      },
    });
    console.log('My-inquiries status:', inqRes.status);
    console.log('My-inquiries response:', JSON.stringify(inqRes.body));
    if (inqRes.status === 200 && Array.isArray(inqRes.body?.inquiries)) {
      console.log('✓ PASS: GET /api/auth/my-inquiries returns 200 OK with inquiries array!');
    } else {
      console.error('✗ FAIL: GET /api/auth/my-inquiries failed to authenticate');
      process.exit(1);
    }

    // 1E. Unauthenticated /api/auth/my-inquiries (Must return 401)
    console.log('\n1E. Testing GET /api/auth/my-inquiries without cookie (Expected 401)...');
    const unauthInq = await req(server, {
      path: '/api/auth/my-inquiries',
      method: 'GET',
      headers: { Origin: vercelOrigin },
    });
    console.log('Unauthenticated status:', unauthInq.status);
    if (unauthInq.status === 401) {
      console.log('✓ PASS: Unauthenticated request rejected with HTTP 401 as expected');
    } else {
      console.error(`✗ FAIL: Expected 401, got ${unauthInq.status}`);
      process.exit(1);
    }

    // 1F. Page Refresh Simulation (Multiple GET /api/auth/me requests)
    console.log('\n1F. Testing simulated browser page refresh on /account...');
    const refreshMeRes = await req(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}`,
      },
    });
    if (refreshMeRes.status === 200 && refreshMeRes.body?.role === 'user' && refreshMeRes.body?.account?.email === testUserEmail) {
      console.log('✓ PASS: Page refresh preserves authentication state seamlessly');
    } else {
      console.error('✗ FAIL: Page refresh failed to restore session');
      process.exit(1);
    }

    // 1G. Invalid & Expired Token Rejection
    console.log('\n1G. Testing invalid / expired / tampered token handling...');
    // Tampered token
    const tamperedRes = await req(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}invalidSignature`,
      },
    });
    if (tamperedRes.status === 200 && tamperedRes.body?.role === null && tamperedRes.body?.account === null) {
      console.log('✓ PASS: Tampered token safely rejected by /api/auth/me (returns null session without 500)');
    } else {
      console.error('✗ FAIL: Tampered token not handled safely');
      process.exit(1);
    }

    const tamperedInq = await req(server, {
      path: '/api/auth/my-inquiries',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${userCookie.value}invalidSignature`,
      },
    });
    if (tamperedInq.status === 401) {
      console.log('✓ PASS: Tampered token returns 401 on protected endpoint');
    } else {
      console.error('✗ FAIL: Tampered token should return 401 on protected endpoint');
      process.exit(1);
    }

    // Expired token simulation
    const expiredToken = jwt.sign(
      { sub: testUserId, kind: 'user', tv: 0 },
      env.jwtSecret,
      { expiresIn: '-1s' }
    );
    const expiredInq = await req(server, {
      path: '/api/auth/my-inquiries',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_user=${expiredToken}`,
      },
    });
    if (expiredInq.status === 401) {
      console.log('✓ PASS: Expired token returns 401 on protected endpoint');
    } else {
      console.error('✗ FAIL: Expired token should return 401');
      process.exit(1);
    }

    // 1H. User Logout
    console.log('\n1H. Testing POST /api/auth/logout...');
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
      clearedUserCookie.flags['partitioned'] &&
      clearedUserCookie.flags['path'] === '/'
    ) {
      console.log('✓ PASS: panther_user cookie cleared with matching Path=/, Secure, SameSite=None, Partitioned');
    } else {
      console.error('✗ FAIL: Clear cookie attributes do not match creation attributes');
      process.exit(1);
    }

    // 1I. Admin Authentication (POST /api/admin/login -> GET /api/admin/me -> POST /api/admin/logout)
    console.log('\n1I. Testing Admin authentication lifecycle...');
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
      adminCookie.flags['partitioned'] &&
      adminCookie.flags['path'] === '/'
    ) {
      console.log('✓ PASS: panther_admin cookie correctly set with SameSite=None, Secure, HttpOnly, Partitioned, Path=/');
    } else {
      console.error('✗ FAIL: panther_admin cookie attributes invalid');
      process.exit(1);
    }

    const adminMeRes = await req(server, {
      path: '/api/admin/me',
      method: 'GET',
      headers: {
        Origin: vercelOrigin,
        Cookie: `panther_admin=${adminCookie.value}`,
      },
    });
    if (adminMeRes.status === 200 && adminMeRes.body?.admin?.email === testAdminEmail) {
      console.log('✓ PASS: GET /api/admin/me authenticated successfully via cross-site panther_admin cookie!');
    } else {
      console.error('✗ FAIL: GET /api/admin/me failed');
      process.exit(1);
    }

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
      clearedAdminCookie.flags['partitioned'] &&
      clearedAdminCookie.flags['path'] === '/'
    ) {
      console.log('✓ PASS: panther_admin cookie cleared with matching SameSite=None, Secure, Partitioned, Path=/');
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
