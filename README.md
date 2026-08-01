# Ethan Foods — New Website & POS Dashboard

A modern rebuild of [ethanfoods.net](https://ethanfoods.net) using the original site's real content
(products, story, contact details and all 43 customer reviews), with every image retouched and
optimised, plus a full POS-style store dashboard.

## Open it

Double-click `index.html` — no server, build step or install needed. Works from any static host
(Netlify, Vercel, GitHub Pages, cPanel, shared hosting…): just upload the whole folder.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home — hero, benefits, featured products, story, reviews, wholesale CTA |
| `shop.html` | All 6 flavors with Spicy/Mild filter and demo cart |
| `about.html` | Our Story + lifestyle photo gallery |
| `wholesale.html` | Wholesale enquiry form (product-of-interest chips) |
| `reviews.html` | All 43 real customer reviews from the old site |
| `contact.html` | Contact form + phone/email cards |
| `The staff Workspace (POS dashboard) now lives in its own repository: ethan-workspace.

## POS dashboard (`The staff Workspace (POS dashboard) now lives in its own repository: ethan-workspace.

Runs on realistic demo data (90 days of generated orders, deterministic so figures are stable).
Standard POS information included:

- **Overview** — gross sales, transactions, average ticket, packs sold (with vs-previous-period
  deltas and sparklines), daily sales trend, sales by hour, payment-method breakdown,
  discounts / tax / refunds / est. margin, top products, recent transactions, low-stock alerts.
- **Orders** — searchable/filterable order list (status, channel), CSV-export button (demo).
- **Inventory** — units on hand, stock value at cost & retail, per-SKU stock levels, 30-day
  velocity, days-until-stockout, low/critical badges.
- **Customers** — active customers, repeat rate, average lifetime spend, top-customer table with
  VIP/Repeat/New tiers.
- Date-range switch: Today / 7 / 30 / 90 days.

The dashboard runs entirely on its built-in demo data — no server or store connection needed.
(It is already structured to accept live data later: `assets/js/dashboard.js` has a
`buildLiveData()` transform that maps WooCommerce-style orders/products onto the dashboard,
so a connector can be added whenever the client wants it.)

## Images

All imagery was pulled from the old site and reprocessed (`assets/img/`):

- **Products** — backgrounds keyed to pure white, the burned-in "8 PACK JUICE" badge removed,
  colour/contrast lifted, sharpened. Each flavor has a white version (`*.webp/.jpg`) and a
  transparent cutout (`*-cutout.webp/.png`), plus smaller responsive sizes.
- **Lifestyle** — white-balanced, shadows lifted, denoised, sharpened; 3 widths each.
- **Brand** — trimmed logo (2× upscaled), square mark, and favicons.

Everything ships as WebP with JPG/PNG fallbacks; total image payload ≈ 10 MB (originals were
single files of up to 1.7 MB each).

## Notes / next steps

- The cart and both forms are front-end demos — connect them to the store platform / a form
  service (e.g. Formspree) or keep the existing WooCommerce checkout for real orders.
- Google Fonts (Fraunces + Inter) load from the network; the site falls back to system fonts offline.
- Instagram / X links in the footer are placeholders (`#`) — drop in the real profile URLs.
