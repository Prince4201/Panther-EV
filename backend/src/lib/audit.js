import { query } from '../config/pg.js';

/** Who did what, to which record. Never throws: auditing must not break the action it records. */
export async function audit(actor, action, summary, entity = {}, meta = {}) {
  try {
    const actorId = actor?.id ?? actor?._id ?? null;
    const actorName = actor?.name || actor?.email || 'System';
    const actorRole = actor?.role || 'system';
    const entityType = entity.type || '';
    const entityId = entity.id ? String(entity.id) : '';

    await query(
      `INSERT INTO activity_logs (actor_id, actor_name, actor_role, action, summary, entity_type, entity_id, meta, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [actorId, actorName, actorRole, action, summary, entityType, entityId, JSON.stringify(meta || {})]
    );
  } catch (e) {
    console.error('audit failed', e.message);
  }
}
