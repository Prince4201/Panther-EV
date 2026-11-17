import { query, getClient } from '../config/pg.js';
import { audit } from '../lib/audit.js';
import { revalidateSite } from '../lib/revalidate.js';
import { mapTeamMember } from '../lib/mappers.js';

const label = (m) => m.name || m.designation || 'a team member';
const isEmpty = (m) => !m.name && !m.designation && !m.image;
const EMPTY = { message: 'Add at least a name, a role or a photo.', errors: { name: 'Add a name, a role or a photo' } };

// Public: visible members only, in display order.
export async function publicList(_req, res) {
  const { rows } = await query('SELECT * FROM team_members WHERE is_visible = true ORDER BY display_order ASC, created_at ASC');
  const members = rows.map((r) => {
    const m = mapTeamMember(r);
    delete m.imagePublicId;
    return m;
  });
  res.set('Cache-Control', 'public, max-age=5');
  res.json({ members });
}

export async function adminList(_req, res) {
  const { rows } = await query('SELECT * FROM team_members ORDER BY display_order ASC, created_at ASC');
  const members = rows.map(mapTeamMember);
  res.json({ members });
}

export async function create(req, res) {
  if (isEmpty(req.body)) return res.status(422).json(EMPTY);

  let { displayOrder } = req.body;
  if (displayOrder === undefined) {
    const lastRes = await query('SELECT display_order FROM team_members ORDER BY display_order DESC LIMIT 1');
    displayOrder = (lastRes.rows[0]?.display_order ?? 0) + 1;
  }

  const b = req.body;
  const { rows } = await query(
    `INSERT INTO team_members (
      name, designation, email, image, image_public_id, image_scale,
      image_pos_x, image_pos_y, description, experience, additional_info,
      display_order, is_visible
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9, $10, $11,
      $12, $13
    ) RETURNING *`,
    [
      b.name || '',
      b.designation || '',
      b.email || '',
      b.image || '',
      b.imagePublicId || '',
      b.imageScale ?? 100,
      b.imagePosX ?? 0,
      b.imagePosY ?? 0,
      b.description || '',
      b.experience || '',
      b.additionalInfo || '',
      displayOrder,
      b.isVisible !== false,
    ]
  );

  const member = mapTeamMember(rows[0]);
  await audit(req.admin, 'ourteam.created', `${req.admin.name} added ${label(member)} to Our Teams`, { type: 'ourteam', id: member.id });
  const live = await revalidateSite('team');
  res.status(201).json({ live, member });
}

export async function update(req, res) {
  const { id } = req.params;
  const existing = await query('SELECT * FROM team_members WHERE id = $1', [id]);
  if (existing.rows.length === 0) return res.status(404).json({ message: 'Team member not found.' });

  const current = mapTeamMember(existing.rows[0]);
  const b = { ...current, ...req.body };
  if (isEmpty(b)) return res.status(422).json(EMPTY);

  const fields = [];
  const values = [];
  let idx = 1;

  const mapping = {
    name: 'name',
    designation: 'designation',
    email: 'email',
    image: 'image',
    imagePublicId: 'image_public_id',
    imageScale: 'image_scale',
    imagePosX: 'image_pos_x',
    imagePosY: 'image_pos_y',
    description: 'description',
    experience: 'experience',
    additionalInfo: 'additional_info',
    displayOrder: 'display_order',
    isVisible: 'is_visible',
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (req.body[key] !== undefined) {
      fields.push(`"${col}" = $${idx++}`);
      values.push(req.body[key]);
    }
  }

  if (fields.length === 0) {
    return res.json({ live: false, member: current });
  }

  values.push(id);
  const sql = `UPDATE team_members SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await query(sql, values);

  const member = mapTeamMember(rows[0]);
  await audit(req.admin, 'ourteam.updated', `${req.admin.name} updated ${label(member)} in Our Teams`, { type: 'ourteam', id: member.id });
  const live = await revalidateSite('team');
  res.json({ live, member });
}

export async function toggle(req, res) {
  const { id } = req.params;
  const { rows } = await query('UPDATE team_members SET is_visible = NOT is_visible WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Team member not found.' });

  const member = mapTeamMember(rows[0]);
  await audit(req.admin, 'ourteam.updated', `${req.admin.name} ${member.isVisible ? 'showed' : 'hid'} ${label(member)} on Our Teams`, { type: 'ourteam', id: member.id });
  const live = await revalidateSite('team');
  res.json({ live, member });
}

export async function remove(req, res) {
  const { id } = req.params;
  const { rows } = await query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Team member not found.' });

  const member = mapTeamMember(rows[0]);
  await audit(req.admin, 'ourteam.deleted', `${req.admin.name} removed ${label(member)} from Our Teams`, { type: 'ourteam', id: member.id });
  const live = await revalidateSite('team');
  res.json({ live, message: 'Team member deleted.' });
}

export async function reorder(req, res) {
  const { ids } = req.body;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < ids.length; i++) {
      await client.query('UPDATE team_members SET display_order = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  await audit(req.admin, 'ourteam.reordered', `${req.admin.name} changed the order of Our Teams`, { type: 'ourteam' });
  const { rows } = await query('SELECT * FROM team_members ORDER BY display_order ASC, created_at ASC');
  const members = rows.map(mapTeamMember);
  const live = await revalidateSite('team');
  res.json({ live, members });
}
