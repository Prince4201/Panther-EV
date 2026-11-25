import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { query, getClient } from '../config/pg.js';
import {
  COOKIE_NAME,
  USER_COOKIE,
  cookieOptions,
  userCookieOptions,
  clearCookieOptions,
  readSession,
  signAdminToken,
  signUserToken,
} from '../middleware/auth.js';
import { env } from '../config/env.js';
import { sendMail } from '../config/mailer.js';
import { ROLES } from '../lib/permissions.js';
import { audit } from '../lib/audit.js';
import { enquiryText, isWhatsAppApiConfigured, sendWhatsApp, whatsappLink } from '../lib/whatsapp.js';
import { mapAdmin, mapUser, mapInquiry, mapInquiryActivity } from '../lib/mappers.js';

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
const clear = (res) => {
  res.clearCookie(COOKIE_NAME, clearCookieOptions);
  res.clearCookie(USER_COOKIE, clearCookieOptions);
};

const addr = (a) => ({
  line1: a?.line1 || '',
  city: a?.city || '',
  state: a?.state || '',
  pincode: a?.pincode || '',
  country: a?.country || 'India',
});

/** What the browser may know about an account. Never includes the password hash, token version or other internals. */
export const publicAccount = (acc, kind) => ({
  id: acc.id,
  name: acc.name,
  email: acc.email,
  phone: acc.phone || '',
  avatar: acc.avatar || '',
  address: addr(acc.address),
  role: kind === 'admin' ? acc.role : ROLES.USER,
  ...(kind === 'admin'
    ? {
        permissions: acc.role === ROLES.SUPER_ADMIN ? ['*'] : acc.permissions || [],
        mustChangePassword: !!acc.mustChangePassword,
        lastLoginAt: acc.lastLoginAt || null,
      }
    : {}),
  active: acc.active !== false,
  createdAt: acc.createdAt,
});

/** One sign-in form for everyone: staff accounts are checked first, then customers. */
export async function login(req, res) {
  const email = req.body.email.toLowerCase();
  const { password } = req.body;
  const bad = () => res.status(401).json({ message: 'Email or password is incorrect.' });

  const adminRes = await query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1)', [email]);
  if (adminRes.rows.length > 0) {
    const admin = mapAdmin(adminRes.rows[0]);
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return bad();
    if (!admin.active) return res.status(403).json({ message: 'This account has been deactivated. Contact the Super Admin.' });

    const now = new Date();
    await query('UPDATE admins SET last_login_at = $1 WHERE id = $2', [now, admin.id]);
    admin.lastLoginAt = now;

    res.clearCookie(USER_COOKIE, clearCookieOptions);
    res.cookie(COOKIE_NAME, signAdminToken(admin), cookieOptions);
    return res.json({ role: admin.role, account: publicAccount(admin, 'admin') });
  }

  const userRes = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  const user = userRes.rows.length > 0 ? mapUser(userRes.rows[0]) : null;
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return bad();
  if (!user.active) return res.status(403).json({ message: 'This account has been deactivated. Please contact Panther.' });

  const now = new Date();
  await query('UPDATE users SET last_active_at = $1 WHERE id = $2', [now, user.id]);
  user.lastActiveAt = now;

  res.clearCookie(COOKIE_NAME, clearCookieOptions);
  res.cookie(USER_COOKIE, signUserToken(user), userCookieOptions);
  res.json({ role: ROLES.USER, account: publicAccount(user, 'user') });
}

export async function register(req, res) {
  const { name, email, phone = '', password } = req.body;
  const lower = email.toLowerCase();

  const [uCheck, aCheck] = await Promise.all([
    query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [lower]),
    query('SELECT id FROM admins WHERE LOWER(email) = LOWER($1)', [lower]),
  ]);

  if (uCheck.rows.length > 0 || aCheck.rows.length > 0) {
    return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
  }

  const hash = await bcrypt.hash(password, 12);
  const now = new Date();
  const { rows } = await query(
    `INSERT INTO users (name, email, phone, password_hash, last_active_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, lower, phone, hash, now]
  );

  const user = mapUser(rows[0]);
  res.clearCookie(COOKIE_NAME, clearCookieOptions);
  res.cookie(USER_COOKIE, signUserToken(user), userCookieOptions);
  res.status(201).json({ role: ROLES.USER, account: publicAccount(user, 'user') });
}

export const logout = (_req, res) => {
  clear(res);
  res.json({ message: 'Signed out.' });
};

/** Always 200 so a signed-out visit does not log an error in the browser console. */
export async function me(req, res) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  const s = await readSession(req);
  if (!s) return res.json({ role: null, account: null });
  res.json({ role: s.role, account: publicAccount(s.account, s.kind) });
}

// ---- Profile (every role edits only their OWN record; the id comes from the session, never the request) ----
export const getProfile = (req, res) =>
  res.json({ role: req.session.role, account: publicAccount(req.session.account, req.session.kind) });

export async function updateProfile(req, res) {
  const { account, kind } = req.session;
  const { name, phone, address, avatar } = req.body;

  const table = kind === 'admin' ? 'admins' : 'users';

  const fields = ['name = $1', 'phone = $2'];
  const values = [name, phone];
  let idx = 3;

  if (address) {
    fields.push(`address_line1 = $${idx++}`); values.push(address.line1 || '');
    fields.push(`address_city = $${idx++}`); values.push(address.city || '');
    fields.push(`address_state = $${idx++}`); values.push(address.state || '');
    fields.push(`address_pincode = $${idx++}`); values.push(address.pincode || '');
    fields.push(`address_country = $${idx++}`); values.push(address.country || 'India');
  }

  if (avatar !== undefined) {
    fields.push(`avatar = $${idx++}`);
    values.push(avatar);
  }

  values.push(account.id);
  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await query(sql, values);

  const updatedAccount = kind === 'admin' ? mapAdmin(rows[0]) : mapUser(rows[0]);

  if (kind === 'admin') {
    await audit(
      { id: account.id, name: account.name, role: account.role },
      'profile.updated',
      `${account.name} updated their profile`,
      { type: 'admin', id: account.id }
    );
  }

  res.json({ role: req.session.role, account: publicAccount(updatedAccount, kind) });
}

// ---- Passwords ----
export async function changeOwnPassword(req, res) {
  const { kind, account } = req.session;
  const table = kind === 'admin' ? 'admins' : 'users';

  const { rows } = await query(`SELECT * FROM ${table} WHERE id = $1`, [account.id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Account not found.' });

  const acc = kind === 'admin' ? mapAdmin(rows[0]) : mapUser(rows[0]);
  const ok = await bcrypt.compare(req.body.currentPassword, acc.passwordHash);
  if (!ok) {
    return res.status(400).json({
      message: 'Current password is incorrect.',
      errors: { currentPassword: 'Current password is incorrect.' },
    });
  }

  const newHash = await bcrypt.hash(req.body.newPassword, 12);
  const now = new Date();
  const nextTv = (acc.tokenVersion || 0) + 1;

  if (kind === 'admin') {
    await query(
      `UPDATE admins
       SET password_hash = $1, password_changed_at = $2, must_change_password = false, token_version = $3
       WHERE id = $4`,
      [newHash, now, nextTv, acc.id]
    );
    acc.tokenVersion = nextTv;
    res.cookie(COOKIE_NAME, signAdminToken(acc), cookieOptions);
    await audit(
      { id: acc.id, name: acc.name, role: acc.role },
      'password.changed',
      `${acc.name} changed their password`,
      { type: 'admin', id: acc.id }
    );
  } else {
    await query(
      `UPDATE users
       SET password_hash = $1, token_version = $2
       WHERE id = $3`,
      [newHash, nextTv, acc.id]
    );
    acc.tokenVersion = nextTv;
    res.cookie(USER_COOKIE, signUserToken(acc), userCookieOptions);
  }

  res.json({ message: 'Password updated. Other devices have been signed out.' });
}

const RESET_MINUTES = 30;
const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

/** Same answer whether or not the email exists, so it cannot be used to discover accounts. */
export async function forgotPassword(req, res) {
  const generic = { message: 'If an account exists for that email, a reset link has been sent. It is valid for 30 minutes.' };
  const email = req.body.email.toLowerCase();

  const [adminRes, userRes] = await Promise.all([
    query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1)', [email]),
    query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]),
  ]);

  const admin = adminRes.rows.length > 0 ? mapAdmin(adminRes.rows[0]) : null;
  const user = !admin && userRes.rows.length > 0 ? mapUser(userRes.rows[0]) : null;
  const acc = admin || user;

  if (acc && acc.active !== false) {
    const kind = admin ? 'admin' : 'user';
    await query('DELETE FROM password_reset_tokens WHERE account_kind = $1 AND account_id = $2', [kind, acc.id]);

    const raw = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_MINUTES * 60 * 1000);

    await query(
      `INSERT INTO password_reset_tokens (token_hash, account_kind, account_id, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [sha256(raw), kind, acc.id, expiresAt]
    );

    const link = `${env.frontendUrl}/reset-password?token=${raw}`;
    sendMail({
      to: acc.email,
      subject: 'Reset your Panther password',
      text: `Hello ${acc.name},\n\nUse this link to choose a new password (valid for ${RESET_MINUTES} minutes, works once):\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    }).catch((e) => console.error('reset mail failed', e.message));
  }

  res.json(generic);
}

export async function resetPassword(req, res) {
  const tokenHash = sha256(req.body.token);
  const tokenRes = await query(
    'SELECT * FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()',
    [tokenHash]
  );

  if (tokenRes.rows.length === 0) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
  }

  const rec = tokenRes.rows[0];
  const table = rec.account_kind === 'admin' ? 'admins' : 'users';

  const accRes = await query(`SELECT * FROM ${table} WHERE id = $1`, [rec.account_id]);
  if (accRes.rows.length === 0) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
  }

  const acc = rec.account_kind === 'admin' ? mapAdmin(accRes.rows[0]) : mapUser(accRes.rows[0]);
  if (acc.active === false) {
    return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
  }

  const newHash = await bcrypt.hash(req.body.newPassword, 12);
  const now = new Date();
  const nextTv = (acc.tokenVersion || 0) + 1;

  if (rec.account_kind === 'admin') {
    await query(
      `UPDATE admins
       SET password_hash = $1, password_changed_at = $2, must_change_password = false, token_version = $3
       WHERE id = $4`,
      [newHash, now, nextTv, acc.id]
    );
    await audit(
      { id: acc.id, name: acc.name, role: acc.role },
      'password.reset',
      `${acc.name} reset their password`,
      { type: 'admin', id: acc.id }
    );
  } else {
    await query(
      `UPDATE users
       SET password_hash = $1, token_version = $2
       WHERE id = $3`,
      [newHash, nextTv, acc.id]
    );
  }

  await query('DELETE FROM password_reset_tokens WHERE account_kind = $1 AND account_id = $2', [rec.account_kind, acc.id]);
  clear(res);
  res.json({ message: 'Password updated. You can sign in now.' });
}

// ---- Customer enquiries ----
export async function createInquiry(req, res) {
  const s = await readSession(req);
  const user = s?.kind === 'user' ? s.account : null;
  const b = req.body;

  const client = await getClient();
  let inquiryId;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO inquiries (
        name, email, phone, city, subject, message, vehicles,
        country, vehicle_interest, source, whatsapp_status, status, user_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13
      ) RETURNING *`,
      [
        b.name,
        b.email || user?.email || '',
        b.phone,
        b.city || '',
        b.subject || '',
        b.message || '',
        JSON.stringify(b.vehicles || []),
        b.country || 'IN',
        b.vehicleInterest || '',
        b.source || 'contact',
        'not_applicable',
        'new',
        user?.id ?? null,
      ]
    );
    inquiryId = rows[0].id;

    await client.query(
      `INSERT INTO inquiry_activities (
        inquiry_id, type, actor_id, actor_name, actor_role, message, to_status, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        inquiryId,
        'created',
        user?.id ?? null,
        b.name,
        user ? 'user' : 'guest',
        b.subject || 'Enquiry received',
        'new',
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

  res.status(201).json({ message: 'Thanks. The Panther team will call you soon.', id: inquiryId });
}

/**
 * Quick Enquiry popup. The enquiry is always saved first.
 */
export async function createQuickInquiry(req, res) {
  const s = await readSession(req);
  const user = s?.kind === 'user' ? s.account : null;
  const { name, phone, message } = req.body;
  const body = { name, phone, message };

  const client = await getClient();
  let inquiryId;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO inquiries (
        name, phone, message, subject, source, whatsapp_status, status, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, phone, message || '', 'Quick enquiry', 'quick-enquiry', 'pending_user', 'new', user?.id ?? null]
    );
    inquiryId = rows[0].id;

    await client.query(
      `INSERT INTO inquiry_activities (
        inquiry_id, type, actor_id, actor_name, actor_role, message, to_status, visibility
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        inquiryId,
        'created',
        user?.id ?? null,
        name,
        user ? 'user' : 'guest',
        'Quick enquiry received',
        'new',
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

  const text = enquiryText(body);
  if (isWhatsAppApiConfigured()) {
    const r = await sendWhatsApp(text);
    const newStatus = r.ok ? 'sent' : 'failed';
    await query('UPDATE inquiries SET whatsapp_status = $1 WHERE id = $2', [newStatus, inquiryId]);
    if (r.ok) {
      return res.status(201).json({ id: inquiryId, delivery: 'sent', message: 'Your enquiry has been sent successfully.' });
    }
    console.error('WhatsApp send failed:', r.error);
  }

  const url = whatsappLink(text);
  if (!url) {
    return res.status(201).json({ id: inquiryId, delivery: 'saved', message: 'Your enquiry has been received.' });
  }

  res.status(201).json({
    id: inquiryId,
    delivery: 'whatsapp_link',
    whatsappUrl: url,
    message: 'Your enquiry has been received. WhatsApp will open so you can send the enquiry.',
  });
}

export async function myInquiries(req, res) {
  const inqRes = await query(
    'SELECT * FROM inquiries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  const items = inqRes.rows.map(mapInquiry);

  if (items.length === 0) {
    return res.json({ inquiries: [] });
  }

  const ids = items.map((i) => i.id);
  const actRes = await query(
    `SELECT * FROM inquiry_activities
     WHERE inquiry_id = ANY($1) AND visibility = 'customer' AND type != 'created'
     ORDER BY created_at ASC`,
    [ids]
  );

  const by = {};
  actRes.rows.forEach((r) => {
    const a = mapInquiryActivity(r);
    (by[a.inquiry] ||= []).push({
      inquiry: a.inquiry,
      type: a.type,
      message: a.message,
      toStatus: a.toStatus,
      createdAt: a.createdAt,
    });
  });

  res.json({
    inquiries: items.map((i) => {
      const copy = { ...i };
      delete copy.assignedTo;
      return { ...copy, updates: by[i.id] || [] };
    }),
  });
}
