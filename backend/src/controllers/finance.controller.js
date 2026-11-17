import { query, getClient } from '../config/pg.js';
import { audit } from '../lib/audit.js';
import { revalidateSite } from '../lib/revalidate.js';
import { mapFinancePartner } from '../lib/mappers.js';

// Public: active companies only, in order.
export async function publicList(_req, res) {
  const { rows } = await query('SELECT * FROM finance_partners WHERE active = true ORDER BY "order" ASC, created_at ASC');
  const partners = rows.map((r) => {
    const p = mapFinancePartner(r);
    delete p.logoPublicId;
    return p;
  });
  res.set('Cache-Control', 'public, max-age=5');
  res.json({ partners });
}

export async function adminList(_req, res) {
  const { rows } = await query('SELECT * FROM finance_partners ORDER BY "order" ASC, created_at ASC');
  const partners = rows.map(mapFinancePartner);
  res.json({ partners });
}

export async function create(req, res) {
  const lastRes = await query('SELECT "order" FROM finance_partners ORDER BY "order" DESC LIMIT 1');
  const nextOrder = (lastRes.rows[0]?.order ?? 0) + 1;

  const b = req.body;
  const { rows } = await query(
    `INSERT INTO finance_partners (
      name, category, description, logo, logo_public_id, logo_bg, logo_scale,
      website, contact_phone, contact_email, "order", active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12
    ) RETURNING *`,
    [
      b.name,
      b.category || 'financing',
      b.description || '',
      b.logo || '',
      b.logoPublicId || '',
      b.logoBg || 'light',
      b.logoScale ?? 100,
      b.website || '',
      b.contactPhone || '',
      b.contactEmail || '',
      nextOrder,
      b.active !== false,
    ]
  );

  const partner = mapFinancePartner(rows[0]);
  await audit(req.admin, 'finance.created', `${req.admin.name} added finance partner ${partner.name}`, { type: 'finance', id: partner.id });
  const live = await revalidateSite('finance');
  res.status(201).json({ live, partner });
}

export async function update(req, res) {
  const { id } = req.params;
  const b = req.body;

  const fields = [];
  const values = [];
  let idx = 1;

  const mapping = {
    name: 'name',
    category: 'category',
    description: 'description',
    logo: 'logo',
    logoPublicId: 'logo_public_id',
    logoBg: 'logo_bg',
    logoScale: 'logo_scale',
    website: 'website',
    contactPhone: 'contact_phone',
    contactEmail: 'contact_email',
    order: 'order',
    active: 'active',
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (b[key] !== undefined) {
      fields.push(`"${col}" = $${idx++}`);
      values.push(b[key]);
    }
  }

  if (fields.length === 0) {
    const current = await query('SELECT * FROM finance_partners WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ message: 'Company not found.' });
    return res.json({ live: false, partner: mapFinancePartner(current.rows[0]) });
  }

  values.push(id);
  const sql = `UPDATE finance_partners SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await query(sql, values);

  if (rows.length === 0) return res.status(404).json({ message: 'Company not found.' });
  const partner = mapFinancePartner(rows[0]);
  await audit(req.admin, 'finance.updated', `${req.admin.name} updated finance partner ${partner.name}`, { type: 'finance', id: partner.id });
  const live = await revalidateSite('finance');
  res.json({ live, partner });
}

export async function toggle(req, res) {
  const { id } = req.params;
  const { rows } = await query('UPDATE finance_partners SET active = NOT active WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Company not found.' });

  const partner = mapFinancePartner(rows[0]);
  await audit(req.admin, 'finance.updated', `${req.admin.name} ${partner.active ? 'activated' : 'hid'} finance partner ${partner.name}`, { type: 'finance', id: partner.id });
  const live = await revalidateSite('finance');
  res.json({ live, partner });
}

export async function remove(req, res) {
  const { id } = req.params;
  const { rows } = await query('DELETE FROM finance_partners WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Company not found.' });

  const partner = mapFinancePartner(rows[0]);
  await audit(req.admin, 'finance.deleted', `${req.admin.name} deleted finance partner ${partner.name}`, { type: 'finance', id: partner.id });
  const live = await revalidateSite('finance');
  res.json({ live, message: 'Company deleted.' });
}

export async function reorder(req, res) {
  const { ids } = req.body;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < ids.length; i++) {
      await client.query('UPDATE finance_partners SET "order" = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await audit(req.admin, 'finance.reordered', `${req.admin.name} changed the order of the finance partners`, { type: 'finance' });
  const { rows } = await query('SELECT * FROM finance_partners ORDER BY "order" ASC, created_at ASC');
  const partners = rows.map(mapFinancePartner);
  const live = await revalidateSite('finance');
  res.json({ live, partners });
}
