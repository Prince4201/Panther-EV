'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useDismiss } from '@/lib/useDismiss';

export function AccountMenu({ iconOnly = false }: { iconOnly?: boolean }) {
  const { isStaff, account, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useDismiss(box, open, () => setOpen(false));
  const item = 'block px-4 py-2.5 text-[15px] hover:bg-fog';

  return (
    <div ref={box} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={account ? `Account: ${account.name}` : 'Account'}
        className={iconOnly ? 'p-2.5 transition-colors hover:text-panther-red' : 'flex items-center gap-2 px-2 py-2 text-[14px] font-medium transition-colors hover:text-panther-red xl:text-[15.5px]'}>
        <User className={iconOnly ? 'h-6 w-6' : 'h-5 w-5'} aria-hidden />
        {!iconOnly && <span className="max-w-[150px] truncate">{account ? account.name : 'Sign in'}</span>}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-[70] mt-2 w-56 border border-line bg-white py-1 shadow-xl" onClick={() => setOpen(false)}>
          {account ? (
            <>
              <p className="truncate border-b border-line px-4 py-2.5 text-xs text-steel">{account.email}</p>
              {isStaff
                ? <><Link role="menuitem" href="/admin/dashboard" className={item}>Admin dashboard</Link><Link role="menuitem" href="/admin/profile" className={item}>My profile</Link></>
                : <><Link role="menuitem" href="/account" className={item}>My enquiries</Link><Link role="menuitem" href="/account/profile" className={item}>Profile</Link><Link role="menuitem" href="/account/settings" className={item}>Settings</Link></>}
              <button role="menuitem" onClick={async () => { await logout(); router.push('/'); router.refresh(); }} className={`${item} w-full text-left`}>Sign out</button>
            </>
          ) : (
            <>
              <Link role="menuitem" href="/login" className={item}>Sign in</Link>
              <Link role="menuitem" href="/register" className={item}>Create account</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
