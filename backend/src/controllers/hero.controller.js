import { query, getClient } from '../config/pg.js';
import { getSettings } from '../models/Settings.js';
import { revalidateSite } from '../lib/revalidate.js';
import { mapHeroSlide } from '../lib/mappers.js';

const cleanSettings = (s) => ({
  autoplay: s.hero.autoplay,
  duration: s.hero.duration,
  pauseOnHover: s.hero.pauseOnHover,
  showIndicators: s.hero.showIndicators,
  showArrows: s.hero.showArrows,
  transition: s.hero.transition,
});

// Public: active slides only, in order.
export async function publicSlides(_req, res) {
  const [slidesRes, settings] = await Promise.all([
    query('SELECT * FROM hero_slides WHERE active = true ORDER BY "order" ASC, created_at ASC'),
    getSettings(),
  ]);
  const slides = slidesRes.rows.map(mapHeroSlide);
  res.set('Cache-Control', 'public, max-age=5');
  res.json({ slides, settings: cleanSettings(settings) });
}

// Admin: everything.
export async function adminList(_req, res) {
  const [slidesRes, settings] = await Promise.all([
    query('SELECT * FROM hero_slides ORDER BY "order" ASC, created_at ASC'),
    getSettings(),
  ]);
  const slides = slidesRes.rows.map(mapHeroSlide);
  res.json({ slides, settings: cleanSettings(settings) });
}

export async function create(req, res) {
  const lastRes = await query('SELECT "order" FROM hero_slides ORDER BY "order" DESC LIMIT 1');
  const nextOrder = (lastRes.rows[0]?.order ?? 0) + 1;

  const b = req.body;
  const insertRes = await query(
    `INSERT INTO hero_slides (
      title, subtitle, description, image, image_public_id, mobile_image, mobile_image_public_id,
      image_alt, fit, bg_color, text_color, text_align, overlay, button1_text, button1_url,
      button2_text, button2_url, "order", active, duration
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20
    ) RETURNING *`,
    [
      b.title,
      b.subtitle || '',
      b.description || '',
      b.image,
      b.imagePublicId || '',
      b.mobileImage || '',
      b.mobileImagePublicId || '',
      b.imageAlt || '',
      b.fit || 'cover',
      b.bgColor || '#EEF0F2',
      b.textColor || 'dark',
      b.textAlign || 'left',
      b.overlay ?? 0,
      b.button1Text || '',
      b.button1Url || '',
      b.button2Text || '',
      b.button2Url || '',
      nextOrder,
      b.active !== false,
      b.duration ?? null,
    ]
  );

  const slide = mapHeroSlide(insertRes.rows[0]);
  const live = await revalidateSite('hero');
  res.status(201).json({ live, slide });
}

export async function update(req, res) {
  const { id } = req.params;
  const b = req.body;

  // Build dynamic update
  const fields = [];
  const values = [];
  let idx = 1;

  const mapping = {
    title: 'title',
    subtitle: 'subtitle',
    description: 'description',
    image: 'image',
    imagePublicId: 'image_public_id',
    mobileImage: 'mobile_image',
    mobileImagePublicId: 'mobile_image_public_id',
    imageAlt: 'image_alt',
    fit: 'fit',
    bgColor: 'bg_color',
    textColor: 'text_color',
    textAlign: 'text_align',
    overlay: 'overlay',
    button1Text: 'button1_text',
    button1Url: 'button1_url',
    button2Text: 'button2_text',
    button2Url: 'button2_url',
    order: 'order',
    active: 'active',
    duration: 'duration',
  };

  for (const [key, col] of Object.entries(mapping)) {
    if (b[key] !== undefined) {
      fields.push(`"${col}" = $${idx++}`);
      values.push(b[key]);
    }
  }

  if (fields.length === 0) {
    const current = await query('SELECT * FROM hero_slides WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ message: 'Banner not found.' });
    return res.json({ live: false, slide: mapHeroSlide(current.rows[0]) });
  }

  values.push(id);
  const sql = `UPDATE hero_slides SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const { rows } = await query(sql, values);

  if (rows.length === 0) return res.status(404).json({ message: 'Banner not found.' });
  const slide = mapHeroSlide(rows[0]);
  const live = await revalidateSite('hero');
  res.json({ live, slide });
}

export async function toggle(req, res) {
  const { id } = req.params;
  const { rows } = await query('UPDATE hero_slides SET active = NOT active WHERE id = $1 RETURNING *', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'Banner not found.' });

  const slide = mapHeroSlide(rows[0]);
  const live = await revalidateSite('hero');
  res.json({ live, slide });
}

export async function remove(req, res) {
  const { id } = req.params;
  const { rowCount } = await query('DELETE FROM hero_slides WHERE id = $1', [id]);
  if (!rowCount) return res.status(404).json({ message: 'Banner not found.' });

  const live = await revalidateSite('hero');
  res.json({ live, message: 'Banner deleted.' });
}

export async function reorder(req, res) {
  const { ids } = req.body;
  const client = await getClient();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < ids.length; i++) {
      await client.query('UPDATE hero_slides SET "order" = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await query('SELECT * FROM hero_slides ORDER BY "order" ASC, created_at ASC');
  const slides = rows.map(mapHeroSlide);
  const live = await revalidateSite('hero');
  res.json({ live, slides });
}
