import { query } from '../config/pg.js';
import { audit } from '../lib/audit.js';
import { revalidateSite } from '../lib/revalidate.js';
import { mapCategory, mapProduct } from '../lib/mappers.js';

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const inUse = (n) => `This category is currently being used by ${n} vehicle${n === 1 ? '' : 's'}. Please reassign ${n === 1 ? 'that vehicle' : 'those vehicles'} to another category before deleting it.`;

/** Admin list: every category with how many vehicles use it. */
export async function adminList(_req, res) {
  const [catsRes, countsRes] = await Promise.all([
    query('SELECT * FROM vehicle_categories ORDER BY display_order ASC, created_at ASC'),
    query('SELECT category, count(*)::int AS n FROM products GROUP BY category'),
  ]);

  const map = Object.fromEntries(countsRes.rows.map((c) => [c.category, c.n]));
  const categories = catsRes.rows.map((r) => {
    const c = mapCategory(r);
    return { ...c, vehicleCount: map[c.key] || 0 };
  });

  res.json({ categories });
}

export async function create(req, res) {
  const { name, description, active, displayOrder } = req.body;
  const slug = slugify(name);
  if (!slug) return res.status(422).json({ message: 'Please check the highlighted fields.', errors: { name: 'Use letters or numbers in the name' } });

  // Name uniqueness check
  const nameCheck = await query('SELECT id FROM vehicle_categories WHERE LOWER(name) = LOWER($1) OR slug = $2 OR key = $2', [name, slug]);
  if (nameCheck.rows.length > 0) {
    return res.status(409).json({ message: 'A category with this name already exists.', errors: { name: 'Already in use' } });
  }

  // A category page and a vehicle page share the /vehicles/<name> address space.
  const prodCheck = await query('SELECT id FROM products WHERE slug = $1', [slug]);
  if (prodCheck.rows.length > 0) {
    return res.status(409).json({ message: 'A vehicle already uses this name in its web address. Choose a different category name.', errors: { name: 'Clashes with a vehicle' } });
  }

  let order = displayOrder;
  if (order === undefined) {
    const lastRes = await query('SELECT display_order FROM vehicle_categories ORDER BY display_order DESC LIMIT 1');
    order = (lastRes.rows[0]?.display_order ?? 0) + 1;
  }

  const { rows } = await query(
    `INSERT INTO vehicle_categories (name, key, slug, description, active, display_order, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [name, slug, slug, description || '', active !== false, order, req.admin.id]
  );

  const category = mapCategory(rows[0]);
  await audit(req.admin, 'category.created', `${req.admin.name} created vehicle category ${category.name}`, { type: 'category', id: category.id });
  const live = await revalidateSite('catalog');
  res.status(201).json({ category, live });
}

export async function update(req, res) {
  const { id } = req.params;
  const existing = await query('SELECT * FROM vehicle_categories WHERE id = $1', [id]);
  if (existing.rows.length === 0) return res.status(404).json({ message: 'Category not found.' });
  const category = mapCategory(existing.rows[0]);

  const { name, description, active, displayOrder } = req.body;
  if (name !== undefined && name.toLowerCase() !== category.name.toLowerCase()) {
    const check = await query('SELECT id FROM vehicle_categories WHERE LOWER(name) = LOWER($1) AND id != $2', [name, id]);
    if (check.rows.length > 0) {
      return res.status(409).json({ message: 'A category with this name already exists.', errors: { name: 'Already in use' } });
    }
  }

  const fields = [];
  const values = [];
  let idx = 1;

  if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
  if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }
  if (displayOrder !== undefined) { fields.push(`display_order = $${idx++}`); values.push(displayOrder); }

  if (fields.length === 0) {
    return res.json({ category, live: false });
  }

  values.push(id);
  const sql = `UPDATE vehicle_categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await query(sql, values);

  const updatedCategory = mapCategory(rows[0]);
  await audit(req.admin, 'category.updated', `${req.admin.name} updated vehicle category ${updatedCategory.name}`, { type: 'category', id: updatedCategory.id });
  const live = await revalidateSite('catalog');
  res.json({ category: updatedCategory, live });
}

export async function toggle(req, res) {
  const { id } = req.params;
  const { rows } = await query('UPDATE vehicle_categories SET active = NOT active WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Category not found.' });

  const category = mapCategory(rows[0]);
  await audit(req.admin, 'category.updated', `${req.admin.name} ${category.active ? 'activated' : 'deactivated'} vehicle category ${category.name}`, { type: 'category', id: category.id });
  const live = await revalidateSite('catalog');
  res.json({ category, live });
}

/** Only an unused category can be deleted. A category that still has vehicles must be emptied or deactivated instead. */
export async function remove(req, res) {
  const { id } = req.params;
  const existing = await query('SELECT * FROM vehicle_categories WHERE id = $1', [id]);
  if (existing.rows.length === 0) return res.status(404).json({ message: 'Category not found.' });
  const category = mapCategory(existing.rows[0]);

  const countRes = await query('SELECT count(*)::int AS n FROM products WHERE category = $1', [category.key]);
  const n = countRes.rows[0]?.n || 0;
  if (n > 0) return res.status(409).json({ message: inUse(n), vehicleCount: n });

  await query('DELETE FROM vehicle_categories WHERE id = $1', [id]);
  await audit(req.admin, 'category.deleted', `${req.admin.name} deleted vehicle category ${category.name}`, { type: 'category', id: category.id });
  const live = await revalidateSite('catalog');
  res.json({ message: 'Category deleted.', live });
}

/** Public: active vehicles + every category (inactive ones included, flagged, so existing vehicles keep their label). */
export async function publicCatalog(_req, res) {
  const [prodsRes, catsRes] = await Promise.all([
    query('SELECT * FROM products WHERE active = true ORDER BY "order" ASC, created_at ASC'),
    query('SELECT name, key, slug, description, active, display_order FROM vehicle_categories ORDER BY display_order ASC, created_at ASC'),
  ]);

  const products = prodsRes.rows.map((r) => {
    const p = mapProduct(r);
    delete p.imagePublicId;
    p.gallery = (p.gallery || []).map((g) => ({ url: g.url }));
    return p;
  });

  const categories = catsRes.rows.map((r) => ({
    name: r.name,
    key: r.key,
    slug: r.slug,
    description: r.description,
    active: r.active,
    displayOrder: r.display_order,
  }));

  res.set('Cache-Control', 'public, max-age=5');
  res.json({ products, categories });
}
