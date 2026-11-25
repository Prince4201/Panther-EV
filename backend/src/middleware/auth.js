import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/pg.js';
import { mapAdmin, mapUser } from '../lib/mappers.js';
import { ROLES, can, canAny } from '../lib/permissions.js';

export const COOKIE_NAME = 'panther_admin';
export const USER_COOKIE = 'panther_user';

const isSecure = () => {
  if (process.env.COOKIE_SECURE !== undefined) return process.env.COOKIE_SECURE === 'true';
  return process.env.NODE_ENV === 'production' || env.isProd;
};

const getSameSite = () => {
  if (process.env.COOKIE_SAME_SITE) return process.env.COOKIE_SAME_SITE;
  return isSecure() ? 'none' : 'lax';
};

// Production cross-site authentication (Vercel frontend -> Render backend):
// Modern browsers require SameSite=None; Secure; HttpOnly; Path=/ for cross-site cookie transmission.
// Local development over plain HTTP uses SameSite=Lax (browsers reject SameSite=None without Secure).
export const cookieOptions = {
  httpOnly: true,
  get secure() { return isSecure(); },
  get sameSite() { return getSameSite(); },
  path: '/',
  maxAge: 8 * 60 * 60 * 1000,
};

export const userCookieOptions = {
  httpOnly: true,
  get secure() { return isSecure(); },
  get sameSite() { return getSameSite(); },
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Explicit cookie-clearing options with identical path, secure, and sameSite attributes
export const clearCookieOptions = {
  httpOnly: true,
  get secure() { return isSecure(); },
  get sameSite() { return getSameSite(); },
  path: '/',
};

// The token carries only the account id, which table it lives in and a session version.
// The ROLE is always read from the database, never from the token or the browser, so it cannot be forged or escalated.
export const signAdminToken = (admin) => jwt.sign({ sub: admin.id, kind: 'admin', tv: admin.tokenVersion || 0 }, env.jwtSecret, { expiresIn: '8h' });
export const signUserToken = (user) => jwt.sign({ sub: user.id, kind: 'user', tv: user.tokenVersion || 0 }, env.jwtSecret, { expiresIn: '7d' });

async function loadAdmin(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  const p = jwt.verify(token, env.jwtSecret);
  if (p.kind !== 'admin') return null;
  const { rows } = await query('SELECT * FROM admins WHERE id = $1', [p.sub]);
  const admin = mapAdmin(rows[0]);
  if (!admin || !admin.active || (admin.tokenVersion || 0) !== (p.tv || 0)) return null;
  return admin;
}
async function loadUser(req) {
  const token = req.cookies?.[USER_COOKIE];
  if (!token) return null;
  const p = jwt.verify(token, env.jwtSecret);
  if (p.kind !== 'user') return null;
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [p.sub]);
  const user = mapUser(rows[0]);
  if (!user || !user.active || (user.tokenVersion || 0) !== (p.tv || 0)) return null;
  return user;
}

/** Reads whichever session cookie is present. Never throws; returns null when signed out. */
export async function readSession(req) {
  try { const a = await loadAdmin(req); if (a) return { role: a.role, kind: 'admin', account: a }; } catch { /* expired or tampered */ }
  try { const u = await loadUser(req); if (u) return { role: ROLES.USER, kind: 'user', account: u }; } catch { /* expired or tampered */ }
  return null;
}

/** Any active staff account (super admin or admin). */
export async function requireAdmin(req, res, next) {
  try {
    const admin = await loadAdmin(req);
    if (!admin) return res.status(401).json({ message: 'Please sign in.' });
    req.admin = admin;
    next();
  } catch { res.status(401).json({ message: 'Your session has ended. Please sign in again.' }); }
}
export const requireStaff = requireAdmin;

/** Super admin only. Checked against the database on every request. */
export async function requireSuperAdmin(req, res, next) {
  await requireAdmin(req, res, () => {
    if (req.admin.role !== ROLES.SUPER_ADMIN) return res.status(403).json({ message: 'Only a Super Admin can do this.' });
    next();
  });
}

/** Super admin, or an admin who was granted this permission by a super admin. */
export const requirePermission = (perm) => async (req, res, next) => {
  await requireAdmin(req, res, () => {
    if (!can(req.admin, perm)) return res.status(403).json({ message: 'You do not have permission to do this.' });
    next();
  });
};

/** Super admin, or an admin holding at least one of these permissions (e.g. read access shared by two modules). */
export const requireAnyPermission = (...perms) => async (req, res, next) => {
  await requireAdmin(req, res, () => {
    if (!canAny(req.admin, perms)) return res.status(403).json({ message: 'You do not have permission to do this.' });
    next();
  });
};

export async function requireUser(req, res, next) {
  const session = await readSession(req);
  if (!session || session.kind !== 'user') return res.status(401).json({ message: 'Please sign in.' });
  req.user = session.account;
  next();
}

/** Any signed-in account, customer or staff. */
export async function requireSession(req, res, next) {
  const session = await readSession(req);
  if (!session) return res.status(401).json({ message: 'Please sign in.' });
  req.session = session;
  next();
}
