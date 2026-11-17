import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { query, pool } from '../config/pg.js';
import { getSettings } from '../models/Settings.js';
import { runMigrations } from './migrate.js';

const slides = [
  { title: 'Panther XL Plus', subtitle: 'Built for every journey.', image: '/hero/panther-xl-plus.png', imageAlt: 'Blue Panther XL Plus electric rickshaw', button1Url: '/vehicles/panther-xl-plus' },
  { title: 'Panther XL', subtitle: 'Power. Comfort. Reliability.', image: '/hero/panther-xl.png', imageAlt: 'Red Panther XL electric rickshaw with roof carrier', button1Url: '/vehicles/panther-xl' },
  { title: 'Panther Super Deluxe', subtitle: 'Redefining everyday mobility.', image: '/hero/panther-super-deluxe.png', imageAlt: 'Yellow Panther Super Deluxe electric rickshaw', button1Url: '/vehicles/panther-super-deluxe' },
  { title: 'Panther E-Rickshaw', subtitle: 'Smart mobility for a changing world.', image: '/hero/panther-e-rickshaw.png', imageAlt: 'Grey Panther Deluxe electric rickshaw', button1Url: '/vehicles' },
].map((s, i) => ({
  fit: 'contain',
  textColor: 'light',
  textAlign: 'left',
  overlay: 0,
  bgColor: '#14151A',
  active: true,
  duration: null,
  order: i + 1,
  description: '',
  button1Text: 'Explore Vehicle',
  ...s,
}));

await runMigrations();

if (!env.adminEmail || !env.adminPassword) {
  console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set: skipping admin creation.');
} else {
  const { rows } = await query('SELECT id FROM admins WHERE LOWER(email) = LOWER($1)', [env.adminEmail]);
  if (rows.length > 0) {
    console.log('Admin already exists: password left unchanged.');
  } else {
    const hash = await bcrypt.hash(env.adminPassword, 12);
    await query(
      `INSERT INTO admins (name, email, password_hash, role, must_change_password)
       VALUES ('Panther Super Admin', $1, $2, 'super_admin', $3)`,
      [env.adminEmail.toLowerCase(), hash, env.isProd]
    );
    console.log(`Admin created for ${env.adminEmail}`);
  }
}

// Vehicles
const img = (f) => `https://pantherev.com/${f}.png`;
const specLabels = ['Range', 'Battery', 'Motor', 'Payload', 'Charging', 'Warranty'];
const vehicles = [
  ['panther-xl-plus', 'Panther XL Plus', 'passenger', 'Heavy Duty', 'Heavy-duty passenger e-rickshaw, the top of the XL line.'],
  ['panther-xl', 'Panther XL', 'passenger', 'Popular', 'Popular passenger e-rickshaw built for daily city routes.'],
  ['panther-deluxe', 'Panther Deluxe', 'passenger', 'Comfort', 'Comfort-focused passenger e-rickshaw with low-maintenance design.'],
  ['panther-super-deluxe', 'Panther Super Deluxe', 'passenger', 'Flagship', 'Flagship passenger e-rickshaw in the Panther range.'],
  ['panther-xl-cargo', 'Panther XL Cargo', 'cargo', 'Logistics', 'Cargo e-rickshaw for logistics and last-mile delivery.'],
  ['panther-cargo', 'Panther Cargo', 'cargo', 'Max Payload', 'Heavy-duty cargo e-rickshaw built for maximum payload.'],
].map(([slug, name, category, tag, summary], i) => ({
  slug,
  name,
  category,
  tag,
  summary,
  image: img(slug),
  order: i + 1,
  active: true,
  specs: specLabels.map((label) => ({ label, value: null })),
}));

const prodCount = await query('SELECT count(*)::int AS c FROM products');
if (prodCount.rows[0].c === 0) {
  for (const v of vehicles) {
    await query(
      `INSERT INTO products (slug, name, category, tag, summary, image, "order", active, specs)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [v.slug, v.name, v.category, v.tag, v.summary, v.image, v.order, v.active, JSON.stringify(v.specs)]
    );
  }
  console.log('Seeded 6 vehicles');
} else {
  console.log('Vehicles already exist: skipped');
}

await getSettings();
const heroCount = await query('SELECT count(*)::int AS c FROM hero_slides');
if (heroCount.rows[0].c === 0) {
  for (const s of slides) {
    await query(
      `INSERT INTO hero_slides (
        title, subtitle, description, image, image_alt, fit, bg_color,
        text_color, text_align, overlay, button1_text, button1_url, "order", active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        s.title, s.subtitle, s.description, s.image, s.imageAlt, s.fit, s.bgColor,
        s.textColor, s.textAlign, s.overlay, s.button1Text, s.button1Url, s.order, s.active,
      ]
    );
  }
  console.log('Seeded 4 hero banners');
} else {
  console.log('Hero banners already exist: skipped');
}

await pool.end();
