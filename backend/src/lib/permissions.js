// Role model.  super_admin: everything.  admin: only what a super admin granted + enquiries assigned to them.  user: own data only.
export const ROLES = { SUPER_ADMIN: 'super_admin', ADMIN: 'admin', USER: 'user' };

export const PERMISSIONS = {
  'dashboard.view': 'See site-wide totals on the dashboard (not only their own work)',
  'enquiries.all': 'View and work on every enquiry (not just assigned ones)',
  'customers.view': 'View customers and their enquiries',
  'products.manage': 'Add, edit and delete vehicles',
  'vehicle_categories.manage': 'Add, edit, deactivate and delete vehicle categories',
  'finance.manage': 'Manage finance partners / trusted companies',
  'ourteam.manage': 'Manage the people shown on the public Our Teams page',
  'hero.manage': 'Manage home page banners',
  'services.manage': 'View and work on every service booking',
  'dealership.manage': 'View and work on every dealership enquiry',
  'settings.manage': 'Change website settings',
  'activity.view': 'View the activity log',
};
export const PERMISSION_KEYS = Object.keys(PERMISSIONS);

export const can = (admin, perm) => admin?.role === ROLES.SUPER_ADMIN || (admin?.permissions || []).includes(perm);
export const canAny = (admin, perms) => perms.some((p) => can(admin, p));

// Service bookings and dealership applications are stored as enquiries. These permissions open that slice of the
// enquiry list (matched on the enquiry subject) to an admin who does not have "enquiries.all".
export const ENQUIRY_SCOPES = { 'services.manage': /service/i, 'dealership.manage': /dealer/i };

export const INQUIRY_STATUSES = ['new', 'assigned', 'contacted', 'in_progress', 'waiting_for_user', 'converted', 'completed', 'cancelled'];
