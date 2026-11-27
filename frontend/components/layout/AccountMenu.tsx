'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, FileText, LogOut, Settings, Shield, User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDismiss } from '@/lib/useDismiss';
import { cn } from '@/lib/utils';

export function AccountMenu({ iconOnly = false }: { iconOnly?: boolean }) {
  const { isStaff, account, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const item = 'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-fog hover:text-panther-red';

  return (
    <div ref={box} className="relative">
      {account ? (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`Account: ${account.name}`}
          className={cn(
            'group flex items-center transition-all duration-200 active:scale-95',
            iconOnly
              ? 'h-10 w-10 justify-center rounded-full text-ink/80 hover:bg-fog hover:text-panther-red'
              : 'gap-2 rounded-full border border-line bg-fog/90 pl-1.5 pr-3.5 py-1.5 hover:border-panther-red/40 hover:bg-white hover:shadow-md hover:-translate-y-0.5'
          )}
        >
          {account.avatar && !avatarError ? (
            <span className="relative flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
              <img
                src={account.avatar}
                alt={account.name}
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            </span>
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-panther-red to-[#B8101C] text-white text-[12px] font-bold uppercase shadow-sm">
              {account.name.charAt(0)}
            </span>
          )}
          {!iconOnly && (
            <>
              <span className="max-w-[130px] truncate text-[14px] font-semibold text-ink group-hover:text-panther-red transition-colors">
                {account.name.split(' ')[0]}
              </span>
              <ChevronDown className={cn('h-3.5 w-3.5 text-steel transition-transform duration-200', open && 'rotate-180')} aria-hidden />
            </>
          )}
        </button>
      ) : (
        <button
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account sign in"
          className={cn(
            'group flex items-center transition-all duration-200 active:scale-95',
            iconOnly
              ? 'h-10 w-10 justify-center rounded-full text-ink/80 hover:bg-fog hover:text-panther-red'
              : 'gap-2 rounded-full bg-gradient-to-r from-ink via-ink to-[#1a1b24] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm border border-black/10 hover:border-panther-red/30 hover:from-panther-red hover:via-panther-red hover:to-[#B8101C] hover:shadow-[0_4px_16px_rgba(228,32,43,0.35)] hover:-translate-y-0.5'
          )}
        >
          <User className="h-3.5 w-3.5" aria-hidden />
          {!iconOnly && <span>Sign in</span>}
        </button>
      )}

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[80] mt-2.5 w-64 rounded-2xl border border-line bg-white p-2 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.22)] ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
          onClick={() => setOpen(false)}
        >
          {account ? (
            <>
              <div className="rounded-xl bg-fog/70 border border-line/60 p-3 mb-1.5 flex items-center gap-3">
                {account.avatar && !avatarError ? (
                  <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
                    <img
                      src={account.avatar}
                      alt={account.name}
                      onError={() => setAvatarError(true)}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-panther-red to-[#B8101C] text-white text-sm font-bold uppercase shadow-sm">
                    {account.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded-full bg-red-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-panther-red">
                    Signed in
                  </span>
                  <p className="mt-0.5 truncate text-sm font-bold text-ink">{account.name}</p>
                  <p className="truncate text-xs text-steel">{account.email}</p>
                </div>
              </div>
              <div className="space-y-0.5">
                {isStaff ? (
                  <>
                    <Link role="menuitem" href="/admin/dashboard" className={item}>
                      <Shield className="h-4 w-4 text-panther-red" />
                      Admin dashboard
                    </Link>
                    <Link role="menuitem" href="/admin/profile" className={item}>
                      <User className="h-4 w-4 text-steel" />
                      My profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link role="menuitem" href="/account" className={item}>
                      <FileText className="h-4 w-4 text-steel" />
                      My enquiries
                    </Link>
                    <Link role="menuitem" href="/account/profile" className={item}>
                      <User className="h-4 w-4 text-steel" />
                      Profile
                    </Link>
                    <Link role="menuitem" href="/account/settings" className={item}>
                      <Settings className="h-4 w-4 text-steel" />
                      Settings
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-1.5 border-t border-line/80 pt-1.5">
                <button
                  role="menuitem"
                  onClick={async () => { await logout(); router.push('/'); router.refresh(); }}
                  className={cn(item, 'w-full text-left text-panther-red font-semibold hover:bg-red-50')}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Link role="menuitem" href="/login" className={item}>
                <User className="h-4 w-4 text-steel" />
                Sign in
              </Link>
              <Link role="menuitem" href="/register" className={item}>
                <Shield className="h-4 w-4 text-steel" />
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
