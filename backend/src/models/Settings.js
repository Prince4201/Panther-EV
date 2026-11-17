import { query } from '../config/pg.js';
import { mapSettings } from '../lib/mappers.js';

const DEFAULT_HERO = {
  autoplay: true,
  duration: 6000,
  pauseOnHover: true,
  showIndicators: true,
  showArrows: true,
  transition: 'fade',
};

export async function getSettings() {
  const { rows } = await query("SELECT * FROM settings WHERE key = 'site'");
  if (rows.length > 0) {
    return mapSettings(rows[0]);
  }

  const insertRes = await query(
    `INSERT INTO settings (key, hero, seeds)
     VALUES ('site', $1, $2)
     ON CONFLICT (key) DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [JSON.stringify(DEFAULT_HERO), JSON.stringify({})]
  );
  return mapSettings(insertRes.rows[0]);
}

export const Settings = {
  getSettings,
  async findOneAndUpdate(filter, update, options = {}) {
    const key = filter.key || 'site';
    const hero = update.$set?.hero;
    if (hero) {
      const { rows } = await query(
        `UPDATE settings
         SET hero = $1, updated_at = NOW()
         WHERE key = $2
         RETURNING *`,
        [JSON.stringify(hero), key]
      );
      return mapSettings(rows[0]);
    }
    return getSettings();
  },
  async updateOne(filter, update) {
    const key = filter.key || 'site';
    if (update.$set) {
      // Handle seed flags like 'seeds.trustedPartnersV1': true
      const existing = await getSettings();
      let seeds = { ...(existing.seeds || {}) };
      for (const [k, v] of Object.entries(update.$set)) {
        if (k.startsWith('seeds.')) {
          const subKey = k.replace('seeds.', '');
          seeds[subKey] = v;
        } else if (k === 'seeds') {
          seeds = { ...seeds, ...v };
        }
      }
      await query(
        `UPDATE settings SET seeds = $1, updated_at = NOW() WHERE key = $2`,
        [JSON.stringify(seeds), key]
      );
    }
  }
};
