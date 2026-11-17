import { cache } from 'react';
import type { TeamMember } from '@/types/team';
import { API_URL } from './api';
import { cached } from './cache';

/** Server-side: visible team members in display order (Admin > Our Teams). Empty list if the API is down. */
export const getTeamMembers = cache(async (): Promise<TeamMember[]> => {
  try {
    const res = await fetch(`${API_URL}/team-members`, cached('team'));
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()) as { members: TeamMember[] }).members ?? [];
  } catch { return []; }
});
