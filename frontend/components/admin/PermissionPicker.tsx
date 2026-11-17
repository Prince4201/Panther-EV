'use client';

export const PERMISSION_LABELS: Record<string, string> = {
  'dashboard.view': 'Dashboard overview',
  'enquiries.all': 'All enquiries',
  'customers.view': 'Customers',
  'products.manage': 'Vehicles',
  'vehicle_categories.manage': 'Vehicle categories',
  'finance.manage': 'Finance partners',
  'ourteam.manage': 'Our Teams page',
  'hero.manage': 'Home banners',
  'services.manage': 'Service bookings',
  'dealership.manage': 'Dealership',
  'settings.manage': 'Website settings',
  'activity.view': 'Activity log',
};
const HELP: Record<string, string> = {
  'dashboard.view': 'See site-wide totals on the dashboard, not only their own work',
  'enquiries.all': 'See and work on every enquiry, not only the ones assigned to them',
  'customers.view': 'View customers and their enquiries',
  'products.manage': 'Add, edit and delete vehicles',
  'vehicle_categories.manage': 'Add, edit, deactivate and delete vehicle categories',
  'finance.manage': 'Manage finance partners / trusted companies',
  'ourteam.manage': 'Add, edit, hide and delete the people on the public Our Teams page',
  'hero.manage': 'Manage home page banners',
  'services.manage': 'See and work on every service booking',
  'dealership.manage': 'See and work on every dealership enquiry',
  'settings.manage': 'Change website settings (homepage banner behaviour)',
  'activity.view': 'Read the activity log (who did what, and when)',
};
export const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS);

/** Admins can always open enquiries assigned to them. Everything else is granted here by the Super Admin. */
export function PermissionPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
  return (
    <fieldset>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <legend className="text-sm font-semibold">Permissions <span className="font-normal text-steel">({value.length} of {ALL_PERMISSIONS.length})</span></legend>
        <span className="flex gap-4 text-xs font-semibold">
          <button type="button" onClick={() => onChange([...ALL_PERMISSIONS])} className="text-panther-red hover:text-ink">Select all</button>
          <button type="button" onClick={() => onChange([])} className="text-steel hover:text-ink">Clear</button>
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {ALL_PERMISSIONS.map((k) => (
          <label key={k} className={`flex cursor-pointer items-start gap-3 border p-3 text-sm transition-colors hover:bg-fog ${value.includes(k) ? 'border-ink' : 'border-line'}`}>
            <input type="checkbox" checked={value.includes(k)} onChange={() => toggle(k)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#E4202B]" />
            <span className="min-w-0"><span className="block font-semibold">{PERMISSION_LABELS[k]}</span><span className="text-xs text-steel">{HELP[k]}</span></span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-steel">Every admin can always work on enquiries assigned to them. Team management is never available to admins.</p>
    </fieldset>
  );
}
