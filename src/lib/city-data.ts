// src/lib/city-data.ts
// City and service data for static generation of 85+ location pages

export interface CityData {
  slug: string          // 'west-chester-pa'
  name: string          // 'West Chester'
  state: 'PA' | 'DE'
  county?: string       // 'Chester County'
  cityServiceSlug: string  // for city-services URLs (e.g. 'avondale-pa')
}

export interface ServiceData {
  slug: string          // 'pest-control'
  name: string          // 'Pest Control'
  title: string         // 'Professional Pest Control'
  shortDesc: string     // For meta descriptions
  longDesc: string      // For page content
  h1Template: string    // Template with {city} {state} placeholders
  faqs: Array<{ q: string; a: string }>
}

// 21 PA cities (service-areas pages)
export const PA_CITIES: CityData[] = [
  { slug: 'west-chester-pa', name: 'West Chester', state: 'PA', county: 'Chester County', cityServiceSlug: 'west-chester-pa' },
  { slug: 'exton-pa', name: 'Exton', state: 'PA', county: 'Chester County', cityServiceSlug: 'exton-pa' },
  { slug: 'malvern-pa', name: 'Malvern', state: 'PA', county: 'Chester County', cityServiceSlug: 'malvern-pa' },
  { slug: 'downingtown-pa', name: 'Downingtown', state: 'PA', county: 'Chester County', cityServiceSlug: 'downingtown-pa' },
  { slug: 'norristown-pa', name: 'Norristown', state: 'PA', county: 'Montgomery County', cityServiceSlug: 'norristown-pa' },
  { slug: 'king-of-prussia-pa', name: 'King of Prussia', state: 'PA', county: 'Montgomery County', cityServiceSlug: 'king-of-prussia-pa' },
  { slug: 'collegeville-pa', name: 'Collegeville', state: 'PA', county: 'Montgomery County', cityServiceSlug: 'collegeville-pa' },
  { slug: 'pottstown-pa', name: 'Pottstown', state: 'PA', county: 'Montgomery County', cityServiceSlug: 'pottstown-pa' },
  { slug: 'chester-county-pa', name: 'Chester County', state: 'PA', county: 'Chester County', cityServiceSlug: 'chester-county-pa' },
  { slug: 'delaware-county-pa', name: 'Delaware County', state: 'PA', county: 'Delaware County', cityServiceSlug: 'delaware-county-pa' },
  { slug: 'montgomery-county-pa', name: 'Montgomery County', state: 'PA', county: 'Montgomery County', cityServiceSlug: 'montgomery-county-pa' },
  { slug: 'coatesville-pa', name: 'Coatesville', state: 'PA', county: 'Chester County', cityServiceSlug: 'coatesville-pa' },
  { slug: 'cochranville-pa', name: 'Cochranville', state: 'PA', county: 'Chester County', cityServiceSlug: 'cochranville-pa' },
  { slug: 'kennett-square-pa', name: 'Kennett Square', state: 'PA', county: 'Chester County', cityServiceSlug: 'kennett-square-pa' },
  { slug: 'avondale-pa', name: 'Avondale', state: 'PA', county: 'Chester County', cityServiceSlug: 'avondale-pa' },
  { slug: 'west-grove-pa', name: 'West Grove', state: 'PA', county: 'Chester County', cityServiceSlug: 'west-grove-pa' },
  { slug: 'oxford-pa', name: 'Oxford', state: 'PA', county: 'Chester County', cityServiceSlug: 'oxford-pa' },
  { slug: 'lincoln-university-pa', name: 'Lincoln University', state: 'PA', county: 'Chester County', cityServiceSlug: 'lincoln-university-pa' },
  { slug: 'landenberg-pa', name: 'Landenberg', state: 'PA', county: 'Chester County', cityServiceSlug: 'landenberg-pa' },
  { slug: 'chadds-ford-pa', name: 'Chadds Ford', state: 'PA', county: 'Delaware County', cityServiceSlug: 'chadds-ford-pa' },
  { slug: 'glen-mills-pa', name: 'Glen Mills', state: 'PA', county: 'Delaware County', cityServiceSlug: 'glen-mills-pa' },
]

// 4 DE cities (service-areas pages)
export const DE_CITIES: CityData[] = [
  { slug: 'wilmington-de', name: 'Wilmington', state: 'DE', county: 'New Castle County', cityServiceSlug: 'wilmington-de' },
  { slug: 'newark-de', name: 'Newark', state: 'DE', county: 'New Castle County', cityServiceSlug: 'newark-de' },
  { slug: 'hockessin-de', name: 'Hockessin', state: 'DE', county: 'New Castle County', cityServiceSlug: 'hockessin-de' },
  { slug: 'new-castle-county-de', name: 'New Castle County', state: 'DE', county: 'New Castle County', cityServiceSlug: 'new-castle-county-de' },
]

export const ALL_CITIES: CityData[] = [...PA_CITIES, ...DE_CITIES]

// 15 cities used specifically for city×service pages (60 total)
export const CITY_SERVICE_CITIES: CityData[] = [
  { slug: 'avondale-pa', name: 'Avondale', state: 'PA', county: 'Chester County', cityServiceSlug: 'avondale-pa' },
  { slug: 'chadds-ford-pa', name: 'Chadds Ford', state: 'PA', county: 'Delaware County', cityServiceSlug: 'chadds-ford-pa' },
  { slug: 'coatesville-pa', name: 'Coatesville', state: 'PA', county: 'Chester County', cityServiceSlug: 'coatesville-pa' },
  { slug: 'cochranville-pa', name: 'Cochranville', state: 'PA', county: 'Chester County', cityServiceSlug: 'cochranville-pa' },
  { slug: 'downingtown-pa', name: 'Downingtown', state: 'PA', county: 'Chester County', cityServiceSlug: 'downingtown-pa' },
  { slug: 'exton-pa', name: 'Exton', state: 'PA', county: 'Chester County', cityServiceSlug: 'exton-pa' },
  { slug: 'glen-mills-pa', name: 'Glen Mills', state: 'PA', county: 'Delaware County', cityServiceSlug: 'glen-mills-pa' },
  { slug: 'hockessin-de', name: 'Hockessin', state: 'DE', county: 'New Castle County', cityServiceSlug: 'hockessin-de' },
  { slug: 'kennett-square-pa', name: 'Kennett Square', state: 'PA', county: 'Chester County', cityServiceSlug: 'kennett-square-pa' },
  { slug: 'landenberg-pa', name: 'Landenberg', state: 'PA', county: 'Chester County', cityServiceSlug: 'landenberg-pa' },
  { slug: 'lincoln-university-pa', name: 'Lincoln University', state: 'PA', county: 'Chester County', cityServiceSlug: 'lincoln-university-pa' },
  { slug: 'newark-de', name: 'Newark', state: 'DE', county: 'New Castle County', cityServiceSlug: 'newark-de' },
  { slug: 'oxford-pa', name: 'Oxford', state: 'PA', county: 'Chester County', cityServiceSlug: 'oxford-pa' },
  { slug: 'west-grove-pa', name: 'West Grove', state: 'PA', county: 'Chester County', cityServiceSlug: 'west-grove-pa' },
  { slug: 'wilmington-de', name: 'Wilmington', state: 'DE', county: 'New Castle County', cityServiceSlug: 'wilmington-de' },
]

// 4 service types for city×service pages
export const CITY_SERVICES: ServiceData[] = [
  {
    slug: 'pest-control',
    name: 'Pest Control',
    title: 'Professional Pest Control',
    shortDesc: 'Comprehensive pest control services for homes and businesses. Licensed & insured. Same-day service available.',
    longDesc: 'From ants and cockroaches to mosquitoes and spiders, our licensed pest control technicians eliminate infestations and prevent them from coming back. We use family-safe, effective treatments tailored to your property.',
    h1Template: 'Pest Control in {city}, {state}',
    faqs: [
      {
        q: 'How quickly can you respond to a pest problem?',
        a: 'We offer same-day and next-day service in most cases. Call 484-643-2225 and we\'ll get a technician to you as fast as possible.',
      },
      {
        q: 'Are your treatments safe for children and pets?',
        a: 'Yes. We use targeted, family-safe treatment methods. Our technicians will advise you on any precautions specific to your treatment.',
      },
      {
        q: 'Do you offer a service guarantee?',
        a: 'Absolutely. If pests return between scheduled services, we return at no additional charge.',
      },
    ],
  },
  {
    slug: 'ant-wasp-control',
    name: 'Ant & Wasp Control',
    title: 'Ant & Wasp Control',
    shortDesc: 'Expert ant and wasp elimination and prevention for PA & DE homes. Fast, effective, family-safe.',
    longDesc: 'Ants and wasps are two of the most common warm-weather pest problems in southeastern Pennsylvania and Delaware. Whether it\'s odorous house ants invading your kitchen, carpenter ants damaging your home\'s structure, or a wasp nest near your entrance, we handle it all.',
    h1Template: 'Ant & Wasp Control in {city}, {state}',
    faqs: [
      {
        q: 'What types of ants do you treat?',
        a: 'We treat all common ant species including odorous house ants, carpenter ants, pavement ants, and fire ants.',
      },
      {
        q: 'Is wasp removal dangerous?',
        a: 'It can be if done improperly. Our technicians have the proper protective equipment and insecticides to remove nests safely.',
      },
      {
        q: 'When is the best time to treat for ants?',
        a: 'Year-round treatment is most effective, but spring and summer are peak seasons when ant colonies are most active.',
      },
    ],
  },
  {
    slug: 'termite-control',
    name: 'Termite Control',
    title: 'Termite Control & Prevention',
    shortDesc: 'Protect your home from termite damage. Expert inspection, treatment & prevention in PA & DE. Call 484-643-2225.',
    longDesc: 'Termites cause billions of dollars in property damage annually across the US. In Pennsylvania and Delaware, subterranean termites are the primary threat, silently destroying structural wood from the inside out. Our termite control program combines thorough inspection, targeted treatment, and ongoing monitoring to protect your investment.',
    h1Template: 'Termite Control in {city}, {state}',
    faqs: [
      {
        q: 'How do I know if I have termites?',
        a: 'Signs include mud tubes on foundation walls, hollow-sounding wood, discarded wings, and visible damage to wood structures. Schedule a free quote if you suspect termites.',
      },
      {
        q: 'What termite treatment methods do you use?',
        a: 'We offer liquid barrier treatments (Termidor), bait station systems, and wood treatments depending on the infestation type and your property.',
      },
      {
        q: 'How long does termite treatment last?',
        a: 'Liquid treatments typically last 5+ years. Bait station systems provide ongoing monitoring and control with annual service visits.',
      },
    ],
  },
  {
    slug: 'wildlife-control',
    name: 'Wildlife Control',
    title: 'Humane Wildlife Control',
    shortDesc: 'Safe, humane removal of wildlife from PA & DE homes. Raccoons, squirrels, bats, groundhogs & more. Licensed.',
    longDesc: 'Pennsylvania and Delaware are home to abundant wildlife, and our wooded neighborhoods create prime habitat. When raccoons, squirrels, groundhogs, or other animals invade your home or property, we provide humane, effective removal and exclusion — keeping animals out for good.',
    h1Template: 'Wildlife Control in {city}, {state}',
    faqs: [
      {
        q: 'What wildlife species do you handle?',
        a: 'Raccoons, squirrels, groundhogs, opossums, skunks, foxes, deer, and more. We\'re also licensed for bat exclusion.',
      },
      {
        q: 'Do you use humane methods?',
        a: 'Yes, we prioritize live trapping and exclusion over extermination wherever possible and legal.',
      },
      {
        q: 'Can you fix the entry points after removal?',
        a: 'Absolutely — exclusion and repair is a core part of our wildlife control service. We seal entry points to prevent re-entry.',
      },
    ],
  },
]

// Lando's detailed city content for 6 cities × 4 services
// Content from /artifacts/city-content/ markdown files
export const DETAILED_CITY_CONTENT: Record<string, Record<string, string>> = {
  'avondale-pa': {
    'pest-control': `Avondale, Pennsylvania is the mushroom farming capital of Chester County — a small borough of just 0.5 square miles on the East Branch White Clay Creek where To-Jo Mushrooms, Basciani Foods, and Buona Foods are all based, and where the Mushroom Farmers of Pennsylvania maintain their headquarters. This agricultural heritage is central to Avondale's identity, but the warm, humid conditions that make mushroom cultivation successful also create ideal environments for certain pests to flourish in nearby homes and properties.

At Absolute Pest Services, we know Avondale and the surrounding Chester County communities intimately. Our team has been serving local families and businesses, and we understand the specific pest patterns that affect properties here — from homes near the mushroom houses along the creek to properties on the outskirts of this tight-knit farming community.

**Common Pest Problems in Avondale**

Mosquitoes are one of the top concerns for Avondale homeowners, especially from May through September. The East Branch White Clay Creek, combined with the irrigation systems and moisture surrounding the mushroom growing operations, creates persistent standing water that mosquitoes use for breeding. Odorous house ants are another frequent problem — the humid microclimate near the creek and agricultural operations drives these moisture-seeking ants indoors in large numbers, often following plumbing lines into kitchens and bathrooms.`,
    'ant-wasp-control': `Avondale's agricultural setting and humid microclimate make it prime territory for ant and wasp activity. The East Branch White Clay Creek corridor and surrounding mushroom farming operations create exactly the moist, organic-rich conditions that odorous house ants, carpenter ants, and yellowjackets love.

Odorous house ants are the number-one ant complaint from Avondale homeowners — these moisture-seeking insects follow plumbing lines into kitchens and bathrooms, establishing satellite colonies inside walls. Carpenter ants are a more serious concern, as the older homes in the area often have moisture damage that makes ideal nesting habitat.

Yellowjackets and paper wasps are seasonal problems from late summer through fall, when colonies reach peak size and become aggressive around outdoor dining areas and garbage.`,
    'termite-control': `Termites are an active threat throughout Chester County, and Avondale properties are no exception. The combination of older housing stock, moisture from the East Branch White Clay Creek, and the organic-rich soils near the mushroom farming operations creates conditions that favor subterranean termite activity.

Subterranean termites are the dominant species in Avondale and the surrounding Chester County area. They build their colonies underground and travel through mud tubes to reach the wood in your home's foundation, floor joists, and wall framing. Because they work inside wood and underground, termite damage often goes undetected for years — until it becomes structurally significant and expensive.

Absolute Pest Services offers comprehensive termite inspection, treatment, and monitoring for Avondale homeowners. Our free termite inspections identify current activity, mud tubes, and conditions conducive to future infestations.`,
    'wildlife-control': `Avondale sits at the edge of active agricultural and creek-side habitat, making wildlife encounters a regular occurrence for local homeowners. The East Branch White Clay Creek provides a natural wildlife corridor that brings raccoons, opossums, groundhogs, and other animals into Avondale neighborhoods.

Groundhogs are particularly common on properties bordering the agricultural fields and open areas around the mushroom farming operations. They burrow under foundations, deck supports, and outbuildings, creating structural risks over time. Raccoons, drawn by the creek habitat and food sources near the farming operations, frequently den in attics and chimneys in spring.

Absolute Pest Services handles all common wildlife species in Avondale using humane live trapping and exclusion methods. We're fully licensed for wildlife removal in Pennsylvania.`,
  },
  'west-grove-pa': {
    'wildlife-control': `West Grove, Pennsylvania is nestled in the heart of southern Chester County's Brandywine Valley, surrounded by rolling wooded hillsides and the lush landscapes near Longwood Gardens and White Clay Creek State Park. As the home base of Absolute Pest Services, West Grove holds a special place for us — we know these properties, these woods, and the wildlife that calls them home. With so many lots bordering dense natural areas, it's no surprise that West Grove homeowners regularly deal with wildlife intruding on their properties — and sometimes right into their homes.

**Common Wildlife Problems in West Grove**

The wooded hillsides that make West Grove so beautiful also create perfect habitat for a variety of wildlife. Properties along the edges of White Clay Creek State Park and the Brandywine Valley forests frequently attract white-tailed deer, red foxes, and gray squirrels. We get regular calls about squirrels chewing through soffits and nesting in attics — the older homes common in West Grove often have gaps that squirrels exploit with ease.

Groundhogs are another persistent problem, burrowing under foundations and deck supports in the open meadow areas that dot the landscape. Their tunnels can compromise structural integrity over time. Raccoons, drawn by the abundant creek-side habitat, are notorious for forcing their way into chimneys and attic spaces, especially in spring when mothers are seeking den sites for their kits.`,
  },
}

// Helper: get city data by slug
export function getCityBySlug(slug: string): CityData | undefined {
  return ALL_CITIES.find((c) => c.slug === slug)
}

// Helper: get city from city-services cities by slug
export function getCityServiceCityBySlug(slug: string): CityData | undefined {
  return CITY_SERVICE_CITIES.find((c) => c.cityServiceSlug === slug)
}

// Helper: get service by slug
export function getServiceBySlug(slug: string): ServiceData | undefined {
  return CITY_SERVICES.find((s) => s.slug === slug)
}

// Helper: parse city-services URL slug like 'pest-control-avondale-pa'
// Returns the service and city data
export function parseCityServiceSlug(fullSlug: string): {
  service: ServiceData | undefined
  city: CityData | undefined
  citySlug: string
} {
  // Try each service slug prefix
  for (const service of CITY_SERVICES) {
    const prefix = service.slug + '-'
    if (fullSlug.startsWith(prefix)) {
      const citySlug = fullSlug.slice(prefix.length)
      const city = CITY_SERVICE_CITIES.find((c) => c.cityServiceSlug === citySlug)
      return { service, city, citySlug }
    }
  }
  return { service: undefined, city: undefined, citySlug: fullSlug }
}

// Generate all 60 city×service slugs
export function generateAllCityServiceSlugs(): string[] {
  const slugs: string[] = []
  for (const service of CITY_SERVICES) {
    for (const city of CITY_SERVICE_CITIES) {
      slugs.push(`${service.slug}-${city.cityServiceSlug}`)
    }
  }
  return slugs
}
