# Panther EV

Two independent apps:

| App | Stack | Default URL |
|---|---|---|
| `frontend/` | Next.js (App Router), React, TypeScript, Tailwind, Framer Motion | http://localhost:3000 |
| `backend/`  | Express, MongoDB/Mongoose, JWT (HTTP-only cookie), Cloudinary | http://localhost:5000/api |

## Run locally
```bash
# 1. backend
cd backend
npm install
# backend/.env is already filled for local development (MongoDB on 127.0.0.1). Edit if yours differs.
npm run seed     # creates the SUPER ADMIN (from ADMIN_EMAIL / ADMIN_PASSWORD), 6 vehicles, 4 hero banners, default settings
npm run dev

# 2. frontend (new terminal)
cd frontend
npm install
npm run dev
```
Admin: http://localhost:3000/admin/login

## Secrets
- `backend/.env` holds the admin email/password, JWT secret and (later) SMTP/Cloudinary keys. It is git-ignored. Never commit it and never put these in `frontend/`.
- `admin@123` is for local development only. Change it before going live (`POST /api/admin/change-password` is ready; the admin screen for it comes next). In production the seeded admin is flagged `mustChangePassword`.
- The password is stored only as a bcrypt hash.

## Hero banners
MongoDB -> `GET /api/hero-slides` -> `frontend/lib/hero.ts` -> `<HeroSlider />`. Only "Vehicle cut-out" banners are shown on the hero (over the fixed background).
If the API is down or has no active cut-out banners, `frontend/data/heroFallback.ts` is shown so the page is never empty.
Manage banners in Admin > Hero Banners; timing and controls in Admin > Settings.
Uploads need the three `CLOUDINARY_*` keys; without them you can paste an image link instead.

## Accounts, cart, country
- One sign-in form at `/login` for everyone: admin emails go to `/admin/dashboard`, customers to `/account`. `/register` creates a customer account (password hashed with bcrypt, HTTP-only cookie).
- Navbar order: Logo, Home, Vehicles, Why Panther, Technology, Services, Dealership, Company, Contact, then Search, Cart (enquiry cart, saved in the browser, sent with the enquiry form) and the user (icon + name). Icons only, no labels, no country text. The country list (`frontend/data/countries.ts`) now lives in the footer. No P mark beside the logo.
- Enquiries from `/contact` and the cart are saved in MongoDB and listed in Admin > Enquiries.

## Pages (Phase 2 + 3)
`/vehicles`, `/vehicles/passenger-e-rickshaw`, `/vehicles/cargo-e-rickshaw`, `/vehicles/[model]`, `/compare`, `/dealers`, `/dealership`, `/services`, `/services/book`, `/company` (the only page with the large P visual; `/about` redirects here), `/news`, `/contact`, legal placeholders, 404 / error / loading, `sitemap.xml`, `robots.txt`.
Content lives in `frontend/data/*` for now (products, dealers, services, company, news) and moves to MongoDB + Admin in Phase 4. Specs, prices and legal text are left as "Contact Panther" / placeholders until Panther supplies them; nothing is invented.
Service bookings and dealership applications are saved as enquiries (subject "Service booking" / "Dealership application") and show in Admin > Enquiries.

## Built so far
Home hero: the fixed `golden-waterfront-sunset.png` background with four transparent vehicle cut-outs (XL Plus, XL, Super Deluxe, E-Rickshaw) from `frontend/public/hero/`; text on the left, vehicle on the right, a new vehicle every 3 seconds (vehicle slides left, next enters from the right, text rises from below); the "The power within" section plays `frontend/public/media/panther-assembly.mp4`.
Navbar (always white), P mark, mega menu, mobile drawer, search, hero slider + CMS, admin login, homepage sections, footer.
Phases 1 to 3 are in place. Remaining (Phase 4): move content from `frontend/data/*` into MongoDB models and API routes, then the admin dashboard and product CMS.

## Latest changes
- Navbar: centred container with side padding; right side is Search, Cart, country flag + arrow, user icon + name.
- Home hero: background is `public/hero/golden-sunset-road.png` with a light dark overlay (no blur); each vehicle has contact shadows measured to its tyres (`STANCE` in `components/home/HeroSlide.tsx`).
- Company: Vision | large P image | Mission, red rectangle removed. Vision/Mission text in `data/company.ts` is placeholder wording to be replaced with Panther's approved text.
- Dealership: form removed; red "Apply for dealership" link opens the existing application (`public/dealership-application/index.html`, from Panther_company.zip). Required documents are the five uploads that form asks for. The form currently only logs to the browser console on submit; connecting it to the backend is a separate step.

## Roles, enquiries and finance (latest)
- Roles: `super_admin` (full control), `admin` (enquiries assigned to them + permissions the Super Admin grants: all enquiries, customers, vehicles, finance, banners) and `user`. The role is read from MongoDB on every request (never from the browser or the token). Old `owner`/`editor` admins and old enquiry statuses are migrated automatically when the backend starts.
- Only the seed creates a Super Admin. `POST /api/admin/team` can only create plain admins.
- Enquiry statuses: new, assigned, in_progress, waiting_for_user, completed, cancelled. Every change is stored in an append-only history (`InquiryActivity`); important actions also go to the audit log (`ActivityLog`, Admin > Reports / Activity).
- Passwords: min 10 chars with a letter and a number; changing/resetting a password signs out other devices. Forgot password e-mails a single-use 30-minute link (only its SHA-256 is stored). Set `SMTP_*` in `backend/.env`; without SMTP in development the link is printed in the backend console.
- Finance: public page `/finance` (navbar between Company and Contact). Manage companies in Admin > Finance (Super Admin, or an admin with the Finance permission).
- Addresses: Profile page for every role (address, city, state, pincode, country).
- Vehicles are now stored in MongoDB (Admin > Vehicles, `GET /api/products`). The public pages still read `frontend/data/products.ts`; switching them to the API is the next step.

## Super Admin, team management and trusted partners (latest)
No reseed is needed: start the backend and `runMigrations()` (in `backend/src/seed/migrate.js`) does the upgrades. Nothing is deleted.

**Roles**
- Old `owner` → `super_admin`, old `editor` → `admin`. If staff exist but nobody is a Super Admin, the `ADMIN_EMAIL` account (else the oldest account) is promoted.
- The role is read from MongoDB on every request (`backend/src/middleware/auth.js`): `requireAdmin`, `requireSuperAdmin`, `requirePermission(perm)`.
- Team forms and APIs have no role field (strict schemas reject one), so a second Super Admin cannot be created from the panel.

**Permissions** (`backend/src/lib/permissions.js`, labels in `frontend/components/admin/PermissionPicker.tsx`)

| Key | Opens |
|---|---|
| `dashboard.view` | Site-wide totals on the dashboard |
| `enquiries.all` | Every enquiry (otherwise only assigned ones) |
| `customers.view` | Customers |
| `products.manage` | Vehicles |
| `vehicle_categories.manage` | Add / edit / deactivate / delete vehicle categories (everyone with `products.manage` can see them) |
| `finance.manage` | Finance partners |
| `ourteam.manage` | Admin > Our Teams (people on the public Our Teams page) |
| `hero.manage` | Hero banners |
| `services.manage` | Every enquiry whose subject mentions "service" (service bookings) |
| `dealership.manage` | Every enquiry whose subject mentions "dealer" |
| `settings.manage` | Homepage banner settings |
| `activity.view` | Activity log |

**Team API (Super Admin only)**: `GET/POST /admin/team`, `GET/PATCH/DELETE /admin/team/:id`, `POST /admin/team/:id/reset-password`.
Deactivating bumps the session version (signed out at once); removing deletes the account and returns its enquiries to the unassigned list. Super Admin accounts cannot be edited, deactivated or removed through these routes.

**Finance partners**: one data source (`FinancePartner`, `GET /api/finance-partners`) feeds the Finance page, "Latest from Panther" and the footer through `frontend/components/partners/PartnerLogoCard.tsx`. The five supplied logos are in `frontend/public/partners/` and are added to the database once (flag `seeds.trustedPartnersV1` in Settings), so a partner you later delete or hide stays that way. `logoBg: 'dark'` marks a white logo (Ascent Capital) that is shown on a dark card. Logos link in the same tab.

## Profile, vehicle categories and instant website updates (latest)

**Profile (`/admin/profile`)** was blank because it used the public site's sign-in context, which does not exist under `/admin`. It now reads the admin session (`AdminContext`) and saves through `PUT /api/auth/profile` (own account only). Role, permissions and status are display-only; email is read-only.

**Vehicle categories** are records in MongoDB (`VehicleCategory`: name, key, slug, description, active, displayOrder, createdBy), managed at the bottom of Admin > Vehicles.
- A vehicle stores the category `key`. `key` and `slug` are fixed when the category is created, so renaming a category never breaks vehicles or links.
- On first start the two old categories are created with the keys existing vehicles already use (`passenger`, `cargo`) and their old addresses (`/vehicles/passenger-e-rickshaw`, `/vehicles/cargo-e-rickshaw`). Vehicles are not modified.
- Deleting is refused while vehicles use the category (HTTP 409 with the count). Deactivating hides it from the new-vehicle dropdown and from public menus; its vehicles stay visible.
- API: `GET /api/admin/categories` (needs `products.manage` or `vehicle_categories.manage`), `POST/PUT/PATCH toggle/DELETE /api/admin/categories[/:id]` (needs `vehicle_categories.manage`).

**The public site now reads vehicles and categories from the database** (`GET /api/catalog` -> `frontend/lib/catalog.ts` -> `CatalogProvider`). `frontend/data/products.ts` is only the fallback when the API is down or has no vehicles.

**Instant updates.** The delay came from time-based caching: every public fetch used `revalidate: 30` (plus `max-age=30` on the API), and Next.js serves the old copy once more while it refreshes, so a change could take up to a minute.
- Now every admin save makes the backend call `POST <FRONTEND_URL>/api/revalidate` with a tag (`hero`, `finance`, `catalog`), which drops the cached copy immediately (`backend/src/lib/revalidate.js`, `frontend/app/api/revalidate/route.ts`).
- Both apps need the same `REVALIDATE_SECRET` (`backend/.env`, `frontend/.env.local`). Without it, or if the website cannot be reached, a 5-second fallback applies (`frontend/lib/cache.ts`).
- The homepage slider now actually uses every setting from Admin > Settings: time per banner, fade/slide, pause on hover, indicators, arrows. (Before, the time was fixed at 3 s and only "autoplay" and "indicators" were read.)

**Footer**: "Follow Panther" social icons in each platform's colours (`components/ui/SocialIcons.tsx`). "Latest from Panther" shows finance partner logos only.

## Quick Enquiry (latest)

**Where the button is.** Green, never in the navbar. Desktop: fixed to the bottom-right corner of every public page (`components/enquiry/QuickEnquiryFab.tsx`). Phones and tablets: the green bottom bar (`components/layout/StickyEnquiry.tsx`). Both open the same popup (`QuickEnquiryModal.tsx`, via `QuickEnquiryProvider`) over the current page; the URL does not change. On desktop the hero's previous/next arrows moved next to the slide indicators (bottom left) so the corner is free.

**Flow.** `POST /api/inquiries/quick` (Zod: name min 2, Indian 10-digit mobile, optional email) -> saved in `Inquiry` with `source: 'quick-enquiry'`, `vehicleInterest`, `whatsappStatus` -> WhatsApp.
- `WHATSAPP_ACCESS_TOKEN` + `WHATSAPP_PHONE_NUMBER_ID` set in `backend/.env`: the backend sends the message through the WhatsApp Business Cloud API to `WHATSAPP_NUMBER`. The visitor sees "sent successfully" only if WhatsApp accepted it (`whatsappStatus: sent`, otherwise `failed` and the fallback below is used).
- Not set (the default): the visitor gets a WhatsApp link with the message already typed and presses Send themselves (`whatsappStatus: pending_user`). The site says the enquiry was saved and WhatsApp is opening; it does not claim the message was sent.
- A plain text message through the Cloud API is only delivered if the receiving number messaged the business number in the last 24 hours. For reliable delivery create an approved template with ONE body variable and set `WHATSAPP_TEMPLATE_NAME`.

**Admin.** `/admin/enquiries` (`/admin/inquiries` redirects there): Source and WhatsApp columns, quick filters All / New / Contacted / Converted, source filter, search includes vehicle and message. On an enquiry: Mark as contacted, Mark as converted, and Delete (Super Admin only, `DELETE /api/admin/inquiries/:id`). `contacted` and `converted` are new statuses; the old one-time rename of legacy `contacted` records now runs once only.

## Quick Enquiry fields, logo size, footer credit (latest)
- **Quick Enquiry** asks for full name, phone and message only (all required). `POST /api/inquiries/quick` validates just those three; `email`, `city` and `vehicleInterest` stay on the `Inquiry` model as optional fields so older enquiries still display.
- **Logo size**: `FinancePartner.logoScale` (percent, 50-500, default 100; partners without a value show at 100). Set it in Admin > Finance > Edit company (slider, - / +, Reset, live preview). Applied as a CSS transform in `PartnerLogoCard`, so the Finance page, "Latest from Panther" and the footer all use it; the uploaded file and the card size are untouched and the logo area clips anything larger than the card.
- **Footer credit**: "Designed by Panther team" under the copyright line; each name is its own link, opening in a new tab.

## Speed, partner limit, footer credit position (latest)
- **Images**: `frontend/next.config.mjs` now keeps optimised images for 30 days (`minimumCacheTTL`; the default 60 s re-encoded the 1.4-2.7 MB hero PNGs constantly) and serves WebP only (AVIF encoding was slow). If you replace a file in `frontend/public` under the SAME name, delete `frontend/.next/cache/images` so the old copy is dropped.
- **Page changes feel slow in `npm run dev`** because Next.js compiles each page the first time it is opened and does not preload links. For real speed: `npm run build` then `npm start` in `frontend/`.
- **Finance partners**: the home page ("Latest from Panther") and the footer show the first six (`PARTNER_PREVIEW` in `frontend/types/finance.ts`) with a "View all" link to `/finance`, which lists every company. Order comes from Admin > Finance.
- **Logo size** range is now 50-500%.
- **Footer credit** sits in the middle of the bottom row (copyright left, country right).

## Our Teams page and favicon (latest)
- **Public page** `/our-teams` (navbar: after Finance, before Contact). Cards come from MongoDB (`TeamMember`), visible members only, sorted by `displayOrder` then creation date. Blank fields are simply not rendered.
- **Admin > Our Teams** (`/admin/our-teams`, permission `ourteam.manage`; Super Admin always): add, edit, delete, hide/show, move up/down, display order, photo upload, image size 50-500% with reset and a live preview. Every field is optional (name, designation, email, photo, description, experience, additional information); the only rule is that a record needs at least a name, a role or a photo.
- Not to be confused with **Admin > Team**, which is the staff sign-in accounts.
- API: `GET /api/team-members` (public), `GET/POST /api/admin/team-members`, `PUT /api/admin/team-members/reorder`, `PUT/DELETE /api/admin/team-members/:id`, `PATCH /api/admin/team-members/:id/toggle`. Saves refresh the public page at once (cache tag `team`).
- **Favicon**: `frontend/app/favicon.ico`, `app/icon.png` and `app/apple-icon.png` are made from the supplied Panther logo (on a white tile so it shows on dark tab bars); the old `app/icon.svg` "P" is removed. Next.js picks these files up automatically, in development and after a production build. Browsers cache favicons hard: use a hard refresh (Ctrl+Shift+R) or a new tab to see it.
- **Navbar**: with ten links the labels are slightly tighter below 1800px wide so none wrap; below 1280px the account shows as an icon without the name.

## Vehicle photos not showing (fix)
Vehicle photos are addresses on `https://pantherev.com/<model>.png` (still live). They were passed through the Next.js image optimiser, which makes the Next.js server download each photo before the browser gets it; when that download fails or times out the browser shows only the alt text. Every image on another website (pantherev.com, Cloudinary, pasted links) is now loaded directly by the browser (`isExternalImage` in `frontend/lib/media.ts`). Files in `frontend/public` are still optimised. To stop depending on the old website, upload each vehicle's photo in Admin > Vehicles.

## Image uploads: large files (fix)
Cloudinary rejects images over about 10 MB ("File size too large. Got ... Maximum is 10485760"). Every admin upload now passes through `frontend/lib/imagePrep.ts` first: pictures over 1.5 MB or wider/taller than 2400 px are scaled down in the browser (proportions and transparency kept) and saved as WebP, usually a few hundred KB. Small pictures are uploaded unchanged. If Cloudinary still refuses a file, the admin sees a plain message instead of Cloudinary's raw text.

## Team photo position
Admin > Our Teams: besides the size, each photo can be moved inside its frame — drag it in the preview, or use the up / down / left / right buttons (5% steps); "Centre" resets it. Saved per person as `imagePosX` / `imagePosY` (percent of the frame, -100 to 100, default 0) and applied with the size as one CSS transform (`imageStyle` in `frontend/types/team.ts`). The uploaded file is never changed.
