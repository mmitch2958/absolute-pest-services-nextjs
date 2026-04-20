import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/analytics/Analytics'
import WebMCPProvider from '@/components/agent/WebMCPProvider'

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
        {/* Google Tag Manager (GTM-K3VG6J2W) — must load as high in <head> as possible */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-K3VG6J2W');`,
          }}
        />
        {/* Google Tag Manager / GA4 + Google Ads — fires on every page */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-1038095551"
        />
        <script
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
        {/* Performance preconnects */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://challenges.cloudflare.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) — must be immediately after opening <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K3VG6J2W"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
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
