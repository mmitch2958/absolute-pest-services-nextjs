# APS On-Page SEO Audit Checklist

> Monthly review checklist for Mike — Absolute Pest Services (absolutepestservices.com)
> Run this checklist on the **first Monday of each month**.

---

## 🔍 Phase 1: Rankings Check

**Tools:** Google Search Console (GSC) + manual Google searches

- [ ] Log into [Google Search Console](https://search.google.com/search-console) for `absolutepestservices.com`
- [ ] Check **Performance Report** → compare clicks & impressions vs. previous month
  - Are clicks increasing? Note any new branded queries
  - Are impressions growing for target city keywords (e.g. "pest control West Chester PA")?
- [ ] Run 5–10 spot checks on target city keyword Google rankings:
  - `site:absolutepestservices.com "pest control"` + city names
  - Note any pages that dropped >5 positions
- [ ] Check **Pages** tab in GSC → find pages with high impressions but low CTR
  - Flag pages where CTR < 2% for review
- [ ] Check **Manual Actions** or **Security Issues** in GSC sidebar

**Threshold for action:** Any manual action, ranking drop >10 positions on a key page, or CTR decline >15% month-over-month.

---

## 🔧 Phase 2: Technical Health Check

**Tools:** Browser (view source) + GSC

### Crawlability
- [ ] Fetch `https://absolutepestservices.com/robots.txt` in browser — verify it allows all important routes and does NOT block Googlebot
- [ ] Check `https://absolutepestservices.com/sitemap.xml` — confirm all city pages are listed
- [ ] In GSC → **URL Inspection** on 3–5 city pages — verify Googlebot can render them

### Schema / Structured Data
- [ ] View source of `https://absolutepestservices.com/service-areas/west-chester-pa`
  - Verify `<script type="application/ld+json">` with `@graph` containing both `LocalBusiness` AND `FAQPage` is present
- [ ] Repeat for 2–3 other city pages (e.g. Kennett Square, Newark DE)
  - Schema is correct if you see both `"@type":"LocalBusiness"` and `"@type":"FAQPage"` in the same `@graph` array
- [ ] Check homepage has `LocalBusiness` schema

### Meta Tags
- [ ] View source of 3 city pages — verify `<title>` and `<meta name="description">` are unique per page (not generic)
- [ ] Verify H1 on each city page contains the city name + "Pest Control"

### Performance (Core Web Vitals signals)
- [ ] Visit `https://absolutepestservices.com` in Chrome → open DevTools → Lighthouse tab → run "Mobile" audit
  - Target: LCP < 2.5s, CLS < 0.1, FID < 100ms
  - If bundle size is approaching 5MB, flag for review
- [ ] Check that no new large images were added to the `public/` directory (images should go through Cloudinary)

### HTTPS & Security
- [ ] Confirm site loads with HTTPS (green padlock) — Replit handles this automatically
- [ ] No mixed content warnings in browser console

---

## 📝 Phase 3: Content Freshness Check

**Tools:** Browser + GSC + Page content review

- [ ] Review the 5–10 highest-traffic city pages — does the content still accurately reflect services offered?
- [ ] Check that phone numbers on city pages are current: **484-643-2225** (PA), **302-235-1975** (DE)
- [ ] Verify no broken links on city pages:
  - Test 3–4 service links per city page (e.g. `/termites`, `/wildlife-control`)
  - Test 2–3 nearby city links per page
- [ ] Check that the 5 county overview pages (`/service-areas/chester-county-pa`, etc.) have FAQ content showing
- [ ] Review Google Business Integration component is rendering on service area pages
- [ ] Check for any customer reviews or testimonials that need rotating (Google Review Request widget)

### Content Update Triggers
If any of these are found, open a task for the content team:
- New city added to service area → create new city page + add to sitemap
- Service offering changed → update affected city pages + FAQ schema
- Phone number changed → search/replace across all city pages
- New pest trend (e.g. specific invasive species) → add to relevant FAQ pages

---

## 📊 Phase 4: Track & Report

Record these metrics in a shared spreadsheet (Google Sheets):

| Metric | This Month | Last Month | Delta |
|--------|-----------|------------|-------|
| Total GSC Clicks | | | |
| Total GSC Impressions | | | |
| Average CTR | | | |
| Top 5 ranking pages | | | |
| Pages with >1K impressions | | | |
| Bundle size (approx.) | | | |

**Sign-off:** Mark this checklist complete in the shared folder after running all phases.

---

## ⚡ Quick Fixes Reference

| Issue | Fix |
|-------|-----|
| Schema missing on a city page | Re-run the `add-faq-schema` process — city pages in `client/src/pages/service-areas/` need FAQPage in Helmet |
| Bundle approaching 5MB | Check `vite.config.ts` → `maximumFileSizeToCacheInBytes`. Audit `node_modules` imports in city pages |
| City page title not unique | Update `server/seo-meta.ts` — add entry to `ROUTE_META` |
| New city page needed | Copy an existing city page → rename → update city name + FAQs + neighborhood list |
| GSC coverage error | Check GSC Coverage tab → expand error → request re-index if fixed |

---

*Last updated: March 2026*
*Maintained by: Steel City AI (Mike / R2)*
