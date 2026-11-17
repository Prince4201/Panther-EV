# Supabase Setup & SQL Scripts — Panther EV

This folder contains the complete PostgreSQL database definitions and seed queries to replicate the Panther EV MongoDB database inside **Supabase**.

---

## Files in this Directory

| File | Purpose |
|---|---|
| [01_schema.sql](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/supabase/01_schema.sql) | DDL script creating all 12 tables, relationships, primary keys, foreign keys, check constraints, indexes, and automated `updated_at` triggers. |
| [02_seed.sql](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/supabase/02_seed.sql) | DML script inserting the exact 19 records currently in MongoDB (Super Admin, 2 categories, 6 vehicles, 4 hero banners, 5 finance partners, site settings). |

---

## How to Execute in Supabase (Copy & Paste)

1. Open your Supabase Project: **[https://supabase.com/dashboard/project/poklpdncpsdjwxrpvnvq](https://supabase.com/dashboard/project/poklpdncpsdjwxrpvnvq)**
2. In the left-hand navigation, click on **SQL Editor**.
3. Click **+ New Query**.
4. Open [01_schema.sql](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/supabase/01_schema.sql), copy its entire content, paste it into the SQL Editor, and click **Run** (or `Ctrl+Enter`).
   - *Result: All 12 tables and indexes will be created.*
5. Click **+ New Query** again.
6. Open [02_seed.sql](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/supabase/02_seed.sql), copy its entire content, paste it into the SQL Editor, and click **Run**.
   - *Result: All 19 documents from MongoDB are inserted into PostgreSQL.*
7. Open **Table Editor** in the left menu to verify your tables (`admins`, `products`, `vehicle_categories`, `hero_slides`, `finance_partners`, `settings`).

---

## Frontend Supabase Helpers Created

The Next.js SSR helper files have been added under `frontend/utils/supabase/`:

- [frontend/utils/supabase/server.ts](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/frontend/utils/supabase/server.ts): Server Components & Server Actions Supabase client.
- [frontend/utils/supabase/client.ts](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/frontend/utils/supabase/client.ts): Client Components (`"use client"`) Supabase browser client.
- [frontend/utils/supabase/middleware.ts](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/frontend/utils/supabase/middleware.ts): Next.js middleware session refresh helper.
- [frontend/.env.local](file:///c:/Users/pj130/Desktop/antigravity/panther-ev-updated-v10/panther-ev/frontend/.env.local): Configured with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
