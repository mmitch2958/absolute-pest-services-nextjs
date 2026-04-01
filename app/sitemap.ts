import { MetadataRoute } from 'next'
import { ALL_CITIES, CITY_SERVICES, CITY_SERVICE_CITIES } from '@/lib/city-data'
import { ALL_SERVICE_AREA_SLUGS } from '@/lib/service-areas-data'

const BASE_URL = 'https://absolutepestservices.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
    { path: '/wildlife-control', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/bed-bug-treatment', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/termite-treatment', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/bat-removal', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/wasp-removal', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/bed-bugs', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/termites', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/wildlife', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/rodents', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/service-areas', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/request-service', priority: 0.8, changeFrequency: 'monthly' as const },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date('2026-03-25'),
    changeFrequency,
    priority,
  }))

  const cityPages = ALL_CITIES.map((city) => ({
    url: `${BASE_URL}/service-areas/${city.slug}`,
    lastModified: new Date('2026-03-25'),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Additional service area pages not in ALL_CITIES (county-level + MD cities)
  const newServiceAreaSlugs = ALL_SERVICE_AREA_SLUGS.filter(
    (slug) => !ALL_CITIES.some((c) => c.slug === slug)
  )
  const newServiceAreaPages = newServiceAreaSlugs.map((slug) => ({
    url: `${BASE_URL}/service-areas/${slug}`,
    lastModified: new Date('2026-03-28'),
    changeFrequency: 'weekly' as const,
    priority: slug.includes('county') ? 0.85 : 0.75,
  }))

  const cityServicePages = CITY_SERVICES.flatMap((service) =>
    CITY_SERVICE_CITIES.map((city) => ({
      url: `${BASE_URL}/city-services/${service.slug}-${city.cityServiceSlug}`,
      lastModified: new Date('2026-03-25'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  // New [service]/[city] URLs (Google Ads landing pages)
  const cityServiceSplitPages = CITY_SERVICES.flatMap((service) =>
    CITY_SERVICE_CITIES.map((city) => ({
      url: `${BASE_URL}/${service.slug}/${city.slug}`,
      lastModified: new Date('2026-03-28'),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }))
  )

  return [...corePages, ...cityPages, ...newServiceAreaPages, ...cityServicePages, ...cityServiceSplitPages]
}
