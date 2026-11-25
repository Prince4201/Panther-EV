'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

export interface Address { line1: string; city: string; state: string; pincode: string; country: string }
export interface Account { id: string; name: string; email: string; phone?: string; avatar?: string; address?: Address; permissions?: string[]; mustChangePassword?: boolean; createdAt?: string }
export type Role = 'super_admin' | 'admin' | 'user' | null;
interface Ctx { role: Role; account: Account | null; loading: boolean; isStaff: boolean; can: (perm: string) => boolean; setAuth: (role: Role, account: Account | null) => void; refresh: () => Promise<void>; logout: () => Promise<void> }

const AuthContext = createContext<Ctx>({ role: null, account: null, loading: true, isStaff: false, can: () => false, setAuth: () => {}, refresh: async () => {}, logout: async () => {} });
export const useAuth = () => useContext(AuthContext);
export const isStaffRole = (r: Role) => r === 'super_admin' || r === 'admin';

/** UI hint only. The server re-checks the role and permissions on every request. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ role: Role; account: Account | null; loading: boolean }>({ role: null, account: null, loading: true });

  const setAuth = useCallback((role: Role, account: Account | null) => {
    setState({ role, account, loading: false });
  }, []);

  const refresh = useCallback(async () => {
    try {
      const r = await api<{ role: Role; account: Account | null }>('/auth/me');
      setState({ role: r.role, account: r.account, loading: false });
    } catch { setState({ role: null, account: null, loading: false }); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => null);
    setState({ role: null, account: null, loading: false });
  }, []);

  const value = useMemo<Ctx>(() => ({
    ...state,
    isStaff: isStaffRole(state.role),
    can: (perm) => state.role === 'super_admin' || (state.account?.permissions ?? []).includes(perm),
    setAuth,
    refresh, logout,
  }), [state, setAuth, refresh, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
