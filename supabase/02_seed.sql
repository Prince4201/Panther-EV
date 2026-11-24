-- ============================================================================
-- PANTHER EV (Unique International EV Private Limited)
-- SUPABASE INITIAL DATA SEED (02_seed.sql)
-- Complete 19-record migration with 100% field parity from MongoDB.
-- Idempotent: Re-executing updates records in place without duplicating data.
-- ============================================================================

-- ============================================================================
-- 1. SEED SUPER ADMIN (1 Document)
-- Original ObjectId: 6afb4c09e0fabd265a0dc731
-- Password hash: $2a$12$WSpqDz1tS8TGJ/BmaH/BPeDs5f23LX23KXNw0PYemxFPUUkG2I/M2 (admin@123)
-- ============================================================================
INSERT INTO admins (
    id, name, email, password_hash, role, permissions, active, phone, avatar,
    address_line1, address_city, address_state, address_pincode, address_country,
    must_change_password, password_changed_at, token_version, last_login_at,
    created_by, created_at, updated_at
) VALUES (
    '6afb4c09e0fabd265a0dc731',
    'Panther Admin',
    'paulsubhasini31@gmail.com',
    '$2a$12$WSpqDz1tS8TGJ/BmaH/BPeDs5f23LX23KXNw0PYemxFPUUkG2I/M2',
    'super_admin',
    '{}'::text[],
    true,
    '',
    '',
    '',
    '',
    '',
    '',
    'India',
    false,
    NULL,
    0,
    '2026-11-16 18:35:12.999+00',
    NULL,
    '2026-11-16 18:31:37.323+00',
    '2026-11-16 18:35:13.001+00'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    permissions = EXCLUDED.permissions,
    active = EXCLUDED.active,
    phone = EXCLUDED.phone,
    avatar = EXCLUDED.avatar,
    address_line1 = EXCLUDED.address_line1,
    address_city = EXCLUDED.address_city,
    address_state = EXCLUDED.address_state,
    address_pincode = EXCLUDED.address_pincode,
    address_country = EXCLUDED.address_country,
    must_change_password = EXCLUDED.must_change_password,
    token_version = EXCLUDED.token_version,
    last_login_at = EXCLUDED.last_login_at,
    updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 2. SEED VEHICLE CATEGORIES (2 Documents)
-- ============================================================================
INSERT INTO vehicle_categories (
    id, name, key, slug, description, active, display_order, created_by, created_at, updated_at
) VALUES 
(
    '6afb4c08e0fabd265a0dc715',
    'Passenger e-rickshaw',
    'passenger',
    'passenger-e-rickshaw',
    'Comfortable, dependable electric rickshaws for people-moving businesses.',
    true,
    1,
    NULL,
    '2026-11-16 18:31:36.912+00',
    '2026-11-16 18:31:36.912+00'
),
(
    '6afb4c08e0fabd265a0dc718',
    'Cargo e-rickshaw',
    'cargo',
    'cargo-e-rickshaw',
    'Heavy-duty electric rickshaws for logistics and last-mile delivery.',
    true,
    2,
    NULL,
    '2026-11-16 18:31:36.919+00',
    '2026-11-16 18:31:36.919+00'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    key = EXCLUDED.key,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description,
    active = EXCLUDED.active,
    display_order = EXCLUDED.display_order,
    updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 3. SEED VEHICLES (6 Documents)
-- ============================================================================
INSERT INTO products (
    id, slug, name, category, tag, summary, description, image, image_public_id,
    gallery, specs, price, "order", active, created_at, updated_at
) VALUES
(
    '6afb4c09e0fabd265a0dc734',
    'panther-xl-plus',
    'Panther XL Plus',
    'passenger',
    'Heavy Duty',
    'Heavy-duty passenger e-rickshaw, the top of the XL line.',
    '',
    '/vehicles/panther-xl-plus.png',
    '',
    '[]'::jsonb,
    '[{"label":"Range","value":null},{"label":"Battery","value":null},{"label":"Motor","value":null},{"label":"Payload","value":null},{"label":"Charging","value":null},{"label":"Warranty","value":null}]'::jsonb,
    NULL,
    1,
    true,
    '2026-11-16 18:31:37.333+00',
    '2026-11-16 18:31:37.333+00'
),
(
    '6afb4c09e0fabd265a0dc735',
    'panther-xl',
    'Panther XL',
    'passenger',
    'Popular',
    'Popular passenger e-rickshaw built for daily city routes.',
    '',
    '/vehicles/panther-xl.png',
    '',
    '[]'::jsonb,
    '[{"label":"Range","value":null},{"label":"Battery","value":null},{"label":"Motor","value":null},{"label":"Payload","value":null},{"label":"Charging","value":null},{"label":"Warranty","value":null}]'::jsonb,
    NULL,
    2,
    true,
    '2026-11-16 18:31:37.333+00',
    '2026-11-16 18:31:37.333+00'
),
(
    '6afb4c09e0fabd265a0dc736',
    'panther-deluxe',
    'Panther Deluxe',
    'passenger',
    'Comfort',
    'Comfort-focused passenger e-rickshaw with low-maintenance design.',
    '',
    '/vehicles/panther-deluxe.png',
    '',
    '[]'::jsonb,
    '[{"label":"Range","value":null},{"label":"Battery","value":null},{"label":"Motor","value":null},{"label":"Payload","value":null},{"label":"Charging","value":null},{"label":"Warranty","value":null}]'::jsonb,
    NULL,
    3,
    true,
    '2026-11-16 18:31:37.333+00',
    '2026-11-16 18:31:37.333+00'
),
(
    '6afb4c09e0fabd265a0dc737',
    'panther-super-deluxe',
    'Panther Super Deluxe',
    'passenger',
    'Flagship',
    'Flagship passenger e-rickshaw in the Panther range.',
    '',
    '/vehicles/panther-super-deluxe.png',
    '',
    '[]'::jsonb,
    '[{"label":"Range","value":null},{"label":"Battery","value":null},{"label":"Motor","value":null},{"label":"Payload","value":null},{"label":"Charging","value":null},{"label":"Warranty","value":null}]'::jsonb,
    NULL,
    4,
    true,
    '2026-11-16 18:31:37.333+00',
    '2026-11-16 18:31:37.333+00'
),
(
    '6afb4c09e0fabd265a0dc738',
    'panther-xl-cargo',
    'Panther XL Cargo',
    'cargo',
    'Logistics',
    'Cargo e-rickshaw for logistics and last-mile delivery.',
    '',
    '/vehicles/panther-xl-cargo.png',
    '',
    '[]'::jsonb,
    '[{"label":"Range","value":null},{"label":"Battery","value":null},{"label":"Motor","value":null},{"label":"Payload","value":null},{"label":"Charging","value":null},{"label":"Warranty","value":null}]'::jsonb,
    NULL,
    5,
    true,
    '2026-11-16 18:31:37.333+00',
    '2026-11-16 18:31:37.333+00'
),
(
    '6afb4c09e0fabd265a0dc739',
    'panther-cargo',
    'Panther Cargo',
    'cargo',
    'Max Payload',
    'Heavy-duty cargo e-rickshaw built for maximum payload.',
    '',
    '/vehicles/panther-cargo.png',
    '',
    '[]'::jsonb,
    '[{"label":"Range","value":null},{"label":"Battery","value":null},{"label":"Motor","value":null},{"label":"Payload","value":null},{"label":"Charging","value":null},{"label":"Warranty","value":null}]'::jsonb,
    NULL,
    6,
    true,
    '2026-11-16 18:31:37.333+00',
    '2026-11-16 18:31:37.333+00'
) ON CONFLICT (id) DO UPDATE SET 
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    tag = EXCLUDED.tag,
    summary = EXCLUDED.summary,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    image_public_id = EXCLUDED.image_public_id,
    gallery = EXCLUDED.gallery,
    specs = EXCLUDED.specs,
    price = EXCLUDED.price,
    "order" = EXCLUDED."order",
    active = EXCLUDED.active,
    updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 4. SEED HERO BANNERS (4 Documents)
-- ============================================================================
INSERT INTO hero_slides (
    id, title, subtitle, description, image, image_public_id, mobile_image,
    mobile_image_public_id, image_alt, fit, bg_color, text_color, text_align,
    overlay, button1_text, button1_url, button2_text, button2_url, "order",
    active, duration, created_at, updated_at
) VALUES
(
    '6afb4c09e0fabd265a0dc73d',
    'Panther XL Plus',
    'Built for every journey.',
    '',
    '/hero/panther-xl-plus.png',
    '',
    '',
    '',
    'Blue Panther XL Plus electric rickshaw',
    'contain',
    '#14151A',
    'light',
    'left',
    0,
    'Explore Vehicle',
    '/vehicles/panther-xl-plus',
    '',
    '',
    1,
    true,
    NULL,
    '2026-11-16 18:31:37.343+00',
    '2026-11-16 18:31:37.343+00'
),
(
    '6afb4c09e0fabd265a0dc73e',
    'Panther XL',
    'Power. Comfort. Reliability.',
    '',
    '/hero/panther-xl.png',
    '',
    '',
    '',
    'Red Panther XL electric rickshaw with roof carrier',
    'contain',
    '#14151A',
    'light',
    'left',
    0,
    'Explore Vehicle',
    '/vehicles/panther-xl',
    '',
    '',
    2,
    true,
    NULL,
    '2026-11-16 18:31:37.343+00',
    '2026-11-16 18:31:37.343+00'
),
(
    '6afb4c09e0fabd265a0dc73f',
    'Panther Super Deluxe',
    'Redefining everyday mobility.',
    '',
    '/hero/panther-super-deluxe.png',
    '',
    '',
    '',
    'Yellow Panther Super Deluxe electric rickshaw',
    'contain',
    '#14151A',
    'light',
    'left',
    0,
    'Explore Vehicle',
    '/vehicles/panther-super-deluxe',
    '',
    '',
    3,
    true,
    NULL,
    '2026-11-16 18:31:37.343+00',
    '2026-11-16 18:31:37.343+00'
),
(
    '6afb4c09e0fabd265a0dc740',
    'Panther E-Rickshaw',
    'Smart mobility for a changing world.',
    '',
    '/hero/panther-e-rickshaw.png',
    '',
    '',
    '',
    'Grey Panther Deluxe electric rickshaw',
    'contain',
    '#14151A',
    'light',
    'left',
    0,
    'Explore Vehicle',
    '/vehicles',
    '',
    '',
    4,
    true,
    NULL,
    '2026-11-16 18:31:37.343+00',
    '2026-11-16 18:31:37.343+00'
) ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    image_public_id = EXCLUDED.image_public_id,
    mobile_image = EXCLUDED.mobile_image,
    mobile_image_public_id = EXCLUDED.mobile_image_public_id,
    image_alt = EXCLUDED.image_alt,
    fit = EXCLUDED.fit,
    bg_color = EXCLUDED.bg_color,
    text_color = EXCLUDED.text_color,
    text_align = EXCLUDED.text_align,
    overlay = EXCLUDED.overlay,
    button1_text = EXCLUDED.button1_text,
    button1_url = EXCLUDED.button1_url,
    button2_text = EXCLUDED.button2_text,
    button2_url = EXCLUDED.button2_url,
    "order" = EXCLUDED."order",
    active = EXCLUDED.active,
    duration = EXCLUDED.duration,
    updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 5. SEED FINANCE PARTNERS (5 Documents)
-- ============================================================================
INSERT INTO finance_partners (
    id, name, category, description, logo, logo_public_id, logo_bg, logo_scale,
    website, contact_phone, contact_email, "order", active, created_at, updated_at
) VALUES
(
    '6afb4c08e0fabd265a0dc721',
    'Akasa Finance',
    'financing',
    '',
    '/partners/akasa-finance.svg',
    '',
    'light',
    100,
    'https://akasafin.com/',
    '',
    '',
    1,
    true,
    '2026-11-16 18:31:36.939+00',
    '2026-11-16 18:31:36.939+00'
),
(
    '6afb4c08e0fabd265a0dc724',
    'LokSuvidha',
    'financing',
    '',
    '/partners/loksuvidha.png',
    '',
    'light',
    100,
    'https://loksuvidha.com/',
    '',
    '',
    2,
    true,
    '2026-11-16 18:31:36.943+00',
    '2026-11-16 18:31:36.943+00'
),
(
    '6afb4c08e0fabd265a0dc727',
    'Vedika Finance',
    'financing',
    '',
    '/partners/vedika-finance.png',
    '',
    'light',
    100,
    'https://teamvedika.com/',
    '',
    '',
    3,
    true,
    '2026-11-16 18:31:36.947+00',
    '2026-11-16 18:31:36.947+00'
),
(
    '6afb4c08e0fabd265a0dc72a',
    'IndusInd Bank',
    'financing',
    '',
    '/partners/indusind-bank.png',
    '',
    'light',
    100,
    'https://www.indusind.bank.in/',
    '',
    '',
    4,
    true,
    '2026-11-16 18:31:36.950+00',
    '2026-11-16 18:31:36.950+00'
),
(
    '6afb4c08e0fabd265a0dc72d',
    'Ascent Capital',
    'financing',
    '',
    '/partners/ascent-capital.svg',
    '',
    'dark',
    100,
    'https://ascentcapital.in/',
    '',
    '',
    5,
    true,
    '2026-11-16 18:31:36.953+00',
    '2026-11-16 18:31:36.953+00'
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    logo = EXCLUDED.logo,
    logo_public_id = EXCLUDED.logo_public_id,
    logo_bg = EXCLUDED.logo_bg,
    logo_scale = EXCLUDED.logo_scale,
    website = EXCLUDED.website,
    contact_phone = EXCLUDED.contact_phone,
    contact_email = EXCLUDED.contact_email,
    "order" = EXCLUDED."order",
    active = EXCLUDED.active,
    updated_at = EXCLUDED.updated_at;

-- ============================================================================
-- 6. SEED SETTINGS (1 Document)
-- Original ObjectId: 6afb4c081b087e306afdfc0c
-- ============================================================================
INSERT INTO settings (
    id, key, hero, seeds, created_at, updated_at
) VALUES (
    '6afb4c081b087e306afdfc0c',
    'site',
    '{"autoplay": true, "duration": 6000, "pauseOnHover": true, "showIndicators": true, "showArrows": true, "transition": "fade"}'::jsonb,
    '{"legacyStatusesV1": true, "vehicleCategoriesV1": true, "trustedPartnersV1": true}'::jsonb,
    '2026-11-16 18:31:36.834+00',
    '2026-11-16 19:27:51.232+00'
) ON CONFLICT (key) DO UPDATE SET 
    id = EXCLUDED.id,
    hero = EXCLUDED.hero,
    seeds = EXCLUDED.seeds,
    updated_at = EXCLUDED.updated_at;
