#!/usr/bin/env node
/**
 * Script to generate 60 city × service SEO pages for Absolute Pest Services
 * 15 cities × 4 services = 60 pages
 */

const fs = require('fs');
const path = require('path');

// ─── City data ──────────────────────────────────────────────────────────────
const CITIES = [
  // Chester County, PA
  {
    name: 'Downingtown',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'downingtown-pa',
    lat: '40.0062',
    lng: '-75.7038',
    zip: '19335',
    blurb: 'Nestled along the Brandywine Creek corridor and adjacent to Marsh Creek State Park, Downingtown homes and businesses face year-round pest pressure from surrounding wooded green belts.',
    neighborhoods: ['Downingtown Borough', 'East Brandywine Township', 'Caln Township', 'Uwchlan Township', 'Glenmoore'],
    localFact: 'proximity to Marsh Creek State Park and the Brandywine Creek wildlife corridor',
  },
  {
    name: 'Exton',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'exton-pa',
    lat: '40.0262',
    lng: '-75.6213',
    zip: '19341',
    blurb: 'A fast-growing commercial and residential hub in Chester County, Exton\'s mix of new construction and mature suburban neighborhoods creates unique pest challenges.',
    neighborhoods: ['Exton', 'West Whiteland Township', 'East Whiteland Township', 'Chester Springs', 'Lionville'],
    localFact: 'the rapid new-construction boom and proximity to Exton Mall attracting rodents and pests',
  },
  {
    name: 'Coatesville',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'coatesville-pa',
    lat: '39.9834',
    lng: '-75.8238',
    zip: '19320',
    blurb: 'Coatesville\'s historic neighborhoods and industrial heritage mean older building stock that is particularly vulnerable to rodent infiltration, termite damage, and wildlife intrusion.',
    neighborhoods: ['Coatesville City', 'Valley Township', 'Caln Township', 'South Coatesville', 'Modena'],
    localFact: 'aging housing stock and proximity to the Brandywine Creek watershed',
  },
  {
    name: 'Cochranville',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'cochranville-pa',
    lat: '39.8807',
    lng: '-75.9249',
    zip: '19330',
    blurb: 'Rural Cochranville\'s agricultural landscape and wooded properties create prime habitat for wildlife, rodents, and structural pests seeking shelter in nearby homes.',
    neighborhoods: ['Cochranville', 'Parkesburg', 'Highland Township', 'West Fallowfield Township', 'Atglen'],
    localFact: 'the surrounding farmland and dense woodland that funnel wildlife toward residential properties',
  },
  {
    name: 'Kennett Square',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'kennett-square-pa',
    lat: '39.8459',
    lng: '-75.7113',
    zip: '19348',
    blurb: 'Known as the Mushroom Capital of the World, Kennett Square\'s mushroom farms and rich agricultural soil create elevated moisture and pest pressure in surrounding homes.',
    neighborhoods: ['Kennett Square Borough', 'Kennett Township', 'East Marlborough Township', 'Newlin Township', 'Toughkenamon'],
    localFact: 'the mushroom farm operations and moist agricultural soils that attract pests',
  },
  {
    name: 'Avondale',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'avondale-pa',
    lat: '39.8273',
    lng: '-75.7807',
    zip: '19311',
    blurb: 'Avondale\'s proximity to Brandywine Creek State Park (DE) and the agricultural zones of southern Chester County make it a hot zone for wildlife and seasonal pest activity.',
    neighborhoods: ['Avondale Borough', 'New Garden Township', 'London Grove Township', 'Penn Township', 'Landenberg'],
    localFact: 'the southern Chester County agricultural corridor and Brandywine Creek proximity',
  },
  {
    name: 'West Grove',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'west-grove-pa',
    lat: '39.8220',
    lng: '-75.8290',
    zip: '19390',
    blurb: 'Home to Absolute Pest Services\' main office, West Grove is at the heart of our service territory. We know every neighborhood, road, and pest pattern in this community.',
    neighborhoods: ['West Grove Borough', 'Penn Township', 'London Grove Township', 'New London Township', 'Grove Park'],
    localFact: 'our home base — we know West Grove\'s pest landscape better than anyone',
  },
  {
    name: 'Oxford',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'oxford-pa',
    lat: '39.7862',
    lng: '-75.9779',
    zip: '19363',
    blurb: 'Southern Chester County\'s Oxford area blends rural farmland with growing residential developments, creating ideal conditions for termites, rodents, and wildlife to thrive.',
    neighborhoods: ['Oxford Borough', 'East Nottingham Township', 'West Nottingham Township', 'Lower Oxford Township', 'Elk Township'],
    localFact: 'the rural-to-suburban transition zone and neighboring farmland wildlife corridors',
  },
  {
    name: 'Lincoln University',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'lincoln-university-pa',
    lat: '39.8076',
    lng: '-75.9260',
    zip: '19352',
    blurb: 'Lincoln University\'s historic campus and surrounding rural properties in southern Chester County experience significant wildlife and rodent pressure from adjacent wooded areas.',
    neighborhoods: ['Lincoln University', 'Elk Township', 'Lower Oxford Township', 'Franklin Township', 'Nottingham'],
    localFact: 'the wooded campus environment and agricultural surroundings that harbor wildlife',
  },
  {
    name: 'Landenberg',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'landenberg-pa',
    lat: '39.7626',
    lng: '-75.7808',
    zip: '19350',
    blurb: 'Landenberg\'s scenic position along the White Clay Creek watershed and proximity to Delaware state parks creates a wildlife-rich environment with elevated pest pressure.',
    neighborhoods: ['Landenberg', 'New Garden Township', 'Penn Township', 'White Clay Creek Preserve area', 'Kemblesville'],
    localFact: 'the White Clay Creek watershed and neighboring state park lands',
  },
  {
    name: 'Chadds Ford',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'chadds-ford-pa',
    lat: '39.8695',
    lng: '-75.5905',
    zip: '19317',
    blurb: 'Chadds Ford\'s upscale rural character, historic Brandywine Valley setting, and mature woodlands make it a prime area for wildlife incursions, termite pressure, and seasonal pest activity.',
    neighborhoods: ['Chadds Ford Township', 'Pennsbury Township', 'Pocopson Township', 'Concord Township', 'Brandywine Valley'],
    localFact: 'the historic Brandywine Valley\'s mature woodlands and high-value estate properties',
  },
  {
    name: 'Glen Mills',
    state: 'PA',
    stateFullName: 'Pennsylvania',
    county: 'Chester County',
    slug: 'glen-mills-pa',
    lat: '39.9001',
    lng: '-75.5155',
    zip: '19342',
    blurb: 'Glen Mills\' affluent suburban communities border Ridley Creek State Park, creating exceptional wildlife pressure alongside termite and rodent risk from the surrounding forested landscape.',
    neighborhoods: ['Glen Mills', 'Thornbury Township', 'Chester Heights', 'Concord Township', 'Garnet Valley'],
    localFact: 'the proximity to Ridley Creek State Park and the Garnet Valley wildlife corridor',
  },
  // Delaware
  {
    name: 'Hockessin',
    state: 'DE',
    stateFullName: 'Delaware',
    county: 'New Castle County',
    slug: 'hockessin-de',
    lat: '39.7851',
    lng: '-75.6960',
    zip: '19707',
    blurb: 'Hockessin\'s wooded, affluent neighborhoods along the Kennett Pike corridor border Brandywine Creek State Park, creating elevated wildlife and termite pressure for homeowners.',
    neighborhoods: ['Hockessin', 'Yorklyn', 'Limestone Hills', 'Ashland', 'Brandywine Hundred North', 'Centerville'],
    localFact: 'the Brandywine Creek State Park border and heavily wooded Kennett Pike corridor',
  },
  {
    name: 'Newark',
    state: 'DE',
    stateFullName: 'Delaware',
    county: 'New Castle County',
    slug: 'newark-de',
    lat: '39.6837',
    lng: '-75.7497',
    zip: '19711',
    blurb: 'Newark, home to the University of Delaware, blends college-town density with surrounding suburban neighborhoods — a combination that drives unique pest pressure from rodents, bed bugs, and wildlife.',
    neighborhoods: ['Newark City', 'White Clay Creek area', 'University of Delaware campus area', 'Brookside', 'Ogletown'],
    localFact: 'the University of Delaware campus density and the surrounding White Clay Creek watershed',
  },
  {
    name: 'Wilmington',
    state: 'DE',
    stateFullName: 'Delaware',
    county: 'New Castle County',
    slug: 'wilmington-de',
    lat: '39.7447',
    lng: '-75.5484',
    zip: '19801',
    blurb: 'Delaware\'s largest city, Wilmington\'s mix of historic row homes, commercial districts, and suburban neighborhoods creates diverse pest challenges including rodents, bed bugs, and urban wildlife.',
    neighborhoods: ['Downtown Wilmington', 'Trolley Square', 'Brandywine', 'Rockford Park', 'Farnhurst', 'Claymont'],
    localFact: 'the density of historic building stock and the urban wildlife corridor along the Brandywine River',
  },
];

// ─── Service data ────────────────────────────────────────────────────────────
const SERVICES = [
  {
    slug: 'general-pest-control',
    name: 'General Pest Control',
    shortName: 'Pest Control',
    icon: 'Bug',
    routePrefix: 'pest-control',
    mainPageLink: '/request-service',
    mainPageLabel: 'Request Service',
    h1Template: (city, state) => `General Pest Control in ${city}, ${state}`,
    h2: 'Comprehensive Pest Management for Your Home & Business',
    description: (city, state, county, localFact) =>
      `Professional general pest control services in ${city}, ${state}. Our licensed technicians eliminate ants, spiders, cockroaches, stink bugs, silverfish, centipedes, and dozens of other common household pests. With ${localFact}, pest pressure in ${city} can be intense — our barrier treatments and targeted interior applications keep infestations from taking hold.`,
    bullets: [
      'Ant control (carpenter ants, pavement ants, odorous house ants)',
      'Cockroach elimination — German & American species',
      'Spider control including brown recluse & cellar spiders',
      'Stink bug prevention treatments (fall barrier)',
      'Silverfish, earwig & centipede control',
      'Exterior perimeter barrier program',
      'Interior crack & crevice treatment',
      'Seasonal pest prevention plans',
    ],
    faqs: (city, state) => [
      {
        q: `How often should I schedule pest control service in ${city}, ${state}?`,
        a: `Most ${city} homeowners benefit from quarterly exterior barrier treatments combined with an as-needed interior program. High-pest-pressure properties near wooded areas may need bi-monthly service.`,
      },
      {
        q: `Are your pest control treatments safe for children and pets in ${city}?`,
        a: `Yes. We use EPA-registered, low-toxicity products and follow strict application protocols. We'll advise you on any brief vacate times when necessary.`,
      },
      {
        q: `Do you offer same-day pest control service in ${city}, ${state}?`,
        a: `We do our best to accommodate same-day or next-day service requests throughout ${city} and surrounding areas. Call 484-643-2225 to check availability.`,
      },
      {
        q: `What pests are most common in ${city}?`,
        a: `${city} homeowners most frequently call us about carpenter ants, stink bugs, spiders, and cockroaches. Seasonal patterns shift — spring brings ants, summer brings stinging insects, fall brings stink bugs and mice seeking warmth.`,
      },
    ],
    ctaHeadline: (city) => `Stop Pests in ${city} Before They Take Over`,
    ctaBody: (city, state) => `Don't let common pests damage your ${city} home or disrupt your family. Our licensed technicians serve all of ${city}, ${state} and surrounding areas with fast, effective treatments.`,
  },
  {
    slug: 'termite-control',
    name: 'Termite Control',
    shortName: 'Termite Control',
    icon: 'AlertTriangle',
    routePrefix: 'termite-control',
    mainPageLink: '/termites',
    mainPageLabel: 'Termite Treatment Info',
    h1Template: (city, state) => `Termite Control & Treatment in ${city}, ${state}`,
    h2: 'Protect Your Investment from Silent Wood Destroyers',
    description: (city, state, county, localFact) =>
      `Subterranean termites cause billions in property damage annually — and ${city}, ${state} properties are not immune. With ${localFact}, the soil conditions and moisture levels in ${city} create ideal termite habitat. Our termite inspections and Sentricon® Colony Elimination treatments stop termite colonies at the source before they compromise your home's structural integrity.`,
    bullets: [
      'Free termite inspections for ${city} homeowners',
      'Sentricon® Colony Elimination System',
      'Liquid barrier treatment (Termidor®)',
      'Wood treatment & localized borate applications',
      'Pre-construction soil treatment',
      'Annual inspection & warranty programs',
      'Termite damage assessment',
      'Real estate inspection letters (WDO)',
    ],
    faqs: (city, state) => [
      {
        q: `How do I know if my ${city} home has termites?`,
        a: `Common signs include mud tubes along foundation walls, hollow-sounding wood, discarded wings near windows, and frass (termite droppings). Our free inspection will confirm whether termites are present.`,
      },
      {
        q: `What termite treatment method works best for ${city} properties?`,
        a: `We typically recommend the Sentricon® bait system for long-term colony elimination, or Termidor® liquid barrier for active infestations requiring faster knockdown. We'll recommend the right solution after inspection.`,
      },
      {
        q: `How long does termite treatment take in ${city}?`,
        a: `Liquid barrier treatments are completed in a few hours. Sentricon® bait station installation takes 2–4 hours. Colony elimination typically occurs within 3 months of Sentricon® activation.`,
      },
      {
        q: `Do you provide termite letters for real estate sales in ${city}, ${state}?`,
        a: `Yes. We perform Wood Destroying Organism (WDO) inspections and issue official inspection reports needed for ${city} real estate transactions. Call to schedule promptly as closings often have tight timelines.`,
      },
    ],
    ctaHeadline: (city) => `Protect Your ${city} Home from Termites`,
    ctaBody: (city, state) => `Termite damage is rarely covered by homeowners insurance. Don't wait for signs — proactive termite protection for your ${city}, ${state} property starts with a free inspection.`,
  },
  {
    slug: 'wildlife-rodent-control',
    name: 'Wildlife & Rodent Control',
    shortName: 'Wildlife Control',
    icon: 'Shield',
    routePrefix: 'wildlife-control',
    mainPageLink: '/wildlife-control',
    mainPageLabel: 'Wildlife Control Info',
    h1Template: (city, state) => `Wildlife & Rodent Control in ${city}, ${state}`,
    h2: 'Humane Wildlife Removal & Rodent Exclusion',
    description: (city, state, county, localFact) =>
      `${city}, ${state} homeowners regularly encounter raccoons, squirrels, groundhogs, opossums, foxes, and mice seeking shelter. With ${localFact}, wildlife pressure in ${city} is elevated compared to more urbanized areas. Our licensed wildlife control team removes animals humanely and seals entry points to prevent re-entry — addressing the problem at its source.`,
    bullets: [
      'Raccoon removal & exclusion',
      'Squirrel & flying squirrel control',
      'Groundhog (woodchuck) removal',
      'Opossum trapping & relocation',
      'Mouse & rat control programs',
      'Attic & crawl space exclusion',
      'Entry point sealing & structural repairs',
      'Dead animal removal',
    ],
    faqs: (city, state) => [
      {
        q: `What wildlife is most common in ${city}, ${state}?`,
        a: `Raccoons, squirrels, mice, and groundhogs are the most frequent calls in ${city}. We also handle foxes, opossums, and the occasional skunk. Seasonal shifts bring different species — attic intrusions peak in fall and winter.`,
      },
      {
        q: `Is wildlife removal in ${city} humane?`,
        a: `Yes. We use live trapping and exclusion methods approved by Pennsylvania and Delaware wildlife authorities. Animals are relocated according to state regulations. We never use inhumane methods.`,
      },
      {
        q: `Will mice in my ${city} home come back after treatment?`,
        a: `Not if we do our job correctly. Our rodent program combines population reduction (trapping/baiting) with exclusion — sealing every gap larger than a dime. Without exclusion, mice always come back.`,
      },
      {
        q: `How quickly can you remove a raccoon from my ${city} attic?`,
        a: `We offer same-day response for most wildlife emergencies throughout ${city} and ${state}. Call 484-643-2225 for urgent wildlife situations.`,
      },
    ],
    ctaHeadline: (city) => `Wildlife Problem in ${city}? We Can Help.`,
    ctaBody: (city, state) => `From raccoons in the attic to mice in the walls, our team handles all wildlife and rodent situations in ${city}, ${state} with humane, permanent solutions.`,
  },
  {
    slug: 'bed-bug-treatment',
    name: 'Bed Bug Treatment',
    shortName: 'Bed Bug Treatment',
    icon: 'Search',
    routePrefix: 'bed-bug-treatment',
    mainPageLink: '/bed-bugs',
    mainPageLabel: 'Bed Bug Info',
    h1Template: (city, state) => `Bed Bug Treatment in ${city}, ${state}`,
    h2: 'Fast, Effective Bed Bug Elimination — Guaranteed',
    description: (city, state, county, localFact) =>
      `Bed bugs don't discriminate — they infest hotels, apartments, single-family homes, and businesses across ${city}, ${state}. They spread through travel, used furniture, and multi-unit dwellings. Our bed bug treatment team uses a combination of heat treatment and targeted chemical applications to eliminate every life stage — eggs, nymphs, and adults — in a single treatment visit.`,
    bullets: [
      'Free bed bug inspection & identification',
      'Heat treatment (whole-room thermal remediation)',
      'Chemical/residual treatment programs',
      'Mattress & box spring treatment/encasements',
      'Multi-unit & apartment building programs',
      'Hotel & hospitality industry services',
      'Post-treatment inspection & follow-up',
      'Discreet service — no logos on our vehicles',
    ],
    faqs: (city, state) => [
      {
        q: `How do I know if I have bed bugs in my ${city} home?`,
        a: `Look for small rust-colored stains on sheets, shed skins, tiny white eggs in mattress seams, and the bugs themselves (apple seed-sized, reddish-brown). Itchy, clustered bites in lines or groups are another sign. Call us for a free inspection.`,
      },
      {
        q: `How many treatments does it take to eliminate bed bugs in ${city}?`,
        a: `Our heat treatment eliminates bed bugs in a single visit in most cases. Chemical treatments typically require 2–3 visits spaced 2 weeks apart. We provide a re-treatment guarantee.`,
      },
      {
        q: `Do you offer discreet bed bug treatment in ${city}?`,
        a: `Yes. We use unmarked vehicles and plain-clothed technicians upon request. We understand the sensitivity of bed bug situations and protect your privacy.`,
      },
      {
        q: `How much does bed bug treatment cost in ${city}, ${state}?`,
        a: `Cost depends on property size, infestation severity, and treatment method. We provide free inspections and transparent quotes before any work begins. Call 484-643-2225 to schedule your inspection.`,
      },
    ],
    ctaHeadline: (city) => `Bed Bugs in ${city}? Act Fast.`,
    ctaBody: (city, state) => `Bed bug infestations grow exponentially if left untreated. Our ${city}, ${state} team offers fast scheduling, discreet service, and guaranteed results.`,
  },
];

// ─── Template generator ───────────────────────────────────────────────────────
function generatePage(city, service) {
  const {
    name: cityName, state, slug: citySlug, lat, lng,
    blurb, neighborhoods, localFact, county, stateFullName,
  } = city;

  const {
    slug: serviceSlug, name: serviceName, shortName, icon,
    routePrefix, mainPageLink, mainPageLabel,
    h1Template, h2, description, bullets, faqs,
    ctaHeadline, ctaBody,
  } = service;

  const routeSlug = `${routePrefix}-${citySlug}`;
  const canonicalUrl = `https://absolutepestservices.com/${routeSlug}/`;
  const pageTitle = `${serviceName} in ${cityName}, ${state} | Absolute Pest Services`;
  const metaDescription = `Expert ${serviceName.toLowerCase()} in ${cityName}, ${state}. Licensed & insured. Serving ${county}. Free inspection available. Call 484-643-2225 for fast service.`;
  const h1 = h1Template(cityName, state);
  const desc = description(cityName, state, county, localFact);
  const cityFaqs = faqs(cityName, state);
  const ctaH = ctaHeadline(cityName);
  const ctaB = ctaBody(cityName, state);
  const bulletsResolved = bullets.map(b => b.replace('${city}', cityName).replace('${state}', state));

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        'name': 'Absolute Pest Services',
        'telephone': '484-643-2225',
        'url': 'https://absolutepestservices.com',
        'image': 'https://absolutepestservices.com/og-image.jpg',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '21 Sheffield Dr',
          'addressLocality': 'West Grove',
          'addressRegion': 'PA',
          'postalCode': '19390',
          'addressCountry': 'US',
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': lat,
          'longitude': lng,
        },
        'areaServed': {
          '@type': 'City',
          'name': cityName,
          'containedInPlace': {
            '@type': 'AdministrativeArea',
            'name': county,
            'containedInPlace': {
              '@type': 'State',
              'name': stateFullName,
            },
          },
        },
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': serviceName,
          'itemListElement': [
            {
              '@type': 'Offer',
              'itemOffered': {
                '@type': 'Service',
                'name': `${serviceName} in ${cityName}, ${state}`,
                'description': desc.substring(0, 200),
              },
            },
          ],
        },
      },
      {
        '@type': 'FAQPage',
        'mainEntity': cityFaqs.map(faq => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a,
          },
        })),
      },
    ],
  };

  const componentName = toPascalCase(`${serviceSlug}-${citySlug}`);
  const stateTag = state === 'PA' ? 'PA' : 'DE';

  return `import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, Shield, Bug, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleReviewRequest from '@/components/google-review-request';

export default function ${componentName}() {
  const neighborhoods = ${JSON.stringify(neighborhoods)};

  const bulletPoints = ${JSON.stringify(bulletsResolved)};

  const faqs = ${JSON.stringify(cityFaqs)};

  const schema = ${JSON.stringify(schema, null, 2)};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>${pageTitle}</title>
        <meta name="description" content="${metaDescription}" />
        <link rel="canonical" href="${canonicalUrl}" />
        <meta property="og:title" content="${pageTitle}" />
        <meta property="og:description" content="${metaDescription}" />
        <meta property="og:url" content="${canonicalUrl}" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-4 h-4 mr-2" />
            ${cityName}, ${stateTag} · ${county}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            ${h1}
          </h1>
          <p className="text-xl text-green-100 mb-4 max-w-3xl mx-auto">
            ${h2}
          </p>
          <p className="text-green-200 mb-8 max-w-2xl mx-auto">
            ${blurb}
          </p>
          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm text-green-100">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Licensed &amp; Insured</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> PA &amp; DE Certified</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Free Inspection</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 5.0★ Rated</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 24/7 Emergency</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+14846432225"
              className="inline-flex items-center justify-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md transition-colors"
            >
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

      {/* What We Do */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">${serviceName} in ${cityName}, ${state}</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                ${desc}
              </p>
              <Link href="${mainPageLink}">
                <Button variant="outline" className="px-6 py-3">${mainPageLabel} →</Button>
              </Link>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">What's Included</h3>
              <div className="space-y-3">
                {bulletPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Serving ${cityName} &amp; Surrounding Neighborhoods
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our technicians know every neighborhood in and around ${cityName}, ${state}.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {neighborhoods.map((area, i) => (
              <Card key={i} className="bg-emerald-50 hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">{area}</span>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Don't see your neighborhood? We likely serve it — call to confirm.
          </p>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">
            Why ${cityName} Trusts Absolute Pest Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Licensed & Certified', body: 'Fully licensed in Pennsylvania and Delaware. All technicians are state-certified pest control applicators.', color: 'bg-[hsl(132,48%,35%)]' },
              { title: 'Locally Owned', body: 'Based in West Grove, PA — we\'re your neighbors. We know Chester County and New Castle County pests inside out.', color: 'bg-[hsl(36,100%,47%)]' },
              { title: '5.0 Star Rated', body: 'Consistent 5-star Google reviews from homeowners throughout ${cityName} and surrounding communities.', color: 'bg-[hsl(207,73%,44%)]' },
              { title: '24/7 Emergency', body: 'Pest emergencies don\'t keep business hours. Our team is available around the clock for urgent situations.', color: 'bg-[hsl(132,48%,25%)]' },
            ].map((card, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={\`w-12 h-12 \${card.color} rounded-full flex items-center justify-center mx-auto mb-4\`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
            Frequently Asked Questions — ${serviceName} in ${cityName}
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border rounded-lg p-6 bg-emerald-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">${ctaH}</h2>
          <p className="text-xl text-green-100 mb-8">${ctaB}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+14846432225"
              className="inline-flex items-center justify-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md transition-colors"
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 484-643-2225
            </a>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Service Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Other Services We Offer in ${cityName}, ${state}
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/termites"><Button variant="outline">Termite Treatment</Button></Link>
            <Link href="/wildlife-control"><Button variant="outline">Wildlife Control</Button></Link>
            <Link href="/bed-bugs"><Button variant="outline">Bed Bug Treatment</Button></Link>
            <Link href="/rodents"><Button variant="outline">Rodent Control</Button></Link>
            <Link href="/bat-removal"><Button variant="outline">Bat Removal</Button></Link>
            <Link href="/service-areas"><Button variant="outline">All Service Areas</Button></Link>
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

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const BASE_DIR = path.join(__dirname, '..', 'client', 'src', 'pages', 'city-services');
fs.mkdirSync(BASE_DIR, { recursive: true });

const routeMap = [];
const importMap = [];

for (const city of CITIES) {
  for (const service of SERVICES) {
    const routeSlug = `${service.routePrefix}-${city.slug}`;
    const fileName = `${routeSlug}.tsx`;
    const filePath = path.join(BASE_DIR, fileName);
    const componentName = toPascalCase(`${service.slug}-${city.slug}`);

    const content = generatePage(city, service);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${fileName}`);

    routeMap.push({
      path: `/${routeSlug}/`,
      component: componentName,
      file: `@/pages/city-services/${routeSlug}`,
    });
  }
}

// Generate App.tsx additions
const imports = routeMap
  .map(r => `import ${r.component} from "${r.file}";`)
  .join('\n');

const routes = routeMap
  .map(r => `      <Route path="${r.path}" component={${r.component}} />`)
  .join('\n');

fs.writeFileSync(
  path.join(__dirname, '..', 'atris', 'city-service-routes.txt'),
  `// === IMPORTS TO ADD TO App.tsx ===\n${imports}\n\n// === ROUTES TO ADD INSIDE <Switch> ===\n${routes}\n`,
  'utf8',
);

console.log(`\n✅ Generated ${routeMap.length} city×service pages`);
console.log(`📄 Routes file: atris/city-service-routes.txt`);
