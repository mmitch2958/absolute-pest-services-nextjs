# absolutepestservices.com — Next.js 15 SSR Migration

This is the Next.js 15 App Router version of absolutepestservices.com.

## Why This Migration?

The old site was a React + Vite SPA. Googlebot received a blank `<div id="root"></div>` with no content — 98 pages were invisible to search engines.

This Next.js version:
- ✅ Serves full HTML server-side on every request
- ✅ Unique `<title>` and `<meta description>` per page
- ✅ `<h1>` tags on all pages (was missing everywhere)
- ✅ LocalBusiness JSON-LD schema on homepage
- ✅ FAQ schema on service pages
- ✅ GA4 (`G-0PXFRNKQW5`) + Google Ads (`AW-1038095551`) on every page
- ✅ 108 pages — 13 core + 25 service areas + 60 city×service
- ✅ Sitemap.xml auto-generated
- ✅ Robots.txt configured

## Deploy to Vercel (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this repo: `mmitch2958/absolute-pest-services-nextjs`
3. Vercel auto-detects Next.js — click Deploy
4. Add environment variables:
   ```
   NEXT_PUBLIC_GA4_MEASUREMENT_ID = G-0PXFRNKQW5
   NEXT_PUBLIC_GOOGLE_ADS_ID = AW-1038095551
   NODE_ENV = production
   ```
5. Add custom domain: `absolutepestservices.com`

## Cloudflare DNS Update

After Vercel deploy:
1. Remove old A record pointing to Replit
2. Add: `CNAME absolutepestservices.com → cname.vercel-dns.com`
3. Keep orange cloud (proxy) enabled
4. SSL/TLS: Full (Strict)

## Local Development

```bash
npm install
npm run dev   # http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values.

## What's Still Needed

- [ ] Admin dashboard: Import original `AdminMarketing.tsx` from Replit source and add `'use client'` to top
- [ ] Contact form: Configure email provider in `src/components/forms/actions.ts`
- [ ] Images: Add real images to `public/images/` — currently using CSS gradients as placeholders
- [ ] Blog: Connect to CMS if Mike wants a managed blog

## Tech Stack

- **Framework:** Next.js 15 App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Forms:** Server Actions + Zod validation
- **Deployment:** Vercel (recommended)
