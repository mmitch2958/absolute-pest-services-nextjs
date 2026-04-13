import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import { AbsoluteLogoSimple } from '@/components/absolute-logo';
import GoogleReviewRequest from '@/components/google-review-request';

export default function ExtonPA() {
  const cities = [
    'Exton',
    'Lionville',
    'Uwchlan Township',
    'West Whiteland Township',
    'East Whiteland Township',
    'Malvern',
  ];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control',
  ];

  const faqs = [
    {
        useEffect(() => {
            const script = document.createElement("script");
            script.type = "application/ld+json";
            script.textContent = `{
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
          "url": "https://absolutepestservices.com/service-areas/exton-pa"
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Do new construction homes near Exton need pest protection?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Absolutely. New development in Uwchlan and West Whiteland displaces wildlife like groundhogs, raccoons, and foxes. We handle wildlife exclusion for newly built homes throughout the Exton area."
              }
            },
            {
              "@type": "Question",
              "name": "How do I know if I have termites in my Exton home?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Look for mud tubes near your foundation, hollow-sounding wood, or discarded wings near windowsills. We offer free termite inspections throughout the Exton area."
              }
            },
            {
              "@type": "Question",
              "name": "Can you treat bed bugs in Exton hotels or short-term rentals?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes. We provide discreet, effective bed bug treatment for commercial and residential properties throughout Exton and Chester County."
              }
            }
          ]
        }
      ]
    }`;
            document.head.appendChild(script);
            return () => {
                document.head.removeChild(script);
            };
        }, []);

      q: 'Are pests common in Exton\'s corporate parks and office buildings?',
      a: 'Yes. Exton\'s dense concentration of corporate campuses and restaurants near the PA Turnpike interchange creates high pest pressure, particularly for rodents, cockroaches, and ants. We offer commercial pest management tailored to office and retail environments.',
    },
    {
      q: 'Do new construction homes near Exton need pest protection?',
      a: 'Absolutely. New development in Uwchlan and West Whiteland displaces wildlife like groundhogs, raccoons, and foxes. We handle wildlife exclusion for newly built homes throughout the Exton area.',
    },
    {
      q: 'How do I know if I have termites in my Exton home?',
      a: 'Look for mud tubes near your foundation, hollow-sounding wood, or discarded wings near windowsills. We offer free termite inspections throughout the Exton area.',
    },
    {
      q: 'Can you treat bed bugs in Exton hotels or short-term rentals?',
      a: 'Yes. We provide discreet, effective bed bug treatment for commercial and residential properties throughout Exton and Chester County.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Exton PA Pest Control Services | Absolute Pest Services</title>
        <meta name="description" content="Exton PA pest control: wildlife removal, termite treatment, bed bug control, and rodent extermination near the PA Turnpike. Serving Exton, Lionville, and Uwchlan. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/service-areas/exton-pa" />
        
      </Helmet>
      <Header />

      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Exton, PA Pest Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Trusted pest control for Exton's homes, corporate parks, and retail centers. From the PA Turnpike interchange to Lionville, we keep properties pest-free with proven, effective treatments.
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

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neighborhoods We Serve in Exton</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control throughout Exton and surrounding communities.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
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

      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pest Control Services in Exton</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management for Exton homes and businesses.
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

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Exton Pest Control FAQs</h2>
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
      {/* Nearby Service Areas */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nearby Service Areas — Pest Control Near Exton
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We serve Exton and surrounding communities throughout the region.
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
<Link href="/service-areas/downingtown-pa">
                <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">Downingtown, PA</span>
                  </CardContent>
                </Card>
              </Link>
<Link href="/service-areas/malvern-pa">
                <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">Malvern, PA</span>
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
          </div>
          <div className="text-center mt-8">
            <Link href="/service-areas">
              <Button variant="outline" className="px-6 py-3">View All Service Areas →</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services in Exton */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Pest Control Services in Exton
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From wildlife removal to termite protection, we offer comprehensive pest management tailored to Exton properties.
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
                    <p className="text-xs text-gray-500 mt-0.5">Inspection &amp; prevention in Exton</p>
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
                    <p className="text-xs text-gray-500 mt-0.5">Heat &amp; chemical options in Exton</p>
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
                    <p className="text-xs text-gray-500 mt-0.5">Mice &amp; rat extermination in Exton</p>
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


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleReviewRequest />
      </div>
    </div>
  );
}
