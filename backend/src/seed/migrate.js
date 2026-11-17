import { query } from '../config/pg.js';
import { Settings, getSettings } from '../models/Settings.js';

export const TRUSTED_PARTNERS = [
  { name: 'Akasa Finance', website: 'https://akasafin.com/', logo: '/partners/akasa-finance.svg', logoBg: 'light' },
  { name: 'LokSuvidha', website: 'https://loksuvidha.com/', logo: '/partners/loksuvidha.png', logoBg: 'light' },
  { name: 'Vedika Finance', website: 'https://teamvedika.com/', logo: '/partners/vedika-finance.png', logoBg: 'light' },
  { name: 'IndusInd Bank', website: 'https://www.indusind.bank.in/', logo: '/partners/indusind-bank.png', logoBg: 'light' },
  { name: 'Ascent Capital', website: 'https://ascentcapital.in/', logo: '/partners/ascent-capital.svg', logoBg: 'dark' },
];

async function seedTrustedPartners() {
  const settings = await getSettings();
  if (settings.seeds?.trustedPartnersV1) return 0;

  const lastRes = await query('SELECT "order" FROM finance_partners ORDER BY "order" DESC LIMIT 1');
  let order = lastRes.rows[0]?.order ?? 0;
  let changed = 0;

  for (const p of TRUSTED_PARTNERS) {
    const first = p.name.split(' ')[0];
    const { rows } = await query('SELECT * FROM finance_partners WHERE name ILIKE $1', [`${first}%`]);
    if (rows.length > 0) {
      const existing = rows[0];
      const updates = [];
      const vals = [];
      let idx = 1;
      if (!existing.logo) { updates.push(`logo = $${idx++}, logo_bg = $${idx++}`); vals.push(p.logo, p.logoBg); }
      if (!existing.website) { updates.push(`website = $${idx++}`); vals.push(p.website); }
      if (updates.length > 0) {
        vals.push(existing.id);
        await query(`UPDATE finance_partners SET ${updates.join(', ')} WHERE id = $${idx}`, vals);
        changed++;
      }
    } else {
      order++;
      await query(
        `INSERT INTO finance_partners (name, category, description, logo, logo_bg, logo_scale, website, "order", active)
         VALUES ($1, 'financing', '', $2, $3, 100, $4, $5, true)`,
        [p.name, p.logo, p.logoBg, p.website, order]
      );
      changed++;
    }
  }

  await Settings.updateOne({ key: 'site' }, { $set: { 'seeds.trustedPartnersV1': true } });
  return changed;
}

const BASE_CATEGORIES = [
  { key: 'passenger', slug: 'passenger-e-rickshaw', name: 'Passenger e-rickshaw', description: 'Comfortable, dependable electric rickshaws for people-moving businesses.', displayOrder: 1 },
  { key: 'cargo', slug: 'cargo-e-rickshaw', name: 'Cargo e-rickshaw', description: 'Heavy-duty electric rickshaws for logistics and last-mile delivery.', displayOrder: 2 },
];
const titleCase = (k) => k.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

async function ensureVehicleCategories() {
  let added = 0;
  const settings = await getSettings();
  if (!settings.seeds?.vehicleCategoriesV1) {
    for (const c of BASE_CATEGORIES) {
      const exists = await query('SELECT id FROM vehicle_categories WHERE key = $1 OR slug = $2', [c.key, c.slug]);
      if (exists.rows.length === 0) {
        await query(
          `INSERT INTO vehicle_categories (key, slug, name, description, display_order, active)
           VALUES ($1, $2, $3, $4, $5, true)
           ON CONFLICT (key) DO NOTHING`,
          [c.key, c.slug, c.name, c.description, c.displayOrder]
        );
        added++;
      }
    }
    await Settings.updateOne({ key: 'site' }, { $set: { 'seeds.vehicleCategoriesV1': true } });
  }

  const usedRes = await query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL');
  const knownRes = await query('SELECT key FROM vehicle_categories');
  const known = new Set(knownRes.rows.map((r) => r.key));

  const maxOrdRes = await query('SELECT display_order FROM vehicle_categories ORDER BY display_order DESC LIMIT 1');
  let order = maxOrdRes.rows[0]?.display_order ?? 0;

  for (const { category: key } of usedRes.rows) {
    if (known.has(key) || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(key)) continue;

    const clash = await query(
      'SELECT id FROM vehicle_categories WHERE slug = $1 UNION SELECT id FROM products WHERE slug = $1',
      [key]
    );
    const slug = clash.rows.length > 0 ? `${key}-vehicles` : key;
    order++;

    await query(
      `INSERT INTO vehicle_categories (key, slug, name, active, display_order)
       VALUES ($1, $2, $3, true, $4)
       ON CONFLICT (key) DO NOTHING`,
      [key, slug, titleCase(key), order]
    );
    added++;
  }
  return added;
}

/** Idempotent upgrades for data created before the role system. Safe to run on every start. */
export async function runMigrations() {
  const r1 = await query("UPDATE admins SET role = 'super_admin', active = true WHERE role = 'owner'");
  const r2 = await query("UPDATE admins SET role = 'admin' WHERE role = 'editor'");

  let moved = 0;
  const flags = await getSettings();
  if (!flags.seeds?.legacyStatusesV1) {
    const r3 = await query("UPDATE inquiries SET status = 'in_progress' WHERE status = 'contacted'");
    const r4 = await query("UPDATE inquiries SET status = 'completed' WHERE status = 'closed'");
    moved = r3.rowCount + r4.rowCount;
    await Settings.updateOne({ key: 'site' }, { $set: { 'seeds.legacyStatusesV1': true } });
  }

  const n = r1.rowCount + r2.rowCount + moved;
  if (n) console.log(`Migrated ${n} legacy record(s) to the new role/status model.`);

  const adminCountRes = await query('SELECT count(*)::int AS c FROM admins');
  const superCountRes = await query("SELECT count(*)::int AS c FROM admins WHERE role = 'super_admin'");

  if (adminCountRes.rows[0].c > 0 && superCountRes.rows[0].c === 0) {
    const email = (process.env.ADMIN_EMAIL || '').toLowerCase();
    let owner;
    if (email) {
      const { rows } = await query('SELECT * FROM admins WHERE LOWER(email) = LOWER($1)', [email]);
      owner = rows[0];
    }
    if (!owner) {
      const { rows } = await query('SELECT * FROM admins ORDER BY created_at ASC LIMIT 1');
      owner = rows[0];
    }
    if (owner) {
      await query("UPDATE admins SET role = 'super_admin', active = true WHERE id = $1", [owner.id]);
      console.log(`No Super Admin found: ${owner.email} is now the Super Admin.`);
    }
  }

  const cats = await ensureVehicleCategories();
  if (cats) console.log(`Added ${cats} vehicle categor${cats === 1 ? 'y' : 'ies'}.`);

  const added = await seedTrustedPartners();
  if (added) console.log(`Added / completed ${added} trusted finance partner(s).`);
}
