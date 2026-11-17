'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Activity, ArrowLeft, Building2, Contact, Gauge, Images, Inbox, LogOut, Menu, Settings, Store, Truck, User, UserCog, Users, Wrench, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PantherMark } from '@/components/brand/PantherMark';
import { useAdmin } from './AdminContext';
import { cn } from '@/lib/utils';

interface Item { label: string; href: string; icon: LucideIcon; superOnly?: boolean; perm?: string; anyPerm?: string[] }

/** Only items the signed-in role may open are rendered. (The API re-checks every request.) */
export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const path = usePathname();
  const { admin, isSuper, can } = useAdmin();
  const [open, setOpen] = useState(false);
  const search = `?${useSearchParams().toString()}`;
  useEffect(() => setOpen(false), [path, search]);

  const items: Item[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: Gauge },
    { label: can('enquiries.all') ? 'Enquiries' : 'Assigned enquiries', href: '/admin/enquiries', icon: Inbox },
    { label: 'Customers', href: '/admin/customers', icon: Users, perm: 'customers.view' },
    { label: 'Vehicles', href: '/admin/products', icon: Truck, anyPerm: ['products.manage', 'vehicle_categories.manage'] },
    { label: 'Team', href: '/admin/team', icon: UserCog, superOnly: true },
    { label: 'Service bookings', href: '/admin/enquiries?q=Service', icon: Wrench, perm: 'services.manage' },
    { label: 'Dealerships', href: '/admin/enquiries?q=Dealer', icon: Store, perm: 'dealership.manage' },
    { label: 'Finance', href: '/admin/finance', icon: Building2, perm: 'finance.manage' },
    { label: 'Our Teams', href: '/admin/our-teams', icon: Contact, perm: 'ourteam.manage' },
    { label: 'Hero Banners', href: '/admin/hero-slides', icon: Images, perm: 'hero.manage' },
    { label: 'Reports / Activity', href: '/admin/activity', icon: Activity, perm: 'activity.view' },
    { label: 'Profile', href: '/admin/profile', icon: User },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ].filter((i: Item) => (i.superOnly ? isSuper : i.anyPerm ? i.anyPerm.some(can) : i.perm ? can(i.perm) : true));

  // Links like "/admin/enquiries?q=Service" are saved filters of the enquiry list: highlight the one whose filter is open.
  const isActive = (href: string) => {
    const [base, query] = href.split('?');
    if (query) return path === base && search.includes(query);
    if (base === '/admin/enquiries' && path === base) return !/[?&]q=(Service|Dealer)/.test(search);
    return path === base || (base !== '/admin/dashboard' && path.startsWith(base + '/'));
  };

  return (
    <>
      {/* Mobile / tablet top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-ink px-4 py-3 text-white md:hidden">
        <div className="flex items-center gap-3"><PantherMark className="h-8 w-8 text-white" /><div><p className="font-display text-xl leading-none">Panther</p><p className="text-[11px] text-white/50">{isSuper ? 'Super Admin' : 'Admin'}</p></div></div>
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-1.5 border border-white/25 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/90 hover:bg-white hover:text-ink"><ArrowLeft className="h-4 w-4" aria-hidden />Website</Link>
          <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close admin menu' : 'Open admin menu'} aria-expanded={open} aria-controls="admin-nav" className="p-2">{open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
        </div>
      </div>
      <aside className={cn('flex-col bg-ink text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0', open ? 'fixed inset-x-0 bottom-0 top-[56px] z-30 flex overflow-y-auto' : 'hidden')}>
        <div className="hidden items-center gap-3 border-b border-white/10 px-5 py-5 md:flex">
          <PantherMark className="h-9 w-9 text-white" />
          <div><p className="font-display text-2xl leading-none">Panther</p><p className="text-xs text-white/50">{isSuper ? 'Super Admin' : 'Admin'}</p></div>
        </div>
        <nav id="admin-nav" aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
          {/* Always visible way back to the public site (the home page). */}
          <Link href="/" className="mb-4 flex items-center gap-3 border border-white/20 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white hover:text-ink">
            <ArrowLeft className="h-4 w-4" aria-hidden />Back to website
          </Link>
          <ul className="space-y-1">
            {items.map(({ label, href, icon: Icon }) => {
              const on = isActive(href);
              return (
                <li key={href}>
                  <Link href={href} aria-current={on ? 'page' : undefined}
                    className={cn('flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors', on ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white')}>
                    <Icon className="h-4 w-4" aria-hidden />{label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium">{admin.name}</p>
          <p className="truncate text-xs text-white/50">{admin.email}</p>
          <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
            <button onClick={onLogout} className="flex items-center gap-2 hover:text-white"><LogOut className="h-4 w-4" aria-hidden />Sign out</button>
          </div>
        </div>
      </aside>
    </>
  );
}
