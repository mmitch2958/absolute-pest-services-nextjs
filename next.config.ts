import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
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
