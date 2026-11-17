import http from 'node:http';
import app from '../app.js';
import { pool, query } from '../config/pg.js';

let server;
let port;
let baseUrl;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let json;
        try { json = JSON.parse(body); } catch { json = body; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json,
          cookies: res.headers['set-cookie'] || [],
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function extractCookie(cookieArray, name) {
  for (let i = cookieArray.length - 1; i >= 0; i--) {
    const c = cookieArray[i];
    if (c.startsWith(`${name}=`) && !c.startsWith(`${name}=;`)) {
      return c.split(';')[0];
    }
  }
  return null;
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('STARTING COMPLETE PANTHER EV BACKEND API INTEGRATION TEST BATTERY');
  console.log('='.repeat(70));

  // Start temporary test server
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
  console.log(`[INFO] Test server running on ${baseUrl}\n`);

  let adminCookie = '';
  let customerCookie = '';
  let testInquiryId = null;
  let testUserId = null;

  try {
    // 1. Health check
    console.log('[TEST 1] GET /api/health');
    const health = await request('/api/health');
    if (health.status !== 200 || !health.data.ok) throw new Error(`Health check failed: ${JSON.stringify(health.data)}`);
    console.log('  -> PASS: Health check OK');

    // 2. Public Catalog & Products
    console.log('[TEST 2] GET /api/products & GET /api/catalog');
    const prods = await request('/api/products');
    if (prods.status !== 200 || !Array.isArray(prods.data.products)) throw new Error('Failed to get public products');
    console.log(`  -> PASS: Retrieved ${prods.data.products.length} public vehicles`);

    const cat = await request('/api/catalog');
    if (cat.status !== 200 || !Array.isArray(cat.data.categories)) throw new Error('Failed to get public catalog');
    console.log(`  -> PASS: Retrieved ${cat.data.categories.length} categories, ${cat.data.products.length} catalog products`);

    // 3. Public Hero Slides & Finance Partners
    console.log('[TEST 3] GET /api/hero-slides & GET /api/finance-partners');
    const hero = await request('/api/hero-slides');
    if (hero.status !== 200 || !Array.isArray(hero.data.slides)) throw new Error('Failed to get hero slides');
    console.log(`  -> PASS: Retrieved ${hero.data.slides.length} hero slides and settings`);

    const finance = await request('/api/finance-partners');
    if (finance.status !== 200 || !Array.isArray(finance.data.partners)) throw new Error('Failed to get finance partners');
    console.log(`  -> PASS: Retrieved ${finance.data.partners.length} finance partners`);

    // 4. Admin Authentication
    console.log('[TEST 4] POST /api/admin/login (Failure + Success)');
    const badLogin = await request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'paulsubhasini31@gmail.com', password: 'wrongpassword' },
    });
    if (badLogin.status !== 401) throw new Error(`Expected 401 for bad password, got ${badLogin.status}`);
    console.log('  -> PASS: Bad login rejected with 401');

    const goodLogin = await request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'paulsubhasini31@gmail.com', password: 'admin@123' },
    });
    if (goodLogin.status !== 200 || !goodLogin.data.admin) throw new Error(`Admin login failed: ${JSON.stringify(goodLogin.data)}`);
    adminCookie = extractCookie(goodLogin.cookies, 'panther_admin');
    if (!adminCookie) throw new Error('Admin cookie panther_admin was not set!');
    console.log(`  -> PASS: Admin login succeeded for ${goodLogin.data.admin.email} (Role: ${goodLogin.data.admin.role})`);

    // 5. Admin /me & Dashboard
    console.log('[TEST 5] GET /api/admin/me & GET /api/admin/dashboard');
    const adminMe = await request('/api/admin/me', { headers: { Cookie: adminCookie } });
    if (adminMe.status !== 200 || adminMe.data.admin.email !== 'paulsubhasini31@gmail.com') throw new Error('Admin /me failed');
    console.log('  -> PASS: /api/admin/me session authenticated');

    const dash = await request('/api/admin/dashboard', { headers: { Cookie: adminCookie } });
    if (dash.status !== 200 || !dash.data.counts) throw new Error('Dashboard request failed');
    console.log(`  -> PASS: Dashboard scope "${dash.data.scope}" with counts:`, dash.data.counts);

    // 6. Admin Management List Endpoints
    console.log('[TEST 6] Admin Management Endpoints');
    const [adminProds, adminCats, adminFinance, adminHero, adminTeam, adminCustomers, adminInqs, adminAct] = await Promise.all([
      request('/api/admin/products', { headers: { Cookie: adminCookie } }),
      request('/api/admin/categories', { headers: { Cookie: adminCookie } }),
      request('/api/admin/finance-partners', { headers: { Cookie: adminCookie } }),
      request('/api/admin/hero-slides', { headers: { Cookie: adminCookie } }),
      request('/api/admin/team', { headers: { Cookie: adminCookie } }),
      request('/api/admin/customers', { headers: { Cookie: adminCookie } }),
      request('/api/admin/inquiries', { headers: { Cookie: adminCookie } }),
      request('/api/admin/activity', { headers: { Cookie: adminCookie } }),
    ]);

    if (adminProds.status !== 200) throw new Error('Admin products failed');
    if (adminCats.status !== 200) throw new Error('Admin categories failed');
    if (adminFinance.status !== 200) throw new Error('Admin finance partners failed');
    if (adminHero.status !== 200) throw new Error('Admin hero slides failed');
    if (adminTeam.status !== 200) throw new Error('Admin team list failed');
    if (adminCustomers.status !== 200) throw new Error('Admin customers list failed');
    if (adminInqs.status !== 200) throw new Error('Admin inquiries list failed');
    if (adminAct.status !== 200) throw new Error('Admin activity feed failed');
    console.log('  -> PASS: All 8 Admin list endpoints responded with 200 OK');

    // 7. Inquiry Workflow (Create -> View -> Update Status -> Add Note -> Delete)
    console.log('[TEST 7] Enquiry Workflow');
    const newInquiry = await request('/api/inquiries/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Automated Test User', phone: '9876543210', message: 'Testing migration enquiry workflow' },
    });
    if (newInquiry.status !== 201 || !newInquiry.data.id) throw new Error(`Create inquiry failed: ${JSON.stringify(newInquiry.data)}`);
    testInquiryId = newInquiry.data.id;
    console.log(`  -> PASS: Quick enquiry created with ID: ${testInquiryId}`);

    const getInq = await request(`/api/admin/inquiries/${testInquiryId}`, { headers: { Cookie: adminCookie } });
    if (getInq.status !== 200 || getInq.data.inquiry.name !== 'Automated Test User') throw new Error('Get inquiry failed');
    console.log('  -> PASS: Retrieved enquiry with history and details');

    const updateStatus = await request(`/api/admin/inquiries/${testInquiryId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: { status: 'in_progress', note: 'Customer contacted via phone' },
    });
    if (updateStatus.status !== 200 || updateStatus.data.inquiry.status !== 'in_progress') throw new Error('Update inquiry status failed');
    console.log('  -> PASS: Updated enquiry status to in_progress with progress note');

    const addNote = await request(`/api/admin/inquiries/${testInquiryId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: { type: 'note', message: 'Follow up scheduled for tomorrow 10am', visibility: 'internal' },
    });
    if (addNote.status !== 201 || !addNote.data.entry) throw new Error('Add note failed');
    console.log('  -> PASS: Added internal staff note to enquiry');

    const deleteInq = await request(`/api/admin/inquiries/${testInquiryId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    if (deleteInq.status !== 200) throw new Error('Delete inquiry failed');
    console.log('  -> PASS: Test enquiry cleaned up');
    testInquiryId = null;

    // 8. Customer Registration & Authentication
    console.log('[TEST 8] Customer Registration & Authentication');
    const testEmail = `test_customer_${Date.now()}@pantherev.test`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Test Customer', email: testEmail, phone: '9988776655', password: 'Password@123' },
    });
    if (regRes.status !== 201 || !regRes.data.account) throw new Error(`Customer register failed: ${JSON.stringify(regRes.data)}`);
    testUserId = regRes.data.account.id;
    customerCookie = extractCookie(regRes.cookies, 'panther_user');
    if (!customerCookie) throw new Error('Customer cookie panther_user was not set!');
    console.log(`  -> PASS: Registered test customer ${testEmail} with ID: ${testUserId}`);

    const custMe = await request('/api/auth/me', { headers: { Cookie: customerCookie } });
    if (custMe.status !== 200 || custMe.data.account.email !== testEmail) throw new Error('Customer /me failed');
    console.log('  -> PASS: Customer /me authenticated successfully');

    const updateProf = await request('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: customerCookie },
      body: { name: 'Updated Customer Name', phone: '9988776600', address: { city: 'Bhubaneswar', state: 'Odisha' } },
    });
    if (updateProf.status !== 200 || updateProf.data.account.name !== 'Updated Customer Name') throw new Error('Update customer profile failed');
    console.log('  -> PASS: Customer profile updated');

    // Clean up test customer
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
    console.log('  -> PASS: Test customer cleaned up from database');
    testUserId = null;

    console.log('\n' + '='.repeat(70));
    console.log('ALL API INTEGRATION TESTS PASSED 100% SUCCESSFULLY!');
    console.log('='.repeat(70));
  } catch (err) {
    console.error('\n[FATAL ERROR IN API TEST BATTERY]:', err.message);
    if (testInquiryId) {
      await query('DELETE FROM inquiries WHERE id = $1', [testInquiryId]).catch(() => {});
      await query('DELETE FROM inquiry_activities WHERE inquiry_id = $1', [testInquiryId]).catch(() => {});
    }
    if (testUserId) {
      await query('DELETE FROM users WHERE id = $1', [testUserId]).catch(() => {});
    }
    process.exit(1);
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  }
}

runTests();
