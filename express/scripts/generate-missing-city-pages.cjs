#!/usr/bin/env node
/**
 * Generates missing city-level overview pages for service-areas/
 * Cities that don't yet exist as pages
 */
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..', 'client', 'src', 'pages', 'service-areas');

const MISSING_CITIES = [
  {
    name: 'Coatesville',
    state: 'PA',
    slug: 'coatesville-pa',
    componentName: 'CoatesvillePA',
    county: 'Chester County',
    blurb: 'Coatesville\'s historic neighborhoods and industrial heritage mean older building stock that is particularly vulnerable to rodent infiltration, termite damage, and wildlife intrusion.',
    neighborhoods: ['Coatesville City', 'Valley Township', 'Caln Township', 'South Coatesville', 'West Caln Township', 'Modena'],
    faqs: [
      { q: 'Do older Coatesville homes need termite inspections?', a: 'Yes. Many Coatesville properties have older foundations and aged framing highly susceptible to subterranean termites. A free inspection will reveal any current activity.' },
      { q: 'Are rodents a common problem in Coatesville?', a: 'Coatesville\'s mix of older commercial and residential buildings creates numerous entry points for mice and rats. We provide thorough exclusion alongside population control.' },
      { q: 'How quickly can you respond to wildlife calls in Coatesville?', a: 'Most wildlife calls in Coatesville receive same-day or next-day service. Emergency situations are handled around the clock.' },
      { q: 'Do you handle stink bug prevention in Coatesville?', a: 'Yes. We offer fall exterior barrier treatments that significantly reduce stink bug intrusion across Coatesville homes.' },
    ],
  },
  {
    name: 'Cochranville',
    state: 'PA',
    slug: 'cochranville-pa',
    componentName: 'CochranvillePA',
    county: 'Chester County',
    blurb: 'Rural Cochranville\'s agricultural landscape and wooded properties create prime habitat for wildlife, rodents, and structural pests seeking shelter in nearby homes.',
    neighborhoods: ['Cochranville', 'Parkesburg', 'Highland Township', 'West Fallowfield Township', 'Atglen', 'Christiana'],
    faqs: [
      { q: 'What pests are most common on Cochranville farmland properties?', a: 'Mice, groundhogs, raccoons, and deer are the top wildlife calls. Agricultural land creates an abundance of harborage and food sources that push pests toward homes.' },
      { q: 'Are termites a risk in rural Cochranville?', a: 'Absolutely. Moist agricultural soils are ideal for subterranean termites. Older farm structures and wood debris near homes increase risk.' },
      { q: 'Can you help with groundhog burrows damaging my Cochranville property?', a: 'Yes. Groundhog burrows cause serious structural and landscape damage. We provide live trapping and permanent exclusion solutions.' },
      { q: 'Do you service Atglen and Parkesburg near Cochranville?', a: 'Yes — Atglen, Parkesburg, and the broader western Chester County area are within our service territory.' },
    ],
  },
  {
    name: 'Kennett Square',
    state: 'PA',
    slug: 'kennett-square-pa',
    componentName: 'KennettSquarePA',
    county: 'Chester County',
    blurb: 'Known as the Mushroom Capital of the World, Kennett Square\'s mushroom farms and rich agricultural soil create elevated moisture and pest pressure in surrounding homes.',
    neighborhoods: ['Kennett Square Borough', 'Kennett Township', 'East Marlborough Township', 'Toughkenamon', 'Willowdale', 'Landenberg'],
    faqs: [
      { q: 'Do mushroom farm operations near Kennett Square attract more pests?', a: 'Yes. The moisture-rich mushroom farming environment attracts flies, rodents, and soil-dwelling pests. Homes near farming operations often see elevated pressure.' },
      { q: 'Are termites common in Kennett Square?', a: 'Yes. The moist, organic-rich soils throughout Kennett Township are ideal for subterranean termite colonies. Annual inspections are strongly recommended.' },
      { q: 'What wildlife issues do Kennett Square homeowners face?', a: 'Raccoons, groundhogs, foxes, and deer are common callers. Rural edges of Kennett Township see the most wildlife activity.' },
      { q: 'Do you serve properties near the Delaware border in Kennett Square?', a: 'Yes. We serve southern Chester County including properties near the PA-DE border in and around Kennett Square.' },
    ],
  },
  {
    name: 'Avondale',
    state: 'PA',
    slug: 'avondale-pa',
    componentName: 'AvondalePA',
    county: 'Chester County',
    blurb: 'Avondale\'s proximity to Brandywine Creek State Park (DE) and the agricultural zones of southern Chester County make it a hot zone for wildlife and seasonal pest activity.',
    neighborhoods: ['Avondale Borough', 'New Garden Township', 'London Grove Township', 'Penn Township', 'Kemblesville', 'West Grove area'],
    faqs: [
      { q: 'Why does Avondale see so much wildlife activity?', a: 'Avondale borders the Brandywine Creek corridor and extensive agricultural land in New Garden Township, creating ideal wildlife movement routes into neighborhoods.' },
      { q: 'Are bed bugs a problem in Avondale hotels or multi-family units?', a: 'Yes. We treat multi-unit residential properties and commercial accounts throughout the Avondale area. Discreet service is available.' },
      { q: 'Do you offer termite protection for new construction in Avondale?', a: 'Yes. We provide pre-construction soil treatments and post-construction inspection programs for Avondale\'s newer developments.' },
      { q: 'Can you help with stinging insects (bees, wasps) in Avondale?', a: 'Yes. Yellow jackets, ground bees, and paper wasps are common spring/summer calls throughout Avondale and New Garden Township.' },
    ],
  },
  {
    name: 'West Grove',
    state: 'PA',
    slug: 'west-grove-pa',
    componentName: 'WestGrovePA',
    county: 'Chester County',
    blurb: 'Home to Absolute Pest Services\' main office, West Grove is at the heart of our service territory. We know every neighborhood, road, and pest pattern in this community.',
    neighborhoods: ['West Grove Borough', 'Penn Township', 'London Grove Township', 'New London Township', 'Kemblesville', 'Grove Park'],
    faqs: [
      { q: 'What are the most common pest calls in West Grove?', a: 'Mice, stink bugs, carpenter ants, and wildlife (raccoons, groundhogs) are our most frequent calls in West Grove and Penn Township.' },
      { q: 'Do you offer termite inspections in West Grove?', a: 'Yes — West Grove is our home base. We can often schedule same-day or next-day termite inspections for local homeowners.' },
      { q: 'Are you familiar with older West Grove Borough homes?', a: 'Absolutely. We\'ve serviced West Grove homes of all ages. Older borough properties frequently have gaps that allow pests in — we specialize in finding and sealing them.' },
      { q: 'How quickly can you respond to pest emergencies in West Grove?', a: 'As our home community, West Grove gets the fastest response times of anywhere in our service area. Call 484-643-2225 anytime.' },
    ],
  },
  {
    name: 'Oxford',
    state: 'PA',
    slug: 'oxford-pa',
    componentName: 'OxfordPA',
    county: 'Chester County',
    blurb: 'Southern Chester County\'s Oxford area blends rural farmland with growing residential developments, creating ideal conditions for termites, rodents, and wildlife to thrive.',
    neighborhoods: ['Oxford Borough', 'East Nottingham Township', 'West Nottingham Township', 'Lower Oxford Township', 'Elk Township', 'Lincoln University'],
    faqs: [
      { q: 'What pests are most common in Oxford, PA?', a: 'Mice, groundhogs, raccoons, and termites are the top calls in Oxford. The surrounding farmland and woodland push wildlife toward residential areas, especially in fall.' },
      { q: 'Are stink bugs a major problem in Oxford?', a: 'Yes. Chester County is stink bug territory — exterior barrier treatments applied in late summer dramatically reduce fall intrusions.' },
      { q: 'Do you serve the rural routes around Oxford Borough?', a: 'Yes. We serve Oxford Borough and all surrounding townships including East and West Nottingham, Lower Oxford, and Elk Township.' },
      { q: 'How do I stop mice from entering my Oxford home?', a: 'Exclusion is the key. We inspect your home for every gap larger than a dime, seal them with durable materials, and eliminate any existing population before sealing.' },
    ],
  },
  {
    name: 'Lincoln University',
    state: 'PA',
    slug: 'lincoln-university-pa',
    componentName: 'LincolnUniversityPA',
    county: 'Chester County',
    blurb: 'Lincoln University\'s historic campus and surrounding rural properties in southern Chester County experience significant wildlife and rodent pressure from adjacent wooded areas.',
    neighborhoods: ['Lincoln University', 'Elk Township', 'Lower Oxford Township', 'Franklin Township', 'Nottingham', 'New London Township'],
    faqs: [
      { q: 'Does Lincoln University\'s wooded campus attract more wildlife?', a: 'Yes. Wooded campus environments are ideal habitat for raccoons, squirrels, foxes, and groundhogs. Surrounding residential properties often experience spillover.' },
      { q: 'Are termites a risk in Lincoln University area properties?', a: 'Yes. The heavy woodland and organic soil conditions in Elk Township and surrounding areas are prime subterranean termite habitat.' },
      { q: 'Do you serve student housing or multi-family properties near Lincoln University?', a: 'Yes. We serve multi-unit residential properties and can provide bed bug, rodent, and general pest programs for rental properties near the university.' },
      { q: 'How far south in Chester County do you service?', a: 'We serve all of Chester County including the southernmost communities near the Maryland and Delaware borders.' },
    ],
  },
  {
    name: 'Landenberg',
    state: 'PA',
    slug: 'landenberg-pa',
    componentName: 'LandenbergPA',
    county: 'Chester County',
    blurb: 'Landenberg\'s scenic position along the White Clay Creek watershed and proximity to Delaware state parks creates a wildlife-rich environment with elevated pest pressure.',
    neighborhoods: ['Landenberg', 'New Garden Township', 'Penn Township', 'White Clay Creek Preserve area', 'Kemblesville', 'Avondale vicinity'],
    faqs: [
      { q: 'Why is Landenberg such a hotspot for wildlife calls?', a: 'The White Clay Creek Preserve and surrounding conserved lands create a wildlife corridor right through Landenberg neighborhoods. We see elevated raccoon, fox, and groundhog activity.' },
      { q: 'Are termites common near White Clay Creek?', a: 'Yes. The moist, wooded soils along White Clay Creek are perfect subterranean termite habitat. We recommend annual inspections for all Landenberg homeowners.' },
      { q: 'Do you handle bat exclusion in Landenberg?', a: 'Yes. Bats frequently colonize older homes in rural Chester County. We perform humane, licensed exclusions compliant with PA bat protection laws.' },
      { q: 'What about deer tick and pest prevention in Landenberg?', a: 'We offer perimeter tick control programs that reduce tick populations in your yard — especially important near the heavily wooded White Clay Creek areas.' },
    ],
  },
  {
    name: 'Chadds Ford',
    state: 'PA',
    slug: 'chadds-ford-pa',
    componentName: 'ChaddsFordPA',
    county: 'Chester County',
    blurb: 'Chadds Ford\'s upscale rural character, historic Brandywine Valley setting, and mature woodlands make it a prime area for wildlife incursions, termite pressure, and seasonal pest activity.',
    neighborhoods: ['Chadds Ford Township', 'Pennsbury Township', 'Pocopson Township', 'Concord Township', 'Brandywine Valley', 'Painters Crossing'],
    faqs: [
      { q: 'Do historic Chadds Ford estates need special pest consideration?', a: 'Yes. Older stone and wood-framed Brandywine Valley estates often have complex construction with many potential entry points. We perform thorough inspections tailored to historic properties.' },
      { q: 'Are deer a vector for tick infestations in Chadds Ford?', a: 'Yes. Chadds Ford\'s open countryside and deer population create high tick pressure. Our yard tick control programs help protect families and pets.' },
      { q: 'How common are termites in the Chadds Ford area?', a: 'Very common. The mature woodland, moist creek-side soils, and older construction all elevate termite risk. Annual inspections are strongly recommended.' },
      { q: 'Do you handle wildlife control near the Brandywine Battlefield?', a: 'Yes. We serve the entire Chadds Ford Township and surrounding Brandywine Valley regardless of proximity to parks or historic sites.' },
    ],
  },
  {
    name: 'Glen Mills',
    state: 'PA',
    slug: 'glen-mills-pa',
    componentName: 'GlenMillsPA',
    county: 'Chester County',
    blurb: 'Glen Mills\' affluent suburban communities border Ridley Creek State Park, creating exceptional wildlife pressure alongside termite and rodent risk from the surrounding forested landscape.',
    neighborhoods: ['Glen Mills', 'Thornbury Township', 'Chester Heights', 'Concord Township', 'Garnet Valley', 'Aston vicinity'],
    faqs: [
      { q: 'Does living near Ridley Creek State Park increase pest risk in Glen Mills?', a: 'Significantly. Ridley Creek State Park is a major wildlife reservoir. Raccoons, squirrels, deer, foxes, and even black bears have been spotted in Glen Mills neighborhoods adjacent to the park.' },
      { q: 'Are termites a problem in Glen Mills new construction?', a: 'Yes. Even newer construction near wooded lots in Thornbury Township and Garnet Valley can have termite pressure from surrounding woodland. Pre-treatment and annual inspections are advised.' },
      { q: 'What should Glen Mills homeowners know about stink bugs?', a: 'Glen Mills is firmly in Chester County stink bug territory. Our fall barrier applications prevent thousands of stink bugs from overwintering in your walls and attic.' },
      { q: 'Do you service the Garnet Valley and Chester Heights areas?', a: 'Yes. Glen Mills, Garnet Valley, Chester Heights, and Thornbury Township are all within our Chester County service area.' },
    ],
  },
];

function generateCityPage(city) {
  const { name, state, slug, componentName, county, blurb, neighborhoods, faqs } = city;
  const stateTag = state;
  const canonicalUrl = `https://absolutepestservices.com/service-areas/${slug}`;
  const pageTitle = `${name} PA Pest Control Services | Absolute Pest Services`;
  const metaDesc = `${name}, ${state} pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving ${county}. Licensed & insured. Call 484-643-2225.`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Absolute Pest Services – ${name}, ${state} Pest Control Services`,
    telephone: '484-643-2225',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '21 Sheffield Dr',
      addressLocality: 'West Grove',
      addressRegion: 'PA',
      postalCode: '19390',
      addressCountry: 'US',
    },
    areaServed: `${name}, ${state}`,
    url: canonicalUrl,
  };

  return `import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleReviewRequest from '@/components/google-review-request';

export default function ${componentName}() {
  const neighborhoods = ${JSON.stringify(neighborhoods)};

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control',
  ];

  const faqs = ${JSON.stringify(faqs)};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>${pageTitle}</title>
        <meta name="description" content="${metaDesc}" />
        <link rel="canonical" href="${canonicalUrl}" />
        <meta property="og:title" content="${pageTitle}" />
        <meta property="og:description" content="${metaDesc}" />
        <meta property="og:url" content="${canonicalUrl}" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(${JSON.stringify(schema)})}</script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            ${name}, ${stateTag} Pest Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            ${blurb}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+14846432225" className="inline-flex items-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 484-643-2225
            </a>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neighborhoods We Serve in ${name}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control throughout the ${name}, ${stateTag} area.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {neighborhoods.map((area, index) => (
              <Card key={index} className="bg-emerald-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{area}</h3>
                  <p className="text-sm text-gray-600 mt-1">${stateTag}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Pest Control Services in ${name}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management solutions for ${name}, ${stateTag} homes and businesses.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link href="/wildlife-control"><Button variant="outline" className="px-6 py-3">Wildlife Control</Button></Link>
              <Link href="/bed-bugs"><Button variant="outline" className="px-6 py-3">Bed Bug Treatment</Button></Link>
              <Link href="/termites"><Button variant="outline" className="px-6 py-3">Termite Treatment</Button></Link>
              <Link href="/bat-removal"><Button variant="outline" className="px-6 py-3">Bat Removal</Button></Link>
              <Link href="/rodents"><Button variant="outline" className="px-6 py-3">Rodent Control</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">${name} Pest Control FAQs</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg p-6 bg-emerald-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-2xl font-bold text-[hsl(132,48%,35%)]">484-643-2225</p>
                <p className="text-gray-600 mt-2">24/7 Emergency Service</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Hours</h3>
                <p className="text-gray-600">Mon–Fri: 8:00 AM – 5:00 PM</p>
                <p className="text-gray-600">Sat: 8:00 AM – 12:00 PM</p>
                <p className="text-gray-600">Sun: Emergency Only</p>
              </CardContent>
            </Card>
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Main Office</h3>
                <p className="text-gray-600">21 Sheffield Dr</p>
                <p className="text-gray-600">West Grove, PA 19390</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleReviewRequest />
      </div>
    </div>
  );
}
`;
}

for (const city of MISSING_CITIES) {
  const filePath = path.join(BASE_DIR, `${city.slug}.tsx`);
  fs.writeFileSync(filePath, generateCityPage(city), 'utf8');
  console.log(`✓ service-areas/${city.slug}.tsx`);
}

console.log(`\n✅ Generated ${MISSING_CITIES.length} missing city pages`);
