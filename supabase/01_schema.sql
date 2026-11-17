-- ============================================================================
-- PANTHER EV (Unique International EV Private Limited)
-- SUPABASE POSTGRESQL SCHEMA (01_schema.sql)
-- Architecture: Express Backend -> Supabase PostgreSQL Direct Connection
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automated updated_at trigger function (preserves explicit updated_at when provided)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.updated_at = OLD.updated_at OR NEW.updated_at IS NULL THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ============================================================================
-- 1. ADMINS TABLE (Staff Accounts & Super Admins)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(80) NOT NULL DEFAULT 'Panther Admin',
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    permissions TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    avatar TEXT NOT NULL DEFAULT '',
    address_line1 VARCHAR(160) NOT NULL DEFAULT '',
    address_city VARCHAR(80) NOT NULL DEFAULT '',
    address_state VARCHAR(80) NOT NULL DEFAULT '',
    address_pincode VARCHAR(12) NOT NULL DEFAULT '',
    address_country VARCHAR(80) NOT NULL DEFAULT 'India',
    must_change_password BOOLEAN NOT NULL DEFAULT false,
    password_changed_at TIMESTAMPTZ DEFAULT NULL,
    token_version INTEGER NOT NULL DEFAULT 0,
    last_login_at TIMESTAMPTZ DEFAULT NULL,
    created_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive uniqueness for admin emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_admins_email_unique ON admins (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins (role);
CREATE INDEX IF NOT EXISTS idx_admins_active ON admins (active);

DROP TRIGGER IF EXISTS trigger_admins_updated_at ON admins;
CREATE TRIGGER trigger_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. USERS TABLE (Registered Customers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    avatar TEXT NOT NULL DEFAULT '',
    address_line1 VARCHAR(160) NOT NULL DEFAULT '',
    address_city VARCHAR(80) NOT NULL DEFAULT '',
    address_state VARCHAR(80) NOT NULL DEFAULT '',
    address_pincode VARCHAR(12) NOT NULL DEFAULT '',
    address_country VARCHAR(80) NOT NULL DEFAULT 'India',
    active BOOLEAN NOT NULL DEFAULT true,
    token_version INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive uniqueness for customer emails
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_active ON users (active);

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. VEHICLE CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vehicle_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(80) NOT NULL,
    key VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(400) NOT NULL DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_by TEXT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_categories_key ON vehicle_categories (key);
CREATE INDEX IF NOT EXISTS idx_vehicle_categories_order ON vehicle_categories (display_order);

DROP TRIGGER IF EXISTS trigger_vehicle_categories_updated_at ON vehicle_categories;
CREATE TRIGGER trigger_vehicle_categories_updated_at BEFORE UPDATE ON vehicle_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. PRODUCTS TABLE (Vehicles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(80) NOT NULL REFERENCES vehicle_categories(key) ON UPDATE CASCADE ON DELETE RESTRICT,
    tag VARCHAR(40) NOT NULL DEFAULT '',
    summary VARCHAR(300) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    image_public_id TEXT NOT NULL DEFAULT '',
    gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
    specs JSONB NOT NULL DEFAULT '[]'::jsonb,
    price NUMERIC(12, 2) DEFAULT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_order ON products ("order");
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. HERO SLIDES TABLE (Homepage Carousel Banners)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hero_slides (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(120) NOT NULL,
    subtitle VARCHAR(200) NOT NULL DEFAULT '',
    description VARCHAR(400) NOT NULL DEFAULT '',
    image TEXT NOT NULL,
    image_public_id TEXT NOT NULL DEFAULT '',
    mobile_image TEXT NOT NULL DEFAULT '',
    mobile_image_public_id TEXT NOT NULL DEFAULT '',
    image_alt VARCHAR(200) NOT NULL DEFAULT '',
    fit VARCHAR(20) NOT NULL DEFAULT 'cover' CHECK (fit IN ('cover', 'contain')),
    bg_color VARCHAR(30) NOT NULL DEFAULT '#EEF0F2',
    text_color VARCHAR(20) NOT NULL DEFAULT 'dark' CHECK (text_color IN ('dark', 'light')),
    text_align VARCHAR(20) NOT NULL DEFAULT 'left' CHECK (text_align IN ('left', 'center', 'right')),
    overlay INTEGER NOT NULL DEFAULT 0 CHECK (overlay BETWEEN 0 AND 100),
    button1_text VARCHAR(40) NOT NULL DEFAULT '',
    button1_url TEXT NOT NULL DEFAULT '',
    button2_text VARCHAR(40) NOT NULL DEFAULT '',
    button2_url TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    duration INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides ("order");
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides (active);

DROP TRIGGER IF EXISTS trigger_hero_slides_updated_at ON hero_slides;
CREATE TRIGGER trigger_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. FINANCE PARTNERS TABLE (Trusted Partners on /finance)
-- ============================================================================
CREATE TABLE IF NOT EXISTS finance_partners (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(20) NOT NULL DEFAULT 'financing' CHECK (category IN ('financing', 'partner', 'trusted')),
    description VARCHAR(400) NOT NULL DEFAULT '',
    logo TEXT NOT NULL DEFAULT '',
    logo_public_id TEXT NOT NULL DEFAULT '',
    logo_bg VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (logo_bg IN ('light', 'dark')),
    logo_scale INTEGER NOT NULL DEFAULT 100 CHECK (logo_scale BETWEEN 50 AND 500),
    website TEXT NOT NULL DEFAULT '',
    contact_phone VARCHAR(30) NOT NULL DEFAULT '',
    contact_email VARCHAR(120) NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_partners_order ON finance_partners ("order");
CREATE INDEX IF NOT EXISTS idx_finance_partners_active ON finance_partners (active);

DROP TRIGGER IF EXISTS trigger_finance_partners_updated_at ON finance_partners;
CREATE TRIGGER trigger_finance_partners_updated_at BEFORE UPDATE ON finance_partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. TEAM MEMBERS TABLE (Our Teams on /our-teams)
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(120) NOT NULL DEFAULT '',
    designation VARCHAR(120) NOT NULL DEFAULT '',
    email VARCHAR(120) NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    image_public_id TEXT NOT NULL DEFAULT '',
    image_scale INTEGER NOT NULL DEFAULT 100 CHECK (image_scale BETWEEN 50 AND 500),
    image_pos_x INTEGER NOT NULL DEFAULT 0 CHECK (image_pos_x BETWEEN -100 AND 100),
    image_pos_y INTEGER NOT NULL DEFAULT 0 CHECK (image_pos_y BETWEEN -100 AND 100),
    description VARCHAR(1000) NOT NULL DEFAULT '',
    experience VARCHAR(120) NOT NULL DEFAULT '',
    additional_info VARCHAR(1000) NOT NULL DEFAULT '',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members (display_order);
CREATE INDEX IF NOT EXISTS idx_team_members_visible ON team_members (is_visible);

DROP TRIGGER IF EXISTS trigger_team_members_updated_at ON team_members;
CREATE TRIGGER trigger_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. INQUIRIES TABLE (Enquiry Cart, Contact Form, Quick Enquiries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL DEFAULT '',
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(80) NOT NULL DEFAULT '',
    subject VARCHAR(120) NOT NULL DEFAULT '',
    message VARCHAR(1500) NOT NULL DEFAULT '',
    vehicles JSONB NOT NULL DEFAULT '[]'::jsonb,
    country VARCHAR(2) NOT NULL DEFAULT 'IN',
    vehicle_interest VARCHAR(80) NOT NULL DEFAULT '',
    source VARCHAR(20) NOT NULL DEFAULT 'contact' CHECK (source IN ('cart', 'contact', 'quick-enquiry')),
    whatsapp_status VARCHAR(20) NOT NULL DEFAULT 'not_applicable' CHECK (whatsapp_status IN ('not_applicable', 'sent', 'pending_user', 'failed')),
    status VARCHAR(30) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'in_progress', 'waiting_for_user', 'converted', 'completed', 'cancelled')),
    assigned_to TEXT REFERENCES admins(id) ON DELETE SET NULL,
    assigned_at TIMESTAMPTZ DEFAULT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_assigned_to ON inquiries (assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);

DROP TRIGGER IF EXISTS trigger_inquiries_updated_at ON inquiries;
CREATE TRIGGER trigger_inquiries_updated_at BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. INQUIRY ACTIVITIES TABLE (Enquiry Status & Notes History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS inquiry_activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('created', 'assigned', 'status_changed', 'progress', 'note', 'report')),
    actor_id TEXT DEFAULT NULL,
    actor_name VARCHAR(80) NOT NULL DEFAULT '',
    actor_role VARCHAR(20) NOT NULL DEFAULT '',
    message VARCHAR(2000) NOT NULL DEFAULT '',
    from_status VARCHAR(30) DEFAULT NULL,
    to_status VARCHAR(30) DEFAULT NULL,
    assigned_to_id TEXT DEFAULT NULL,
    assigned_to_name VARCHAR(80) NOT NULL DEFAULT '',
    visibility VARCHAR(20) NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'customer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiry_activities_inquiry ON inquiry_activities (inquiry_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_activities_created_at ON inquiry_activities (created_at DESC);

-- ============================================================================
-- 10. ACTIVITY LOGS TABLE (Administrative Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_id TEXT DEFAULT NULL,
    actor_name VARCHAR(80) NOT NULL DEFAULT '',
    actor_role VARCHAR(20) NOT NULL DEFAULT '',
    action VARCHAR(80) NOT NULL,
    summary VARCHAR(400) NOT NULL,
    entity_type VARCHAR(40) NOT NULL DEFAULT '',
    entity_id TEXT NOT NULL DEFAULT '',
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs (entity_type, entity_id);

-- ============================================================================
-- 11. PASSWORD RESET TOKENS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    account_kind VARCHAR(10) NOT NULL CHECK (account_kind IN ('admin', 'user')),
    account_id TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_token_hash ON password_reset_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_reset_token_account ON password_reset_tokens (account_kind, account_id);
CREATE INDEX IF NOT EXISTS idx_reset_token_expires ON password_reset_tokens (expires_at);

-- ============================================================================
-- 12. SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    id TEXT NOT NULL UNIQUE DEFAULT '6afb4c081b087e306afdfc0c',
    key VARCHAR(40) PRIMARY KEY DEFAULT 'site',
    hero JSONB NOT NULL DEFAULT '{"autoplay": true, "duration": 6000, "pauseOnHover": true, "showIndicators": true, "showArrows": true, "transition": "fade"}'::jsonb,
    seeds JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_settings_updated_at ON settings;
CREATE TRIGGER trigger_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) HARDENING
-- Since Express connects directly using the superuser/postgres role (via DATABASE_URL),
-- RLS is enabled on all tables to lock out unauthorized public REST API access
-- (via the public Supabase publishable/anon key).
-- ============================================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
