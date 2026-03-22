import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, ArrowLeft, Bug } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import { AbsoluteLogoSimple } from '@/components/absolute-logo';
import GoogleReviewRequest from '@/components/google-review-request';

export default function ChesterCountyPA() {
  const cities = [
    'West Grove',
    'Oxford',
    'Kennett Square',
    'Avondale',
    'Toughkenamon',
    'West Chester',
    'Chadds Ford',
    'Landenberg'
  ];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control'
  ];

  const faqs = [{"q":"What pests are most common in Chester County, PA?","a":"Chester County's mix of farmland, forests, and suburban neighborhoods creates high pest pressure. Carpenter ants, termites, mice, and wildlife like raccoons and groundhogs are the most common issues homeowners face throughout the county."},{"q":"Do you provide termite inspections in Chester County?","a":"Yes. Termite activity is prevalent throughout Chester County due to its moist, clay-heavy soils. We offer free termite inspections for homes in West Grove, Kennett Square, West Chester, Exton, and all other Chester County municipalities."},{"q":"How quickly can you respond to a pest emergency in Chester County?","a":"We offer same-day or next-day service throughout Chester County. Our technicians are based in West Grove, PA, allowing us to reach most county locations within an hour."},{"q":"Are your pest control treatments safe for families and pets in Chester County?","a":"Yes. We use EPA-registered products and follow strict application protocols. We advise on any necessary vacate times, especially for homes with small children or pets."}];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Chester County PA Pest Control Services | Absolute Pest Services</title>
        <meta name="description" content="Chester County PA: Expert pest control services in West Grove, Kennett Square, Oxford, Avondale. Licensed, insured, emergency service available. 5.0 star rated." />
        <link rel="canonical" href="https://absolutepestservices.com/service-areas/chester-county-pa" />
      </Helmet>
        <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Absolute Pest Services",
      "telephone": "484-643-2225",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "21 Sheffield Dr",
        "addressLocality": "West Grove",
        "addressRegion": "PA",
        "postalCode": "19390",
        "addressCountry": "US"
      },
      "url": "https://absolutepestservices.com/service-areas/chester-county-pa"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What pests are most common in Chester County, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Chester County's mix of farmland, forests, and suburban neighborhoods creates high pest pressure. Carpenter ants, termites, mice, and wildlife like raccoons and groundhogs are the most common issues homeowners face throughout the county."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide termite inspections in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Termite activity is prevalent throughout Chester County due to its moist, clay-heavy soils. We offer free termite inspections for homes in West Grove, Kennett Square, West Chester, Exton, and all other Chester County municipalities."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly can you respond to a pest emergency in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer same-day or next-day service throughout Chester County. Our technicians are based in West Grove, PA, allowing us to reach most county locations within an hour."
          }
        },
        {
          "@type": "Question",
          "name": "Are your pest control treatments safe for families and pets in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We use EPA-registered products and follow strict application protocols. We advise on any necessary vacate times, especially for homes with small children or pets."
          }
        }
      ]
    }
  ]
}</script>
        <script type="application/ld+json">{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Absolute Pest Services",
      "telephone": "484-643-2225",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "21 Sheffield Dr",
        "addressLocality": "West Grove",
        "addressRegion": "PA",
        "postalCode": "19390",
        "addressCountry": "US"
      },
      "url": "https://absolutepestservices.com/service-areas/chester-county-pa"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What pests are most common in Chester County, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Chester County's mix of farmland, forests, and suburban neighborhoods creates high pest pressure. Carpenter ants, termites, mice, and wildlife like raccoons and groundhogs are the most common issues homeowners face throughout the county."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide termite inspections in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Termite activity is prevalent throughout Chester County due to its moist, clay-heavy soils. We offer free termite inspections for homes in West Grove, Kennett Square, West Chester, Exton, and all other Chester County municipalities."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly can you respond to a pest emergency in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer same-day or next-day service throughout Chester County. Our technicians are based in West Grove, PA, allowing us to reach most county locations within an hour."
          }
        },
        {
          "@type": "Question",
          "name": "Are your pest control treatments safe for families and pets in Chester County?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We use EPA-registered products and follow strict application protocols. We advise on any necessary vacate times, especially for homes with small children or pets."
          }
        }
      ]
    }
  ]
}</script>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Chester County, PA Pest Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Professional pest control services throughout Chester County, Pennsylvania. 
            From West Grove to Kennett Square, we protect homes and businesses with 
            safe, effective treatments.
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

      {/* Cities Served */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cities We Serve in Chester County
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Providing fast, reliable pest control services to homeowners and businesses 
              throughout Chester County, PA.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {cities.map((city, index) => (
              <Card key={index} className="bg-emerald-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{city}</h3>
                  <p className="text-sm text-gray-600 mt-1">PA</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Available */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pest Control Services in Chester County
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management solutions for your Chester County home or business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/wildlife-control">
                <Button variant="outline" className="px-6 py-3">Wildlife Control</Button>
              </Link>
              <Link href="/bed-bugs">
                <Button variant="outline" className="px-6 py-3">Bed Bug Treatment</Button>
              </Link>
              <Link href="/termites">
                <Button variant="outline" className="px-6 py-3">Termite Treatment</Button>
              </Link>
              <Link href="/bat-removal">
                <Button variant="outline" className="px-6 py-3">Bat Removal</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <!-- Nearby Service Areas -->
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nearby Service Areas — Pest Control Near Chester County
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We serve Chester County and surrounding communities throughout the region.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/service-areas/west-chester-pa">
              <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">West Chester, PA</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/service-areas/kennett-square-pa">
              <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Kennett Square, PA</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/service-areas/exton-pa">
              <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Exton, PA</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/service-areas/wilmington-de">
              <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">Wilmington, DE</span>
                </CardContent>
              </Card>
            </Link>
          </div>
          <div className="text-center mt-8">
            <Link href="/service-areas">
              <Button variant="outline" className="px-6 py-3">View All Service Areas →</Button>
            </Link>
          </div>
        </div>
      </section>

      <!-- Our Services in Chester County -->
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Pest Control Services in Chester County
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From wildlife removal to termite protection, we offer comprehensive pest management tailored to Chester County properties.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/termites">
              <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Termite Treatment</span>
                    <p className="text-xs text-gray-500 mt-0.5">Inspection &amp; prevention</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/wildlife-control">
              <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Wildlife Control</span>
                    <p className="text-xs text-gray-500 mt-0.5">Raccoon, squirrel &amp; groundhog removal</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/bed-bugs">
              <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Bed Bug Treatment</span>
                    <p className="text-xs text-gray-500 mt-0.5">Heat &amp; chemical options</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/rodents">
              <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[hsl(132,48%,25%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Rodent Control</span>
                    <p className="text-xs text-gray-500 mt-0.5">Mice &amp; rat extermination</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/bat-removal">
              <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[hsl(36,80%,50%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Bat Removal</span>
                    <p className="text-xs text-gray-500 mt-0.5">Humane exclusion &amp; guano cleanup</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/request-service">
              <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[hsl(0,0%,60%)] rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">Schedule Service</span>
                    <p className="text-xs text-gray-500 mt-0.5">Free inspection · Same-day available</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>


      {/* Contact Info */}
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
                <p className="text-gray-600">Mon-Fri: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Sat: 8:00 AM - 12:00 PM</p>
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

      {/* Review Request */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleReviewRequest />
      </div>
    </div>
  );
}
