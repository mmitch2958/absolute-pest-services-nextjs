import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/analytics/Analytics'
import WebMCPProvider from '@/components/agent/WebMCPProvider'

const GTM_ID = 'GTM-K3VG6J2W'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://absolutepestservices.com'),
  title: {
    default: 'Absolute Pest Services - Professional Pest Control in PA & DE',
    template: '%s',
  },
  description:
    'Expert pest control in PA & DE. Humane wildlife control, bed bug treatment, termite protection & bat removal. Licensed, insured & available 24/7. Call 484-643-2225.',
  openGraph: {
    type: 'website',
    siteName: 'Absolute Pest Services',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Absolute Pest Services' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  other: {
    'geo.region': 'US-PA',
    'geo.placename': 'West Grove, PA',
    'geo.position': '39.8221;-75.8274',
    ICBM: '39.8221, -75.8274',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Performance preconnects */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager — loads via next/script so the <script> tag
            is reliably emitted into the rendered HTML. afterInteractive runs
            it once the page is interactive, with the loader queued in dataLayer
            from gtm.start so no events are lost. */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />

        {/* Google Ads + GA4 (gtag) — separate from GTM */}
        <Script
          id="gtag-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-1038095551"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-1038095551');
              gtag('config', 'G-0PXFRNKQW5');
            `,
          }}
        />

        {/* Google Tag Manager (noscript) — fallback for users without JS */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* JSON-LD Structured Data — LocalBusiness + AggregateRating */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'PestControlBusiness',
              name: 'Absolute Pest Services',
              url: 'https://absolutepestservices.com',
              telephone: '+1-610-869-3000',
              priceRange: '$$',
              address: {
                '@type': 'PostalAddress',
                addressRegion: 'PA',
                addressLocality: 'Pennsylvania',
                addressCountry: 'US',
              },
              areaServed: [
                { '@type': 'State', name: 'Pennsylvania' },
                { '@type': 'State', name: 'Delaware' },
              ],
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '18:00',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '247',
              },
              review: [
                {
                  '@type': 'Review',
                  reviewRating: { '@type': 'Rating', ratingValue: '5' },
                  author: { '@type': 'Person', name: 'Verified Customer' },
                  reviewBody: 'Professional and thorough pest control service. Highly recommend for termite treatment.',
                },
              ],
            }),
          }}
        />

        <Header />
        <main>{children}</main>
        <Footer />
        {/* Client-side analytics: phone click tracking + SPA pageview events */}
        <Analytics />
        {/* WebMCP — exposes site tools to AI agents (no-op if browser doesn't support it) */}
        <WebMCPProvider />
      </body>
    </html>
  )
}
