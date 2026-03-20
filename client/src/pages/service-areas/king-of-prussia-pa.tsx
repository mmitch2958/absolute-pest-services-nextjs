import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import { AbsoluteLogoSimple } from '@/components/absolute-logo';
import GoogleReviewRequest from '@/components/google-review-request';

export default function KingOfPrussiaPA() {
  const cities = ["King of Prussia", "Upper Merion Township", "Wayne", "Audubon", "Gulph Mills", "Swedeland"];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control',
  ];

  const faqs = [{"q": "Do large retail centers in King of Prussia need commercial pest control?", "a": "Yes. High foot traffic, food courts, and loading docks make large retail properties particularly vulnerable to rodents and cockroaches. We offer commercial service plans with guaranteed response times."}, {"q": "Are geese a problem near Valley Forge?", "a": "Geese are common throughout Upper Merion Township and Valley Forge National Park's perimeter. We provide humane goose deterrent programs for commercial and HOA properties."}, {"q": "Can you handle wildlife near the wooded areas around KOP?", "a": "Yes. Raccoons, groundhogs, and foxes regularly move into KOP neighborhoods from Valley Forge. We trap and relocate humanely."}, {"q": "Do new construction homes near KOP need pest-proofing?", "a": "New builds displace wildlife and can have construction gaps that invite pests. We perform post-construction exclusion treatments for new homes throughout Upper Merion Township."}];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>King of Prussia PA Pest Control Services | Absolute Pest Services</title>
        <meta name="description" content="King of Prussia PA pest control: commercial and residential wildlife removal, termite treatment, and rodent control near Valley Forge. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/service-areas/king-of-prussia-pa" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Absolute Pest Services – King of Prussia, PA Pest Control Services",
            "telephone": "484-643-2225",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "21 Sheffield Dr",
              "addressLocality": "West Grove",
              "addressRegion": "PA",
              "postalCode": "19390",
              "addressCountry": "US"
            },
            "areaServed": "King of Prussia, PA",
            "url": "https://absolutepestservices.com/service-areas/king-of-prussia-pa"
          })}
        </script>
      </Helmet>

      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <AbsoluteLogoSimple />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/service-areas">
                <Button variant="outline" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Service Areas
                </Button>
              </Link>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm text-[hsl(210,13%,28%)]">24/7 Emergency Service</span>
                <span className="text-lg font-semibold text-[hsl(132,48%,35%)]">484-643-2225</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            King of Prussia, PA Pest Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Professional pest control for King of Prussia's retail hubs, office parks, and residential communities. From the KOP Mall corridor to Valley Forge, we eliminate pests fast.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+14846432225" className="bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100">
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neighborhoods We Serve</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control throughout the King of Prussia, PA area.
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Pest Control Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management solutions for King of Prussia, PA homes and businesses.
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
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleReviewRequest />
      </div>
    </div>
  );
}
