import bcrypt from 'bcryptjs';
import { query } from '../config/pg.js';
import { COOKIE_NAME, cookieOptions, clearCookieOptions, signAdminToken } from '../middleware/auth.js';
import { publicAccount } from './account.controller.js';
import { mapAdmin } from '../lib/mappers.js';

// Compared against when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

/** Staff-only sign-in (kept for /admin/login). Customers cannot use it. */
export async function adminLogin(req, res) {
  const { email, password } = req.body;
  const { rows } = await query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1)', [email]);
  const admin = mapAdmin(rows[0]);
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (!admin.active) return res.status(403).json({ message: 'This account has been deactivated. Contact the Super Admin.' });

  const now = new Date();
  await query('UPDATE admins SET last_login_at = $1 WHERE id = $2', [now, admin.id]);
  admin.lastLoginAt = now;

  res.cookie(COOKIE_NAME, signAdminToken(admin), cookieOptions);
  res.json({ admin: publicAccount(admin, 'admin') });
}

export const adminLogout = (_req, res) => {
  res.clearCookie(COOKIE_NAME, clearCookieOptions);
  res.json({ message: 'Signed out.' });
};

export const adminMe = (req, res) => res.json({ admin: publicAccount(req.admin, 'admin') });
