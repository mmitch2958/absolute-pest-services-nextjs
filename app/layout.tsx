import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/analytics/Analytics'
import WebMCPProvider from '@/components/agent/WebMCPProvider'
import StickyServiceCTA from '@/components/layout/StickyServiceCTA'
import {
  BUSINESS_NAME,
  businessSchema,
  websiteSchema,
} from '@/lib/business-profile'

const GTM_ID = 'GTM-K3VG6J2W'
const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}
export const metadata: Metadata = {
  metadataBase: new URL('https://absolutepestservices.com'),
  title: {
    default:
      'Pest Control in Chester County PA & Northern Delaware | Absolute Pest Services',
    template: `%s | ${BUSINESS_NAME}`,
  },
  description:
    'Local extermination, termite treatment, bed bug treatment, rodent control, and humane wildlife removal in Chester County, PA and northern Delaware. Call 484-643-2225.',
  alternates: {
    types: {
      'text/plain': '/llms.txt',
    },
  },
  openGraph: {
    type: 'website',
    siteName: BUSINESS_NAME,
    title: 'Pest Control in Chester County PA & Northern Delaware',
    description:
      'Local pest control and humane wildlife removal for Chester County, PA and northern Delaware.',
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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="ard" href="/.well-known/ard.json" type="application/json" />
        <link
          rel="ai-catalog"
          href="/.well-known/ai-catalog.json"
          type="application/json"
        />
      </head>
      <body className={inter.className}>
        <script
          id="gtm-init"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />

        <script
          id="gtag-loader"
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-1038095551"
        />
        <script
          id="gtag-init"
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

        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {/* Keep one authoritative entity to avoid conflicting contact,
            service-area, hours, and review claims. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([businessSchema, websiteSchema]).replace(
              /</g,
              '\\u003c'
            ),
          }}
        />

        <Header />
        <main>{children}</main>
        <Footer />
        <StickyServiceCTA />
        <Analytics />
        <WebMCPProvider />
      </body>
    </html>
  )
}
