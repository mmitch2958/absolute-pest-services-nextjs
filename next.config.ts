import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Allow the Replit workspace preview iframe to load dev resources (HMR, etc.).
  // Without this, Next.js 16 blocks /_next/* requests from the *.replit.dev host
  // and the page fails to fully hydrate inside the canvas iframe — buttons render
  // but click handlers never attach.
  allowedDevOrigins: ['*.replit.dev', '*.kirk.replit.dev', '*.repl.co'],

  // turbopack: {} is required in Next.js 16 alongside any webpack config; prevents
  // the "webpack config and no turbopack config" build-time error.
  // Actual bundler for this Replit environment is forced to webpack via IS_WEBPACK_TEST
  // env var (set in Replit shared secrets) because native SWC binaries are unavailable.
  turbopack: {},

  // The Next.js 16 WASM-based TypeScript checker worker crashes on Replit's NixOS
  // environment (Rust deserialization error: "unit value, expected usize").
  // TypeScript validation is done separately via `npx tsc --noEmit` in CI.
  typescript: { ignoreBuildErrors: true },

  // Disable URL processing in css-loader so Tailwind v4 generated url(...) utilities
  // are not treated as module imports by webpack (used in --webpack dev/build mode).
  webpack(config: Configuration) {
    // Tell webpack's file watcher to ignore directories that Replit's own
    // infrastructure writes into constantly (agent state DB, log DB, workflow
    // shell-output files, etc.). Without this, every state write triggers a
    // fake HMR rebuild, putting dev mode into a 200ms recompile loop.
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.git/**',
        '**/.local/**',
        '**/.cache/**',
        '**/attached_assets/**',
        '**/.upm/**',
        '**/.config/**',
      ],
    }

    const rules = config.module?.rules ?? []
    for (const rule of rules) {
      if (typeof rule !== 'object' || rule === null || !('oneOf' in rule)) continue
      const oneOf = (rule as { oneOf: unknown[] }).oneOf
      if (!Array.isArray(oneOf)) continue
      for (const entry of oneOf) {
        if (typeof entry !== 'object' || entry === null || !('use' in entry)) continue
        const uses = (entry as { use: unknown }).use
        const useList = Array.isArray(uses) ? uses : [uses]
        for (const use of useList) {
          if (
            typeof use === 'object' && use !== null &&
            'loader' in use && typeof (use as { loader: unknown }).loader === 'string' &&
            (use as { loader: string }).loader.includes('css-loader') &&
            'options' in use && typeof (use as { options: unknown }).options === 'object' &&
            (use as { options: unknown }).options !== null
          ) {
            ;(use as { options: { url: boolean } }).options.url = false
          }
        }
      }
    }
    return config
  },

  // Image optimization — allow any external https images (blog uses AI-generated images
  // from various providers: DALL-E, FLUX, Gemini, Cloudinary, Unsplash, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security and caching headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // RFC 8288 Link headers — agent discovery on the homepage and key pages
        source: '/((?!_next/|api/|admin/|field/).*)',
        headers: [
          {
            key: 'Link',
            value: [
              '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
              '</.well-known/agent-skills/index.json>; rel="https://agentskills.io/rels/index"; type="application/json"',
              '</openapi.json>; rel="service-desc"; type="application/json"',
              '</api/health>; rel="status"',
              '</sitemap.xml>; rel="sitemap"; type="application/xml"',
            ].join(', '),
          },
        ],
      },
      // Only apply long-lived caching to /_next/static in production. In dev mode this
      // breaks Next.js HMR (the immutable header causes the client to cache the HMR
      // manifest, which puts dev into a rebuild loop — Next itself warns about this).
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/_next/static/:path*',
              headers: [
                { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
              ],
            },
          ]
        : []),
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ]
  },

  // Redirect www to non-www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.absolutepestservices.com' }],
        destination: 'https://absolutepestservices.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
