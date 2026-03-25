import { MetadataRoute } from 'next'
import { ALL_CITIES, CITY_SERVICES, CITY_SERVICE_CITIES } from '@/lib/city-data'

const BASE_URL = 'https://absolutepestservices.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages = [
    { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/wildlife-control', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/bed-bug-treatment', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/termite-treatment', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/bat-removal', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/bed-bugs', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/termites', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/wildlife', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/rodents', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/service-areas', priority: 0.9, changeFrequency: 'monthly' as const },
    { path: '/blog', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/request-service', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/cost-calculator', priority: 0.7, changeFrequency: 'monthly' as const },
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

  const cityServicePages = CITY_SERVICES.flatMap((service) =>
    CITY_SERVICE_CITIES.map((city) => ({
      url: `${BASE_URL}/city-services/${service.slug}-${city.cityServiceSlug}`,
      lastModified: new Date('2026-03-25'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  )

  return [...corePages, ...cityPages, ...cityServicePages]
}
