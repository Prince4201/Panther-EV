'use client';
import { createContext, useContext } from 'react';

export interface Address { line1: string; city: string; state: string; pincode: string; country: string }
export interface Staff { id: string; name: string; email: string; phone?: string; role: 'super_admin' | 'admin'; permissions: string[]; avatar?: string; address?: Address; active?: boolean; mustChangePassword?: boolean; createdAt?: string; lastLoginAt?: string | null }
interface Ctx { admin: Staff; isSuper: boolean; can: (perm: string) => boolean; /** Re-reads the signed-in account from the server (after a profile or password change). */ refresh: () => Promise<void> }

const AdminCtx = createContext<Ctx | null>(null);
export const AdminProvider = AdminCtx.Provider;
/** UI convenience only: the API enforces every permission itself. */
export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error('useAdmin outside AdminProvider');
  return c;
}
export const makeCtx = (admin: Staff, refresh: () => Promise<void> = async () => {}): Ctx => ({ admin, refresh, isSuper: admin.role === 'super_admin', can: (p) => admin.role === 'super_admin' || admin.permissions.includes(p) });
