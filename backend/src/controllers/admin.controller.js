import bcrypt from 'bcryptjs';
import { query, getClient } from '../config/pg.js';
import { ENQUIRY_SCOPES, PERMISSIONS, ROLES, can } from '../lib/permissions.js';
import { audit } from '../lib/audit.js';
import { revalidateSite } from '../lib/revalidate.js';
import {
  mapAdmin,
  mapUser,
  mapProduct,
  mapInquiry,
  mapInquiryActivity,
  mapActivityLog,
} from '../lib/mappers.js';

const actorOf = (a) => ({ id: a.id, name: a.name, role: a.role });
const OPEN = ['new', 'assigned', 'contacted', 'in_progress', 'waiting_for_user'];
const DONE = ['completed', 'converted'];
const isSuper = (a) => a.role === ROLES.SUPER_ADMIN;
const sees = (a) => isSuper(a) || can(a, 'enquiries.all');

// Which enquiries an admin may open: all of them, or the ones assigned to them plus any slice (services / dealership) they were granted.
const scopes = (a) => Object.entries(ENQUIRY_SCOPES).filter(([perm]) => can(a, perm)).map(([, re]) => re);

function buildVisibleWhere(a, paramOffset = 1) {
  if (sees(a)) {
    return { clause: '1=1', params: [], nextIndex: paramOffset };
  }
  const params = [a.id];
  let clause = `(i.assigned_to = $${paramOffset}`;
  let idx = paramOffset + 1;

  const adminScopes = scopes(a);
  if (adminScopes.length > 0) {
    const patterns = adminScopes.map((re) => re.source).join('|');
    clause += ` OR i.subject ~* $${idx++}`;
    params.push(patterns);
  }
  clause += ')';
  return { clause, params, nextIndex: idx };
}

const mayOpen = (a, inquiry) =>
  sees(a) || String(inquiry.assignedTo) === String(a.id) || scopes(a).some((re) => re.test(inquiry.subject || ''));

const paging = (q) => {
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 25));
  return { page, limit, skip: (page - 1) * limit };
};

// ================= Dashboard =================
export async function dashboard(req, res) {
  const a = req.admin;

  if (!isSuper(a) && !can(a, 'dashboard.view')) {
    const [totRes, openRes, doneRes, recRes] = await Promise.all([
      query('SELECT count(*)::int AS c FROM inquiries WHERE assigned_to = $1', [a.id]),
      query('SELECT count(*)::int AS c FROM inquiries WHERE assigned_to = $1 AND status = ANY($2)', [a.id, OPEN]),
      query('SELECT count(*)::int AS c FROM inquiries WHERE assigned_to = $1 AND status = ANY($2)', [a.id, DONE]),
      query('SELECT * FROM inquiries WHERE assigned_to = $1 ORDER BY updated_at DESC LIMIT 6', [a.id]),
    ]);
    return res.json({
      scope: 'admin',
      counts: {
        assigned: totRes.rows[0].c,
        open: openRes.rows[0].c,
        completed: doneRes.rows[0].c,
      },
      recentEnquiries: recRes.rows.map(mapInquiry),
    });
  }

  const { clause: visClause, params: visParams } = buildVisibleWhere(a, 1);

  const [
    usersRes,
    activeUsersRes,
    totalEnqRes,
    byStatusRes,
    productsRes,
    adminsRes,
    teamRes,
    activeTeamRes,
    financeRes,
    recentEnqRes,
    recentUsersRes,
    recentActRes,
    workloadRes,
  ] = await Promise.all([
    query('SELECT count(*)::int AS c FROM users'),
    query('SELECT count(*)::int AS c FROM users WHERE active = true'),
    query('SELECT count(*)::int AS c FROM inquiries'),
    query('SELECT status AS _id, count(*)::int AS n FROM inquiries GROUP BY status'),
    query('SELECT count(*)::int AS c FROM products'),
    query("SELECT count(*)::int AS c FROM admins WHERE role = 'admin'"),
    query('SELECT count(*)::int AS c FROM admins'),
    query('SELECT count(*)::int AS c FROM admins WHERE active = true'),
    query('SELECT count(*)::int AS c FROM finance_partners'),
    query(
      `SELECT i.*, a.name AS assigned_to_name
       FROM inquiries i
       LEFT JOIN admins a ON i.assigned_to = a.id
       WHERE ${visClause}
       ORDER BY i.created_at DESC LIMIT 6`,
      visParams
    ),
    can(a, 'customers.view')
      ? query('SELECT id, name, email, created_at, active FROM users ORDER BY created_at DESC LIMIT 6')
      : Promise.resolve(null),
    can(a, 'activity.view')
      ? query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10')
      : Promise.resolve(null),
    isSuper(a)
      ? query(
          'SELECT assigned_to AS _id, count(*)::int AS open FROM inquiries WHERE assigned_to IS NOT NULL AND status = ANY($1) GROUP BY assigned_to',
          [OPEN]
        )
      : Promise.resolve(null),
  ]);

  const s = Object.fromEntries(byStatusRes.rows.map((x) => [x._id, x.n]));
  const recentEnquiries = recentEnqRes.rows.map((r) => {
    const inq = mapInquiry(r);
    inq.assignedTo = r.assigned_to ? { id: r.assigned_to, name: r.assigned_to_name } : null;
    return inq;
  });

  const recentUsers = recentUsersRes
    ? recentUsersRes.rows.map((u) => ({ id: u.id, name: u.name, email: u.email, createdAt: u.created_at, active: u.active }))
    : null;
  const recentActivity = recentActRes ? recentActRes.rows.map(mapActivityLog) : null;
  const workload = workloadRes ? workloadRes.rows : null;

  res.json({
    scope: isSuper(a) ? 'super_admin' : 'overview',
    counts: {
      users: usersRes.rows[0].c,
      activeUsers: activeUsersRes.rows[0].c,
      enquiries: totalEnqRes.rows[0].c,
      pending: (s.new || 0) + (s.assigned || 0),
      inProgress: (s.contacted || 0) + (s.in_progress || 0) + (s.waiting_for_user || 0),
      completed: (s.completed || 0) + (s.converted || 0),
      cancelled: s.cancelled || 0,
      products: productsRes.rows[0].c,
      admins: adminsRes.rows[0].c,
      team: teamRes.rows[0].c,
      activeTeam: activeTeamRes.rows[0].c,
      financePartners: financeRes.rows[0].c,
    },
    byStatus: s,
    recentEnquiries,
    ...(recentUsers ? { recentUsers } : {}),
    ...(recentActivity ? { recentActivity } : {}),
    ...(isSuper(a) ? { workload } : {}),
  });
}

export async function activityFeed(req, res) {
  const { page, limit, skip } = paging(req.query);
  const conditions = [];
  const params = [];
  let idx = 1;

  if (req.query.entityType) {
    conditions.push(`entity_type = $${idx++}`);
    params.push(String(req.query.entityType));
  }
  if (req.query.actor) {
    conditions.push(`actor_id = $${idx++}`);
    params.push(String(req.query.actor));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const itemsSql = `SELECT * FROM activity_logs ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  const countSql = `SELECT count(*)::int AS c FROM activity_logs ${whereClause}`;

  const [itemsRes, countRes] = await Promise.all([
    query(itemsSql, [...params, limit, skip]),
    query(countSql, params),
  ]);

  res.json({
    items: itemsRes.rows.map(mapActivityLog),
    total: countRes.rows[0].c,
    page,
    limit,
  });
}

// ================= Enquiries =================
export async function listInquiries(req, res) {
  const a = req.admin;
  const { page, limit, skip } = paging(req.query);

  const conditions = [];
  const params = [];
  let idx = 1;

  if (!sees(a)) {
    const { clause: visClause, params: visParams, nextIndex } = buildVisibleWhere(a, idx);
    conditions.push(visClause);
    params.push(...visParams);
    idx = nextIndex;
  } else if (req.query.assignee === 'unassigned') {
    conditions.push('i.assigned_to IS NULL');
  } else if (req.query.assignee) {
    conditions.push(`i.assigned_to = $${idx++}`);
    params.push(String(req.query.assignee));
  }

  if (req.query.mine === '1') {
    conditions.push(`i.assigned_to = $${idx++}`);
    params.push(a.id);
  }
  if (req.query.status) {
    conditions.push(`i.status = $${idx++}`);
    params.push(String(req.query.status));
  }
  if (req.query.source) {
    conditions.push(`i.source = $${idx++}`);
    params.push(String(req.query.source));
  }
  if (req.query.q) {
    const term = `%${String(req.query.q).slice(0, 80)}%`;
    conditions.push(`(
      i.name ILIKE $${idx} OR i.email ILIKE $${idx} OR i.phone ILIKE $${idx} OR
      i.city ILIKE $${idx} OR i.subject ILIKE $${idx} OR i.message ILIKE $${idx} OR
      i.vehicle_interest ILIKE $${idx}
    )`);
    params.push(term);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const itemsSql = `
    SELECT i.*, adm.name AS assigned_to_name, adm.email AS assigned_to_email
    FROM inquiries i
    LEFT JOIN admins adm ON i.assigned_to = adm.id
    ${whereClause}
    ORDER BY i.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  const countSql = `SELECT count(*)::int AS c FROM inquiries i ${whereClause}`;

  const [itemsRes, countRes] = await Promise.all([
    query(itemsSql, [...params, limit, skip]),
    query(countSql, params),
  ]);

  const items = itemsRes.rows.map((r) => {
    const inq = mapInquiry(r);
    inq.assignedTo = r.assigned_to ? { id: r.assigned_to, name: r.assigned_to_name, email: r.assigned_to_email } : null;
    return inq;
  });

  res.json({ inquiries: items, total: countRes.rows[0].c, page, limit });
}

async function loadAccessible(req, res) {
  const { rows } = await query('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
  if (rows.length === 0) {
    res.status(404).json({ message: 'Enquiry not found.' });
    return null;
  }
  const inquiry = mapInquiry(rows[0]);
  if (!mayOpen(req.admin, inquiry)) {
    res.status(403).json({ message: 'This enquiry is not assigned to you.' });
    return null;
  }
  return inquiry;
}

export async function getInquiry(req, res) {
  const inquiry = await loadAccessible(req, res);
  if (!inquiry) return;

  if (inquiry.assignedTo) {
    const admRes = await query('SELECT id, name, email FROM admins WHERE id = $1', [inquiry.assignedTo]);
    if (admRes.rows.length > 0) {
      inquiry.assignedTo = { id: admRes.rows[0].id, name: admRes.rows[0].name, email: admRes.rows[0].email };
    }
  }

  const [histRes, custRes] = await Promise.all([
    query('SELECT * FROM inquiry_activities WHERE inquiry_id = $1 ORDER BY created_at DESC', [inquiry.id]),
    inquiry.user && (isSuper(req.admin) || can(req.admin, 'customers.view'))
      ? query('SELECT id, name, email, phone, address_line1, address_city, address_state, address_pincode, address_country, created_at, active FROM users WHERE id = $1', [inquiry.user])
      : Promise.resolve(null),
  ]);

  const history = histRes.rows.map(mapInquiryActivity);
  const customer = custRes && custRes.rows.length > 0 ? mapUser(custRes.rows[0]) : null;

  res.json({ inquiry, history, customer });
}

export async function assignInquiry(req, res) {
  const { rows: inqRows } = await query('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
  if (inqRows.length === 0) return res.status(404).json({ message: 'Enquiry not found.' });
  const inquiry = mapInquiry(inqRows[0]);

  const { rows: admRows } = await query('SELECT * FROM admins WHERE id = $1 AND active = true', [req.body.adminId]);
  if (admRows.length === 0) return res.status(400).json({ message: 'Choose an active admin.' });
  const target = mapAdmin(admRows[0]);

  const from = inquiry.status;
  const nextStatus = inquiry.status === 'new' ? 'assigned' : inquiry.status;
  const now = new Date();

  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE inquiries
       SET assigned_to = $1, assigned_at = $2, status = $3, updated_at = NOW()
       WHERE id = $4`,
      [target.id, now, nextStatus, inquiry.id]
    );

    await client.query(
      `INSERT INTO inquiry_activities (
        inquiry_id, type, actor_id, actor_name, actor_role,
        assigned_to_id, assigned_to_name, message, from_status, to_status, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        inquiry.id,
        'assigned',
        req.admin.id,
        req.admin.name,
        req.admin.role,
        target.id,
        target.name,
        `Assigned to ${target.name}`,
        from,
        nextStatus,
        'internal',
      ]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await audit(
    req.admin,
    'enquiry.assigned',
    `${req.admin.name} assigned enquiry from ${inquiry.name} to ${target.name}`,
    { type: 'enquiry', id: inquiry.id }
  );

  inquiry.assignedTo = target.id;
  inquiry.assignedAt = now;
  inquiry.status = nextStatus;
  res.json({ inquiry });
}

export async function setStatus(req, res) {
  const inquiry = await loadAccessible(req, res);
  if (!inquiry) return;
  const { status, note } = req.body;
  if (status === inquiry.status) return res.json({ inquiry });

  const from = inquiry.status;

  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE inquiries SET status = $1, updated_at = NOW() WHERE id = $2', [status, inquiry.id]);
    await client.query(
      `INSERT INTO inquiry_activities (
        inquiry_id, type, actor_id, actor_name, actor_role,
        from_status, to_status, message, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        inquiry.id,
        'status_changed',
        req.admin.id,
        req.admin.name,
        req.admin.role,
        from,
        status,
        note || '',
        'customer',
      ]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await audit(
    req.admin,
    'enquiry.status_changed',
    `${req.admin.name} moved enquiry from ${inquiry.name}: ${from} → ${status}`,
    { type: 'enquiry', id: inquiry.id }
  );

  inquiry.status = status;
  res.json({ inquiry });
}

export async function removeInquiry(req, res) {
  const client = await getClient();
  let inquiry;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('DELETE FROM inquiries WHERE id = $1 RETURNING *', [req.params.id]);
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Enquiry not found.' });
    }
    inquiry = mapInquiry(rows[0]);
    await client.query('DELETE FROM inquiry_activities WHERE inquiry_id = $1', [inquiry.id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await audit(
    req.admin,
    'enquiry.deleted',
    `${req.admin.name} deleted the enquiry from ${inquiry.name}`,
    { type: 'enquiry', id: inquiry.id },
    { source: inquiry.source, phone: inquiry.phone }
  );

  res.json({ message: 'Enquiry deleted.' });
}

export async function addNote(req, res) {
  const inquiry = await loadAccessible(req, res);
  if (!inquiry) return;
  const { type, message, visibility } = req.body;

  const vis = type === 'report' ? 'internal' : visibility;
  const { rows } = await query(
    `INSERT INTO inquiry_activities (
      inquiry_id, type, message, actor_id, actor_name, actor_role, visibility
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [inquiry.id, type, message, req.admin.id, req.admin.name, req.admin.role, vis]
  );

  const entry = mapInquiryActivity(rows[0]);
  if (type !== 'note') {
    await audit(
      req.admin,
      `enquiry.${type}`,
      `${req.admin.name} added a ${type === 'report' ? 'progress report' : 'progress update'} on enquiry from ${inquiry.name}`,
      { type: 'enquiry', id: inquiry.id }
    );
  }
  res.status(201).json({ entry });
}

// ================= Customers =================
export async function listCustomers(req, res) {
  const { page, limit, skip } = paging(req.query);
  const conditions = [];
  const params = [];
  let idx = 1;

  if (req.query.status === 'active') conditions.push('active = true');
  if (req.query.status === 'inactive') conditions.push('active = false');
  if (req.query.q) {
    const term = `%${String(req.query.q).slice(0, 80)}%`;
    conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx} OR address_city ILIKE $${idx} OR address_state ILIKE $${idx})`);
    params.push(term);
    idx++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const usersSql = `SELECT * FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  const countSql = `SELECT count(*)::int AS c FROM users ${whereClause}`;

  const [usersRes, countRes] = await Promise.all([
    query(usersSql, [...params, limit, skip]),
    query(countSql, params),
  ]);

  const users = usersRes.rows.map(mapUser);
  const userIds = users.map((u) => u.id);

  let map = {};
  if (userIds.length > 0) {
    const countsRes = await query(
      'SELECT user_id, count(*)::int AS n FROM inquiries WHERE user_id = ANY($1) GROUP BY user_id',
      [userIds]
    );
    map = Object.fromEntries(countsRes.rows.map((c) => [c.user_id, c.n]));
  }

  res.json({
    customers: users.map((u) => {
      delete u.passwordHash;
      return { ...u, enquiryCount: map[u.id] || 0 };
    }),
    total: countRes.rows[0].c,
    page,
    limit,
  });
}

export async function getCustomer(req, res) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Customer not found.' });

  const user = mapUser(rows[0]);
  delete user.passwordHash;

  const { clause: visClause, params: visParams } = buildVisibleWhere(req.admin, 2);
  const enqSql = `
    SELECT i.*, a.name AS assigned_to_name
    FROM inquiries i
    LEFT JOIN admins a ON i.assigned_to = a.id
    WHERE i.user_id = $1 AND ${visClause}
    ORDER BY i.created_at DESC LIMIT 50
  `;
  const enqRes = await query(enqSql, [user.id, ...visParams]);
  const enquiries = enqRes.rows.map((r) => {
    const inq = mapInquiry(r);
    inq.assignedTo = r.assigned_to ? { id: r.assigned_to, name: r.assigned_to_name } : null;
    return inq;
  });

  res.json({ customer: user, enquiries });
}

export async function setCustomerStatus(req, res) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Customer not found.' });
  const user = mapUser(rows[0]);

  const nextActive = req.body.active;
  const nextTv = !nextActive ? (user.tokenVersion || 0) + 1 : user.tokenVersion || 0;

  await query('UPDATE users SET active = $1, token_version = $2 WHERE id = $3', [nextActive, nextTv, user.id]);

  await audit(
    req.admin,
    'user.status_changed',
    `${req.admin.name} ${nextActive ? 'activated' : 'deactivated'} customer ${user.name}`,
    { type: 'user', id: user.id }
  );

  res.json({ customer: { id: user.id, active: nextActive } });
}

// ================= Admin team =================
const teamView = (a, open = 0, total = 0) => ({
  id: a.id,
  name: a.name,
  email: a.email,
  phone: a.phone || '',
  avatar: a.avatar || '',
  role: a.role,
  permissions: a.permissions || [],
  active: a.active,
  mustChangePassword: !!a.mustChangePassword,
  lastLoginAt: a.lastLoginAt,
  createdAt: a.createdAt,
  openEnquiries: open,
  totalAssigned: total,
});

const permNames = (list) => (list.length ? list.join(', ') : 'none');
const SUPER_LOCKED = 'Super Admin accounts cannot be changed here.';

export async function listTeam(_req, res) {
  const [adminsRes, loadRes] = await Promise.all([
    query('SELECT * FROM admins ORDER BY role DESC, created_at ASC'),
    query(
      `SELECT assigned_to,
              count(*)::int AS total,
              count(*) FILTER (WHERE status = ANY($1))::int AS open,
              count(*) FILTER (WHERE status = ANY($2))::int AS done
       FROM inquiries
       WHERE assigned_to IS NOT NULL
       GROUP BY assigned_to`,
      [OPEN, DONE]
    ),
  ]);

  const admins = adminsRes.rows.map(mapAdmin);
  const m = Object.fromEntries(loadRes.rows.map((l) => [String(l.assigned_to), l]));

  res.json({
    admins: admins.map((a) => ({
      ...teamView(a, m[a.id]?.open || 0, m[a.id]?.total || 0),
      completed: m[a.id]?.done || 0,
    })),
    permissions: PERMISSIONS,
  });
}

export async function getTeamMember(req, res) {
  const { rows } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Admin not found.' });
  const a = mapAdmin(rows[0]);

  const [inqRes, actRes] = await Promise.all([
    query('SELECT * FROM inquiries WHERE assigned_to = $1 ORDER BY updated_at DESC LIMIT 25', [a.id]),
    query('SELECT * FROM activity_logs WHERE actor_id = $1 ORDER BY created_at DESC LIMIT 25', [a.id]),
  ]);

  res.json({
    admin: teamView(a),
    assigned: inqRes.rows.map(mapInquiry),
    activity: actRes.rows.map(mapActivityLog),
  });
}

export async function createAdmin(req, res) {
  const email = req.body.email.toLowerCase();

  const [aCheck, uCheck] = await Promise.all([
    query('SELECT id FROM admins WHERE LOWER(email) = LOWER($1)', [email]),
    query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]),
  ]);

  if (aCheck.rows.length > 0 || uCheck.rows.length > 0) {
    return res.status(409).json({ message: 'An account with this email already exists.', errors: { email: 'Already in use' } });
  }

  const hash = await bcrypt.hash(req.body.password, 12);
  const { rows } = await query(
    `INSERT INTO admins (
      name, email, phone, avatar, permissions, active, role, password_hash, must_change_password, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9) RETURNING *`,
    [
      req.body.name,
      email,
      req.body.phone || '',
      req.body.avatar || '',
      req.body.permissions || [],
      req.body.active !== false,
      ROLES.ADMIN,
      hash,
      req.admin.id,
    ]
  );

  const a = mapAdmin(rows[0]);
  await audit(
    req.admin,
    'admin.created',
    `${req.admin.name} added team member ${a.name}`,
    { type: 'admin', id: a.id },
    { permissions: a.permissions, active: a.active }
  );

  res.status(201).json({ admin: teamView(a) });
}

export async function updateAdmin(req, res) {
  const { rows } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Admin not found.' });
  const a = mapAdmin(rows[0]);

  if (a.role === ROLES.SUPER_ADMIN) return res.status(403).json({ message: SUPER_LOCKED });

  const { name, email, phone, avatar, permissions, active } = req.body;
  const events = [];

  let nextEmail = a.email;
  if (email !== undefined && email.toLowerCase() !== a.email) {
    const lower = email.toLowerCase();
    const [aCheck, uCheck] = await Promise.all([
      query('SELECT id FROM admins WHERE LOWER(email) = LOWER($1) AND id != $2', [lower, a.id]),
      query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [lower]),
    ]);
    if (aCheck.rows.length > 0 || uCheck.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.', errors: { email: 'Already in use' } });
    }
    nextEmail = lower;
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (nextEmail !== a.email) { fields.push(`email = $${idx++}`); values.push(nextEmail); }
  if (phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(phone); }
  if (avatar !== undefined) { fields.push(`avatar = $${idx++}`); values.push(avatar); }

  if (permissions !== undefined) {
    const before = [...(a.permissions || [])].sort();
    const after = [...permissions].sort();
    if (before.join('|') !== after.join('|')) {
      fields.push(`permissions = $${idx++}`);
      values.push(permissions);
      events.push([
        'admin.permissions_changed',
        `${req.admin.name} changed permissions for ${a.name}`,
        {
          before,
          after,
          granted: permNames(after.filter((p) => !before.includes(p))),
          revoked: permNames(before.filter((p) => !after.includes(p))),
        },
      ]);
    }
  }

  if (active !== undefined && active !== a.active) {
    fields.push(`active = $${idx++}`);
    values.push(active);
    if (!active) {
      fields.push(`token_version = $${idx++}`);
      values.push((a.tokenVersion || 0) + 1);
    }
    events.push([
      active ? 'admin.activated' : 'admin.deactivated',
      `${req.admin.name} ${active ? 'activated' : 'deactivated'} team member ${a.name}`,
      {},
    ]);
  }

  if (fields.length > 0) {
    values.push(a.id);
    const sql = `UPDATE admins SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const updRes = await query(sql, values);
    const updated = mapAdmin(updRes.rows[0]);
    if (events.length === 0) {
      events.push(['admin.updated', `${req.admin.name} updated team member ${updated.name}`, {}]);
    }
    for (const [action, summary, meta] of events) {
      await audit(req.admin, action, summary, { type: 'admin', id: a.id }, meta);
    }
    return res.json({ admin: teamView(updated) });
  }

  res.json({ admin: teamView(a) });
}

export async function resetAdminPassword(req, res) {
  const { rows } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Admin not found.' });
  const a = mapAdmin(rows[0]);

  if (a.role === ROLES.SUPER_ADMIN) {
    return res.status(403).json({ message: 'A Super Admin changes their own password in Settings.' });
  }

  const hash = await bcrypt.hash(req.body.password, 12);
  const now = new Date();
  const nextTv = (a.tokenVersion || 0) + 1;

  await query(
    `UPDATE admins
     SET password_hash = $1, password_changed_at = $2, must_change_password = true, token_version = $3
     WHERE id = $4`,
    [hash, now, nextTv, a.id]
  );

  await query('DELETE FROM password_reset_tokens WHERE account_kind = $1 AND account_id = $2', ['admin', a.id]);
  await audit(req.admin, 'admin.password_reset', `${req.admin.name} reset the password for ${a.name}`, { type: 'admin', id: a.id });

  res.json({ message: `Password reset. ${a.name} has been signed out and must change it at next sign-in.` });
}

export async function removeAdmin(req, res) {
  if (req.params.id === req.admin.id) return res.status(403).json({ message: 'You cannot remove your own account.' });

  const { rows } = await query('SELECT * FROM admins WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Admin not found.' });
  const a = mapAdmin(rows[0]);

  if (a.role === ROLES.SUPER_ADMIN) return res.status(403).json({ message: 'A Super Admin account cannot be removed.' });

  const client = await getClient();
  let modifiedCount = 0;
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM admins WHERE id = $1', [a.id]);
    await client.query("UPDATE inquiries SET status = 'new' WHERE assigned_to = $1 AND status = 'assigned'", [a.id]);
    const relRes = await client.query('UPDATE inquiries SET assigned_to = NULL, assigned_at = NULL WHERE assigned_to = $1', [a.id]);
    modifiedCount = relRes.rowCount;
    await client.query('DELETE FROM password_reset_tokens WHERE account_kind = $1 AND account_id = $2', ['admin', a.id]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await audit(
    req.admin,
    'admin.removed',
    `${req.admin.name} removed team member ${a.name}`,
    { type: 'admin', id: a.id },
    { email: a.email, enquiriesReleased: modifiedCount }
  );

  res.json({ message: `${a.name} was removed.`, enquiriesReleased: modifiedCount });
}

// ================= Products =================
export async function listProducts(_req, res) {
  const { rows } = await query('SELECT * FROM products ORDER BY "order" ASC, created_at ASC');
  res.json({ products: rows.map(mapProduct) });
}

const slugTaken = { message: 'A vehicle with this URL name already exists.', errors: { slug: 'Already in use' } };
const slugIsCategory = { message: 'A vehicle category already uses this URL name. Choose a different one.', errors: { slug: 'Used by a category' } };

async function categoryProblem(key) {
  const { rows } = await query('SELECT active FROM vehicle_categories WHERE key = $1', [key]);
  if (rows.length === 0) return 'Choose a category from the list';
  if (!rows[0].active) return 'This category is deactivated. Choose an active category';
  return null;
}

export async function createProduct(req, res) {
  const [pCheck, cCheck] = await Promise.all([
    query('SELECT id FROM products WHERE slug = $1', [req.body.slug]),
    query('SELECT id FROM vehicle_categories WHERE slug = $1', [req.body.slug]),
  ]);

  if (pCheck.rows.length > 0) return res.status(409).json(slugTaken);
  if (cCheck.rows.length > 0) return res.status(409).json(slugIsCategory);

  const bad = await categoryProblem(req.body.category);
  if (bad) return res.status(422).json({ message: 'Please check the highlighted fields.', errors: { category: bad } });

  const lastRes = await query('SELECT "order" FROM products ORDER BY "order" DESC LIMIT 1');
  const nextOrder = (lastRes.rows[0]?.order ?? 0) + 1;

  const b = req.body;
  const { rows } = await query(
    `INSERT INTO products (
      slug, name, category, tag, summary, description, image, image_public_id,
      gallery, specs, price, "order", active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13
    ) RETURNING *`,
    [
      b.slug,
      b.name,
      b.category,
      b.tag || '',
      b.summary || '',
      b.description || '',
      b.image || '',
      b.imagePublicId || '',
      JSON.stringify(b.gallery || []),
      JSON.stringify(b.specs || []),
      b.price ?? null,
      nextOrder,
      b.active !== false,
    ]
  );

  const p = mapProduct(rows[0]);
  await audit(req.admin, 'product.created', `${req.admin.name} created vehicle ${p.name}`, { type: 'product', id: p.id });
  const live = await revalidateSite('catalog');
  res.status(201).json({ product: p, live });
}

export async function updateProduct(req, res) {
  const { rows: currRows } = await query('SELECT category, slug FROM products WHERE id = $1', [req.params.id]);
  if (currRows.length === 0) return res.status(404).json({ message: 'Vehicle not found.' });
  const current = currRows[0];

  if (req.body.slug && req.body.slug !== current.slug) {
    const [pCheck, cCheck] = await Promise.all([
      query('SELECT id FROM products WHERE slug = $1 AND id != $2', [req.body.slug, req.params.id]),
      query('SELECT id FROM vehicle_categories WHERE slug = $1', [req.body.slug]),
    ]);
    if (pCheck.rows.length > 0) return res.status(409).json(slugTaken);
    if (cCheck.rows.length > 0) return res.status(409).json(slugIsCategory);
  }

  if (req.body.category && req.body.category !== current.category) {
    const bad = await categoryProblem(req.body.category);
    if (bad) return res.status(422).json({ message: 'Please check the highlighted fields.', errors: { category: bad } });
  }

  const fields = [];
  const values = [];
  let idx = 1;

  const mapping = {
    slug: 'slug',
    name: 'name',
    category: 'category',
    tag: 'tag',
    summary: 'summary',
    description: 'description',
    image: 'image',
    imagePublicId: 'image_public_id',
    price: 'price',
    order: 'order',
    active: 'active',
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (req.body[key] !== undefined) {
      fields.push(`"${col}" = $${idx++}`);
      values.push(req.body[key]);
    }
  }

  if (req.body.gallery !== undefined) {
    fields.push(`gallery = $${idx++}`);
    values.push(JSON.stringify(req.body.gallery));
  }
  if (req.body.specs !== undefined) {
    fields.push(`specs = $${idx++}`);
    values.push(JSON.stringify(req.body.specs));
  }

  if (fields.length === 0) {
    const existing = await query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    return res.json({ product: mapProduct(existing.rows[0]), live: false });
  }

  values.push(req.params.id);
  const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await query(sql, values);

  const p = mapProduct(rows[0]);
  await audit(req.admin, 'product.updated', `${req.admin.name} updated vehicle ${p.name}`, { type: 'product', id: p.id });
  const live = await revalidateSite('catalog');
  res.json({ product: p, live });
}

export async function toggleProduct(req, res) {
  const { rows } = await query('UPDATE products SET active = NOT active WHERE id = $1 RETURNING *', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Vehicle not found.' });

  const p = mapProduct(rows[0]);
  await audit(
    req.admin,
    'product.updated',
    `${req.admin.name} ${p.active ? 'activated' : 'deactivated'} vehicle ${p.name}`,
    { type: 'product', id: p.id }
  );
  const live = await revalidateSite('catalog');
  res.json({ product: p, live });
}

export async function removeProduct(req, res) {
  const { rows } = await query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Vehicle not found.' });

  const p = mapProduct(rows[0]);
  await audit(req.admin, 'product.deleted', `${req.admin.name} deleted vehicle ${p.name}`, { type: 'product', id: p.id });
  const live = await revalidateSite('catalog');
  res.json({ message: 'Vehicle deleted.', live });
}

export async function publicProducts(_req, res) {
  const { rows } = await query('SELECT * FROM products WHERE active = true ORDER BY "order" ASC, created_at ASC');
  const products = rows.map((r) => {
    const p = mapProduct(r);
    delete p.imagePublicId;
    p.gallery = (p.gallery || []).map((g) => ({ url: g.url }));
    return p;
  });
  res.set('Cache-Control', 'public, max-age=5');
  res.json({ products });
}
