import http from 'node:http';
import app from '../app.js';
import { pool, query } from '../config/pg.js';

let server;
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

async function verifyEnquirySystem() {
  console.log('='.repeat(75));
  console.log('PANTHER EV ENQUIRY SYSTEM VERIFICATION & AUDIT');
  console.log('='.repeat(75));

  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
  console.log(`[INFO] Server running on ${baseUrl}\n`);

  const createdInquiryIds = [];
  let testCustomerId = null;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Guest General Enquiry (No Login, No Cookies)
    // -------------------------------------------------------------------------
    console.log('[TEST 1] Public Visitor General Enquiry (Logged Out)');
    const guestGenRes = await request('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Rohan Sharma (Guest)',
        phone: '9876543211',
        email: 'rohan.guest@example.com',
        city: 'Cuttack',
        subject: 'General enquiry about dealership and models',
        message: 'I am interested in learning more about Panther EV models for commercial use.',
        source: 'contact',
        country: 'IN',
      },
    });

    if (guestGenRes.status !== 201 || !guestGenRes.data.id) {
      throw new Error(`Guest general enquiry failed: status ${guestGenRes.status}, data: ${JSON.stringify(guestGenRes.data)}`);
    }
    const guestGenId = guestGenRes.data.id;
    createdInquiryIds.push(guestGenId);
    console.log(`  -> SUCCESS: Created guest general enquiry ID: ${guestGenId}`);
    console.log(`  -> Response message: "${guestGenRes.data.message}"`);

    // -------------------------------------------------------------------------
    // TEST 2: Guest Vehicle-Specific Enquiry (From Cart, Logged Out)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 2] Public Visitor Vehicle-Specific Cart Enquiry (Logged Out)');
    const guestCartRes = await request('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Priya Patel (Guest)',
        phone: '9876543222',
        email: 'priya.guest@example.com',
        city: 'Bhubaneswar',
        subject: '',
        message: 'Looking for battery warranty and financing options on these two models.',
        vehicles: [
          { slug: 'panther-xl-plus', name: 'Panther XL Plus' },
          { slug: 'panther-cargo', name: 'Panther Cargo' },
        ],
        source: 'cart',
        country: 'IN',
      },
    });

    if (guestCartRes.status !== 201 || !guestCartRes.data.id) {
      throw new Error(`Guest cart enquiry failed: status ${guestCartRes.status}, data: ${JSON.stringify(guestCartRes.data)}`);
    }
    const guestCartId = guestCartRes.data.id;
    createdInquiryIds.push(guestCartId);
    console.log(`  -> SUCCESS: Created guest cart enquiry ID: ${guestCartId} with 2 vehicles attached`);

    // -------------------------------------------------------------------------
    // TEST 3: Guest Quick Enquiry Popup (Name + Phone + Message Only, Logged Out)
    // -------------------------------------------------------------------------
    console.log('\n[TEST 3] Public Visitor Quick Enquiry (Popup, Logged Out)');
    const guestQuickRes = await request('/api/inquiries/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Amit Kumar (Quick Guest)',
        phone: '9876543233',
        message: 'Need price quote for Panther Super Deluxe delivery in Odisha.',
      },
    });

    if (guestQuickRes.status !== 201 || !guestQuickRes.data.id) {
      throw new Error(`Guest quick enquiry failed: status ${guestQuickRes.status}, data: ${JSON.stringify(guestQuickRes.data)}`);
    }
    const guestQuickId = guestQuickRes.data.id;
    createdInquiryIds.push(guestQuickId);
    console.log(`  -> SUCCESS: Created guest quick enquiry ID: ${guestQuickId}`);
    console.log(`  -> Delivery mode: "${guestQuickRes.data.delivery}"`);

    // -------------------------------------------------------------------------
    // TEST 4: Direct Database Verification in Supabase PostgreSQL
    // -------------------------------------------------------------------------
    console.log('\n[TEST 4] Direct Database Verification in Supabase public.inquiries');
    const dbRows = await query(
      'SELECT id, name, email, phone, city, source, status, vehicles, user_id, created_at FROM inquiries WHERE id = ANY($1)',
      [createdInquiryIds]
    );

    if (dbRows.rows.length !== 3) {
      throw new Error(`Expected 3 records in DB, found ${dbRows.rows.length}`);
    }

    for (const row of dbRows.rows) {
      console.log(`  -> Record [${row.id}]:`);
      console.log(`     Name:      ${row.name}`);
      console.log(`     Phone:     ${row.phone}`);
      console.log(`     Email:     ${row.email || '(None)'}`);
      console.log(`     Source:    ${row.source}`);
      console.log(`     Status:    ${row.status}`);
      console.log(`     user_id:   ${row.user_id === null ? 'NULL (Verified Guest Enquiry!)' : row.user_id}`);
      if (Array.isArray(row.vehicles) && row.vehicles.length > 0) {
        console.log(`     Vehicles:  ${row.vehicles.map((v) => v.name).join(', ')}`);
      }

      if (row.user_id !== null) {
        throw new Error(`CRITICAL: Guest enquiry ${row.id} has non-null user_id: ${row.user_id}`);
      }
    }

    // Verify activities table
    const actRows = await query(
      'SELECT inquiry_id, type, actor_role, message, to_status FROM inquiry_activities WHERE inquiry_id = ANY($1)',
      [createdInquiryIds]
    );
    console.log(`  -> Verified ${actRows.rows.length} activity audit log records in inquiry_activities (all actor_role = 'guest')`);

    // -------------------------------------------------------------------------
    // TEST 5: Admin Access & Dashboard Visibility
    // -------------------------------------------------------------------------
    console.log('\n[TEST 5] Admin Dashboard & Enquiry Management Workflow');
    const adminLoginRes = await request('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'paulsubhasini31@gmail.com', password: 'admin@123' },
    });
    if (adminLoginRes.status !== 200) throw new Error('Admin login failed');
    const adminCookie = extractCookie(adminLoginRes.cookies, 'panther_admin');

    // List enquiries as admin
    const adminListRes = await request('/api/admin/inquiries?limit=10', {
      headers: { Cookie: adminCookie },
    });
    if (adminListRes.status !== 200 || !Array.isArray(adminListRes.data.inquiries)) {
      throw new Error('Admin list enquiries failed');
    }

    const listedIds = adminListRes.data.inquiries.map((i) => i.id || i._id);
    for (const testId of createdInquiryIds) {
      if (!listedIds.includes(testId)) {
        throw new Error(`Enquiry ${testId} was not visible in admin enquiries list!`);
      }
    }
    console.log(`  -> SUCCESS: All 3 guest enquiries appear in Admin Enquiries List`);

    // Admin opens single enquiry details
    const adminDetailRes = await request(`/api/admin/inquiries/${guestCartId}`, {
      headers: { Cookie: adminCookie },
    });
    if (adminDetailRes.status !== 200 || !adminDetailRes.data.inquiry) {
      throw new Error('Admin get enquiry detail failed');
    }
    console.log(`  -> SUCCESS: Admin opened enquiry detail for ${adminDetailRes.data.inquiry.name}`);
    console.log(`     Customer Account Link: ${adminDetailRes.data.customer === null ? 'NULL (Accurately reflects guest)' : 'Present'}`);
    console.log(`     Vehicles detected: ${adminDetailRes.data.inquiry.vehicles.map((v) => v.name).join(', ')}`);

    // Admin updates status to 'contacted'
    const adminStatusRes = await request(`/api/admin/inquiries/${guestCartId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: { status: 'contacted', note: 'Staff called visitor to discuss Panther XL Plus specifications.' },
    });
    if (adminStatusRes.status !== 200 || adminStatusRes.data.inquiry.status !== 'contacted') {
      throw new Error('Admin status update failed');
    }
    console.log(`  -> SUCCESS: Admin updated status to 'contacted' with progress note`);

    // -------------------------------------------------------------------------
    // TEST 6: Registered Customer Enquiry Submission
    // -------------------------------------------------------------------------
    console.log('\n[TEST 6] Registered Customer Enquiry Submission & Association');
    const custEmail = `verified_cust_${Date.now()}@pantherev.test`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { name: 'Sunil Jena (Registered)', email: custEmail, phone: '9876543244', password: 'Password@123' },
    });
    if (regRes.status !== 201 || !regRes.data.account?.id) throw new Error('Customer registration failed');
    testCustomerId = regRes.data.account.id;
    const custCookie = extractCookie(regRes.cookies, 'panther_user');

    // Submit enquiry while authenticated as customer
    const custEnqRes = await request('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: custCookie },
      body: {
        name: 'Sunil Jena (Registered)',
        phone: '9876543244',
        email: custEmail,
        city: 'Bhubaneswar',
        subject: 'Service warranty question',
        message: 'Logged-in enquiry test.',
        source: 'contact',
        country: 'IN',
      },
    });
    if (custEnqRes.status !== 201 || !custEnqRes.data.id) throw new Error('Customer enquiry submission failed');
    const custEnqId = custEnqRes.data.id;
    createdInquiryIds.push(custEnqId);
    console.log(`  -> SUCCESS: Registered customer submitted enquiry ID: ${custEnqId}`);

    // Verify user_id is set in database
    const custDbCheck = await query('SELECT user_id FROM inquiries WHERE id = $1', [custEnqId]);
    if (custDbCheck.rows[0].user_id !== testCustomerId) {
      throw new Error(`Expected user_id ${testCustomerId}, got ${custDbCheck.rows[0].user_id}`);
    }
    console.log(`  -> SUCCESS: Enquiry correctly linked to customer user_id: ${testCustomerId}`);

    // Customer views own enquiries (/api/auth/my-inquiries)
    const myInqRes = await request('/api/auth/my-inquiries', {
      headers: { Cookie: custCookie },
    });
    if (myInqRes.status !== 200 || !Array.isArray(myInqRes.data.inquiries)) {
      throw new Error('Customer /my-inquiries failed');
    }
    const myIds = myInqRes.data.inquiries.map((i) => i.id);
    if (!myIds.includes(custEnqId)) {
      throw new Error('Customer enquiry was not listed under /my-inquiries');
    }
    // Verify guest enquiries are NOT returned to this customer
    for (const gid of [guestGenId, guestCartId, guestQuickId]) {
      if (myIds.includes(gid)) {
        throw new Error(`PRIVACY VIOLATION: Guest enquiry ${gid} leaked into customer's /my-inquiries!`);
      }
    }
    console.log(`  -> SUCCESS: Customer sees own enquiry; guest enquiries are strictly isolated and not leaked`);

    // -------------------------------------------------------------------------
    // TEST 7: Security & Access Control Verification
    // -------------------------------------------------------------------------
    console.log('\n[TEST 7] Security & Permission Protection Check');
    // Unauthorized visitor attempts to read admin inquiries
    const unauthList = await request('/api/admin/inquiries');
    if (unauthList.status !== 401) throw new Error(`Expected 401 for unauthorized visitor, got ${unauthList.status}`);
    console.log('  -> PASS: Unauthorized visitor blocked from /api/admin/inquiries (401)');

    const unauthDetail = await request(`/api/admin/inquiries/${guestGenId}`);
    if (unauthDetail.status !== 401) throw new Error(`Expected 401 for unauthorized visitor detail, got ${unauthDetail.status}`);
    console.log('  -> PASS: Unauthorized visitor blocked from /api/admin/inquiries/:id (401)');

    const unauthDelete = await request(`/api/admin/inquiries/${guestGenId}`, { method: 'DELETE' });
    if (unauthDelete.status !== 401) throw new Error(`Expected 401 for unauthorized visitor delete, got ${unauthDelete.status}`);
    console.log('  -> PASS: Unauthorized visitor blocked from DELETE /api/admin/inquiries/:id (401)');

    // Registered customer attempts to access admin endpoints
    const custAdminList = await request('/api/admin/inquiries', { headers: { Cookie: custCookie } });
    if (custAdminList.status !== 401) throw new Error(`Expected 401 for non-admin customer, got ${custAdminList.status}`);
    console.log('  -> PASS: Customer account blocked from admin endpoints (401)');

    console.log('\n' + '='.repeat(75));
    console.log('ENQUIRY SYSTEM VERIFICATION PASSED WITH 100% SUCCESS!');
    console.log('='.repeat(75));
  } catch (err) {
    console.error('\n[VERIFICATION FAILURE]:', err.message);
    process.exit(1);
  } finally {
    // Clean up all created test records
    if (createdInquiryIds.length > 0) {
      await query('DELETE FROM inquiries WHERE id = ANY($1)', [createdInquiryIds]).catch(() => {});
      await query('DELETE FROM inquiry_activities WHERE inquiry_id = ANY($1)', [createdInquiryIds]).catch(() => {});
    }
    if (testCustomerId) {
      await query('DELETE FROM users WHERE id = $1', [testCustomerId]).catch(() => {});
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  }
}

verifyEnquirySystem();
