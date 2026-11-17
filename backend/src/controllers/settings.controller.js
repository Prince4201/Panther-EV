import { Settings, getSettings } from '../models/Settings.js';
import { audit } from '../lib/audit.js';
import { revalidateSite } from '../lib/revalidate.js';

const view = (h) => ({ autoplay: h.autoplay, duration: h.duration, pauseOnHover: h.pauseOnHover, showIndicators: h.showIndicators, showArrows: h.showArrows, transition: h.transition });

export async function getHeroSettings(_req, res) {
  const s = await getSettings();
  res.json({ settings: view(s.hero) });
}

export async function updateHeroSettings(req, res) {
  await getSettings();
  const s = await Settings.findOneAndUpdate({ key: 'site' }, { $set: { hero: req.body } }, { new: true, runValidators: true });
  await audit(req.admin, 'settings.updated', `${req.admin.name} updated the homepage banner settings`, { type: 'settings', id: s.id });
  // `live` tells the admin screen whether the website has already dropped its cached copy.
  const live = await revalidateSite('hero');
  res.json({ settings: view(s.hero), live });
}
