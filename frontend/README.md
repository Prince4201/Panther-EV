# Panther EV – website redesign (Phase 1)

```bash
npm install
npm run dev
```

Phase 1 covers: navbar, mega menu, search overlay, mobile nav, full homepage, footer, 404.
Vehicle pages, compare, dealers, services, dealership, news, contact, SEO files and admin are Phases 2–4.

## Content rules
- All content lives in `data/`. Nothing is hard-coded into components.
- `data/products.ts`: pantherev.com publishes no specifications, so every spec is `null` and renders as
  "Contact Panther for details". Fill in real values per model when Panther supplies them.
- `data/site.ts`: contact details as published on pantherev.com. Confirm the phone number before launch.
- Product images load from pantherev.com (see `next.config.mjs`). Copy them to `public/vehicles/` for production.
