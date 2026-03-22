import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import { AbsoluteLogoSimple } from '@/components/absolute-logo';
import GoogleReviewRequest from '@/components/google-review-request';

export default function DowningtownPA() {
  const cities = ["Downingtown Borough", "East Brandywine Township", "West Bradford Township", "Caln Township", "Uwchlan Township", "Glenmoore"];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control',
  ];

  const faqs = [{"q": "Does proximity to Marsh Creek State Park increase pest risk?", "a": "Yes. Properties near Marsh Creek see elevated activity from deer, raccoons, groundhogs, and geese. We offer wildlife exclusion and deterrent programs for park-adjacent homes."}, {"q": "Are stink bugs a major problem in Downingtown?", "a": "Stink bugs are very common in Chester County, especially in the fall. We provide exterior barrier treatments that dramatically reduce stink bug intrusion."}, {"q": "Do older Downingtown Borough homes need termite inspections?", "a": "Yes. Many borough homes date to the early 1900s and have wood foundations or aged framing that makes them vulnerable to termite damage. Call us for a free inspection."}, {"q": "How quickly can you respond to a wildlife call in Downingtown?", "a": "We offer same-day response for most wildlife emergencies throughout Downingtown and surrounding townships."}];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Downingtown PA Pest Control Services | Absolute Pest Services</title>
        <meta name="description" content="Downingtown PA pest control: wildlife removal, termite treatment, bed bug control near Marsh Creek State Park and East Brandywine. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/service-areas/downingtown-pa" />
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
      "url": "https://absolutepestservices.com/service-areas/downingtown-pa"
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Does proximity to Marsh Creek State Park increase pest risk?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Properties near Marsh Creek see elevated activity from deer, raccoons, groundhogs, and geese. We offer wildlife exclusion and deterrent programs for park-adjacent homes."
          }
        },
        {
          "@type": "Question",
          "name": "Are stink bugs a major problem in Downingtown?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Stink bugs are very common in Chester County, especially in the fall. We provide exterior barrier treatments that dramatically reduce stink bug intrusion."
          }
        },
        {
          "@type": "Question",
          "name": "Do older Downingtown Borough homes need termite inspections?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Many borough homes date to the early 1900s and have wood foundations or aged framing that makes them vulnerable to termite damage. Call us for a free inspection."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly can you respond to a wildlife call in Downingtown?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer same-day response for most wildlife emergencies throughout Downingtown and surrounding townships."
          }
        }
      ]
    }
  ]
}</script>
      </Helmet>
      <Header />

      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Downingtown, PA Pest Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Reliable pest control for Downingtown and East Brandywine. From the train line corridors to Marsh Creek State Park's surrounding neighborhoods, we protect homes and businesses year-round.
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neighborhoods We Serve</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control throughout the Downingtown, PA area.
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
              Complete pest management solutions for Downingtown, PA homes and businesses.
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
      <!-- Nearby Service Areas -->
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nearby Service Areas — Pest Control Near Downingtown
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We serve Downingtown and surrounding communities throughout the region.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
<Link href="/service-areas/coatesville-pa">
                <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">Coatesville, PA</span>
                  </CardContent>
                </Card>
              </Link>
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
<Link href="/service-areas/glen-mills-pa">
                <Card className="bg-emerald-50 hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">Glen Mills, PA</span>
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

      <!-- Our Services in Downingtown -->
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Pest Control Services in Downingtown
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From wildlife removal to termite protection, we offer comprehensive pest management tailored to Downingtown properties.
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


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleReviewRequest />
      </div>
    </div>
  );
}
