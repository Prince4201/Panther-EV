import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { requireAdmin, requireAnyPermission, requirePermission, requireSession, requireSuperAdmin, requireUser } from '../middleware/auth.js';
import { heroSettingsSchema, heroSlideSchema, heroSlideUpdateSchema, loginSchema, reorderSchema } from '../validators/heroSlide.js';
import { financePartnerSchema, financePartnerUpdateSchema } from '../validators/financePartner.js';
import { inquirySchema, quickInquirySchema, registerSchema } from '../validators/account.js';
import { assignSchema, categorySchema, categoryUpdateSchema, changeOwnPasswordSchema, createAdminSchema, customerStatusSchema, forgotSchema, noteSchema, productSchema, productUpdateSchema, profileSchema, resetAdminPasswordSchema, resetSchema, statusSchema, updateAdminSchema } from '../validators/rbac.js';
import * as auth from '../controllers/auth.controller.js';
import * as account from '../controllers/account.controller.js';
import * as admin from '../controllers/admin.controller.js';
import * as hero from '../controllers/hero.controller.js';
import * as finance from '../controllers/finance.controller.js';
import * as category from '../controllers/category.controller.js';
import * as teamMember from '../controllers/teamMember.controller.js';
import { teamMemberSchema, teamMemberUpdateSchema } from '../validators/teamMember.js';
import { getHeroSettings, updateHeroSettings } from '../controllers/settings.controller.js';
import { uploadImage } from '../controllers/upload.controller.js';

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const limiter = (windowMs, limit, message) => rateLimit({ windowMs, limit, standardHeaders: true, legacyHeaders: false, message: { message } });

const loginLimiter = limiter(15 * 60 * 1000, 10, 'Too many sign-in attempts. Try again in 15 minutes.');
const registerLimiter = limiter(60 * 60 * 1000, 20, 'Too many attempts. Try again later.');
const inquiryLimiter = limiter(60 * 60 * 1000, 15, 'Too many enquiries from this device. Please call us instead.');
const resetLimiter = limiter(60 * 60 * 1000, 8, 'Too many reset attempts. Try again later.');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)
    ? cb(null, true)
    : cb(Object.assign(new Error('Use a JPG, PNG, WebP or AVIF image.'), { code: 'INVALID_FILE' }))),
});

router.get('/health', (_req, res) => res.json({ ok: true }));

// ---------- Public ----------
router.get('/hero-slides', wrap(hero.publicSlides));
router.get('/finance-partners', wrap(finance.publicList));
router.get('/team-members', wrap(teamMember.publicList)); // public Our Teams page
router.get('/products', wrap(admin.publicProducts));
router.get('/catalog', wrap(category.publicCatalog)); // vehicles + categories for the public site

// ---------- Accounts (customers and staff share one sign-in) ----------
router.post('/auth/login', loginLimiter, validate(loginSchema), wrap(account.login));
router.post('/auth/register', registerLimiter, validate(registerSchema), wrap(account.register));
router.post('/auth/logout', account.logout);
router.get('/auth/me', wrap(account.me));
router.get('/auth/my-inquiries', wrap(requireUser), wrap(account.myInquiries));
router.post('/auth/forgot-password', resetLimiter, validate(forgotSchema), wrap(account.forgotPassword));
router.post('/auth/reset-password', resetLimiter, validate(resetSchema), wrap(account.resetPassword));
// Any signed-in role, own record only
router.get('/auth/profile', wrap(requireSession), account.getProfile);
router.put('/auth/profile', wrap(requireSession), validate(profileSchema), wrap(account.updateProfile));
router.post('/auth/change-password', wrap(requireSession), validate(changeOwnPasswordSchema), wrap(account.changeOwnPassword));
router.post('/auth/upload-avatar', wrap(requireSession), (req, _res, next) => { req.query.folder = 'avatars'; next(); }, upload.single('image'), uploadImage);

// ---------- Enquiries ----------
router.post('/inquiries/quick', inquiryLimiter, validate(quickInquirySchema), wrap(account.createQuickInquiry));
router.post('/inquiries', inquiryLimiter, validate(inquirySchema), wrap(account.createInquiry));

// ---------- Staff sign-in ----------
router.post('/admin/login', loginLimiter, validate(loginSchema), wrap(auth.adminLogin));
router.post('/admin/logout', auth.adminLogout);
router.get('/admin/me', wrap(requireAdmin), auth.adminMe);

// ---------- Staff: dashboard + enquiry workflow (admins only see enquiries assigned to them unless granted enquiries.all) ----------
router.get('/admin/dashboard', wrap(requireAdmin), wrap(admin.dashboard));
router.get('/admin/inquiries', wrap(requireAdmin), wrap(admin.listInquiries));
router.get('/admin/inquiries/:id', wrap(requireAdmin), wrap(admin.getInquiry));
router.post('/admin/inquiries/:id/assign', wrap(requireSuperAdmin), validate(assignSchema), wrap(admin.assignInquiry));
router.patch('/admin/inquiries/:id/status', wrap(requireAdmin), validate(statusSchema), wrap(admin.setStatus));
router.delete('/admin/inquiries/:id', wrap(requireSuperAdmin), wrap(admin.removeInquiry));
router.post('/admin/inquiries/:id/notes', wrap(requireAdmin), validate(noteSchema), wrap(admin.addNote));

// ---------- Customers ----------
router.get('/admin/customers', wrap(requirePermission('customers.view')), wrap(admin.listCustomers));
router.get('/admin/customers/:id', wrap(requirePermission('customers.view')), wrap(admin.getCustomer));
router.patch('/admin/customers/:id/status', wrap(requireSuperAdmin), validate(customerStatusSchema), wrap(admin.setCustomerStatus));

// ---------- Admin team (Super Admin only) + audit trail (Super Admin, or an admin granted activity.view) ----------
router.get('/admin/team', wrap(requireSuperAdmin), wrap(admin.listTeam));
router.post('/admin/team', wrap(requireSuperAdmin), validate(createAdminSchema), wrap(admin.createAdmin));
router.get('/admin/team/:id', wrap(requireSuperAdmin), wrap(admin.getTeamMember));
router.patch('/admin/team/:id', wrap(requireSuperAdmin), validate(updateAdminSchema), wrap(admin.updateAdmin));
router.post('/admin/team/:id/reset-password', wrap(requireSuperAdmin), validate(resetAdminPasswordSchema), wrap(admin.resetAdminPassword));
router.delete('/admin/team/:id', wrap(requireSuperAdmin), wrap(admin.removeAdmin));
router.get('/admin/activity', wrap(requirePermission('activity.view')), wrap(admin.activityFeed));

// ---------- Vehicles / products ----------
router.get('/admin/products', wrap(requirePermission('products.manage')), wrap(admin.listProducts));
router.post('/admin/products', wrap(requirePermission('products.manage')), validate(productSchema), wrap(admin.createProduct));
router.put('/admin/products/:id', wrap(requirePermission('products.manage')), validate(productUpdateSchema), wrap(admin.updateProduct));
router.patch('/admin/products/:id/toggle', wrap(requirePermission('products.manage')), wrap(admin.toggleProduct));
router.delete('/admin/products/:id', wrap(requirePermission('products.manage')), wrap(admin.removeProduct));

// ---------- Vehicle categories (read: anyone who manages vehicles or categories; write: vehicle_categories.manage) ----------
router.get('/admin/categories', wrap(requireAnyPermission('products.manage', 'vehicle_categories.manage')), wrap(category.adminList));
router.post('/admin/categories', wrap(requirePermission('vehicle_categories.manage')), validate(categorySchema), wrap(category.create));
router.put('/admin/categories/:id', wrap(requirePermission('vehicle_categories.manage')), validate(categoryUpdateSchema), wrap(category.update));
router.patch('/admin/categories/:id/toggle', wrap(requirePermission('vehicle_categories.manage')), wrap(category.toggle));
router.delete('/admin/categories/:id', wrap(requirePermission('vehicle_categories.manage')), wrap(category.remove));

// ---------- Finance partners / trusted companies ----------
router.get('/admin/finance-partners', wrap(requirePermission('finance.manage')), wrap(finance.adminList));
router.post('/admin/finance-partners', wrap(requirePermission('finance.manage')), validate(financePartnerSchema), wrap(finance.create));
router.put('/admin/finance-partners/reorder', wrap(requirePermission('finance.manage')), validate(reorderSchema), wrap(finance.reorder));
router.put('/admin/finance-partners/:id', wrap(requirePermission('finance.manage')), validate(financePartnerUpdateSchema), wrap(finance.update));
router.patch('/admin/finance-partners/:id/toggle', wrap(requirePermission('finance.manage')), wrap(finance.toggle));
router.delete('/admin/finance-partners/:id', wrap(requirePermission('finance.manage')), wrap(finance.remove));

// ---------- Our Teams page (public team members; staff accounts are /admin/team above) ----------
router.get('/admin/team-members', wrap(requirePermission('ourteam.manage')), wrap(teamMember.adminList));
router.post('/admin/team-members', wrap(requirePermission('ourteam.manage')), validate(teamMemberSchema), wrap(teamMember.create));
router.put('/admin/team-members/reorder', wrap(requirePermission('ourteam.manage')), validate(reorderSchema), wrap(teamMember.reorder));
router.put('/admin/team-members/:id', wrap(requirePermission('ourteam.manage')), validate(teamMemberUpdateSchema), wrap(teamMember.update));
router.patch('/admin/team-members/:id/toggle', wrap(requirePermission('ourteam.manage')), wrap(teamMember.toggle));
router.delete('/admin/team-members/:id', wrap(requirePermission('ourteam.manage')), wrap(teamMember.remove));

// ---------- Hero banners, settings, uploads ----------
router.get('/admin/hero-slides', wrap(requirePermission('hero.manage')), wrap(hero.adminList));
router.post('/admin/hero-slides', wrap(requirePermission('hero.manage')), validate(heroSlideSchema), wrap(hero.create));
router.put('/admin/hero-slides/reorder', wrap(requirePermission('hero.manage')), validate(reorderSchema), wrap(hero.reorder));
router.put('/admin/hero-slides/:id', wrap(requirePermission('hero.manage')), validate(heroSlideUpdateSchema), wrap(hero.update));
router.patch('/admin/hero-slides/:id/toggle', wrap(requirePermission('hero.manage')), wrap(hero.toggle));
router.delete('/admin/hero-slides/:id', wrap(requirePermission('hero.manage')), wrap(hero.remove));
router.get('/admin/settings/hero', wrap(requirePermission('settings.manage')), wrap(getHeroSettings));
router.put('/admin/settings/hero', wrap(requirePermission('settings.manage')), validate(heroSettingsSchema), wrap(updateHeroSettings));
router.post('/admin/upload', wrap(requireAdmin), upload.single('image'), uploadImage);

export default router;
