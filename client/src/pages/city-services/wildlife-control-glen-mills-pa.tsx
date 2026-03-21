import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, Shield, Bug, AlertTriangle, Search } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleReviewRequest from '@/components/google-review-request';

export default function WildlifeRodentControlGlenMillsPa() {
  const neighborhoods = ["Glen Mills","Thornbury Township","Chester Heights","Concord Township","Garnet Valley"];

  const bulletPoints = ["Raccoon removal & exclusion","Squirrel & flying squirrel control","Groundhog (woodchuck) removal","Opossum trapping & relocation","Mouse & rat control programs","Attic & crawl space exclusion","Entry point sealing & structural repairs","Dead animal removal"];

  const faqs = [{"q":"What wildlife is most common in Glen Mills, PA?","a":"Raccoons, squirrels, mice, and groundhogs are the most frequent calls in Glen Mills. We also handle foxes, opossums, and the occasional skunk. Seasonal shifts bring different species — attic intrusions peak in fall and winter."},{"q":"Is wildlife removal in Glen Mills humane?","a":"Yes. We use live trapping and exclusion methods approved by Pennsylvania and Delaware wildlife authorities. Animals are relocated according to state regulations. We never use inhumane methods."},{"q":"Will mice in my Glen Mills home come back after treatment?","a":"Not if we do our job correctly. Our rodent program combines population reduction (trapping/baiting) with exclusion — sealing every gap larger than a dime. Without exclusion, mice always come back."},{"q":"How quickly can you remove a raccoon from my Glen Mills attic?","a":"We offer same-day response for most wildlife emergencies throughout Glen Mills and PA. Call 484-643-2225 for urgent wildlife situations."}];

  const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "name": "Absolute Pest Services",
      "telephone": "484-643-2225",
      "url": "https://absolutepestservices.com",
      "image": "https://absolutepestservices.com/og-image.jpg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "21 Sheffield Dr",
        "addressLocality": "West Grove",
        "addressRegion": "PA",
        "postalCode": "19390",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "39.9001",
        "longitude": "-75.5155"
      },
      "areaServed": {
        "@type": "City",
        "name": "Glen Mills",
        "containedInPlace": {
          "@type": "AdministrativeArea",
          "name": "Chester County",
          "containedInPlace": {
            "@type": "State",
            "name": "Pennsylvania"
          }
        }
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Wildlife & Rodent Control",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Wildlife & Rodent Control in Glen Mills, PA",
              "description": "Glen Mills, PA homeowners regularly encounter raccoons, squirrels, groundhogs, opossums, foxes, and mice seeking shelter. With the proximity to Ridley Creek State Park and the Garnet Valley wildlife c"
            }
          }
        ]
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What wildlife is most common in Glen Mills, PA?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Raccoons, squirrels, mice, and groundhogs are the most frequent calls in Glen Mills. We also handle foxes, opossums, and the occasional skunk. Seasonal shifts bring different species — attic intrusions peak in fall and winter."
          }
        },
        {
          "@type": "Question",
          "name": "Is wildlife removal in Glen Mills humane?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We use live trapping and exclusion methods approved by Pennsylvania and Delaware wildlife authorities. Animals are relocated according to state regulations. We never use inhumane methods."
          }
        },
        {
          "@type": "Question",
          "name": "Will mice in my Glen Mills home come back after treatment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Not if we do our job correctly. Our rodent program combines population reduction (trapping/baiting) with exclusion — sealing every gap larger than a dime. Without exclusion, mice always come back."
          }
        },
        {
          "@type": "Question",
          "name": "How quickly can you remove a raccoon from my Glen Mills attic?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer same-day response for most wildlife emergencies throughout Glen Mills and PA. Call 484-643-2225 for urgent wildlife situations."
          }
        }
      ]
    }
  ]
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Wildlife & Rodent Control in Glen Mills, PA | Absolute Pest Services</title>
        <meta name="description" content="Expert wildlife & rodent control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service." />
        <link rel="canonical" href="https://absolutepestservices.com/wildlife-control-glen-mills-pa/" />
        <meta property="og:title" content="Wildlife & Rodent Control in Glen Mills, PA | Absolute Pest Services" />
        <meta property="og:description" content="Expert wildlife & rodent control in Glen Mills, PA. Licensed & insured. Serving Chester County. Free inspection available. Call 484-643-2225 for fast service." />
        <meta property="og:url" content="https://absolutepestservices.com/wildlife-control-glen-mills-pa/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center bg-white/10 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-4 h-4 mr-2" />
            Glen Mills, PA · Chester County
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Wildlife & Rodent Control in Glen Mills, PA
          </h1>
          <p className="text-xl text-green-100 mb-4 max-w-3xl mx-auto">
            Humane Wildlife Removal & Rodent Exclusion
          </p>
          <p className="text-green-200 mb-8 max-w-2xl mx-auto">
            Glen Mills' affluent suburban communities border Ridley Creek State Park, creating exceptional wildlife pressure alongside termite and rodent risk from the surrounding forested landscape.
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Wildlife & Rodent Control in Glen Mills, PA</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Glen Mills, PA homeowners regularly encounter raccoons, squirrels, groundhogs, opossums, foxes, and mice seeking shelter. With the proximity to Ridley Creek State Park and the Garnet Valley wildlife corridor, wildlife pressure in Glen Mills is elevated compared to more urbanized areas. Our licensed wildlife control team removes animals humanely and seals entry points to prevent re-entry — addressing the problem at its source.
              </p>
              <Link href="/wildlife-control">
                <Button variant="outline" className="px-6 py-3">Wildlife Control Info →</Button>
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
              Serving Glen Mills &amp; Surrounding Neighborhoods
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our technicians know every neighborhood in and around Glen Mills, PA.
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
            Why Glen Mills Trusts Absolute Pest Services
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Licensed & Certified', body: 'Fully licensed in Pennsylvania and Delaware. All technicians are state-certified pest control applicators.', color: 'bg-[hsl(132,48%,35%)]' },
              { title: 'Locally Owned', body: 'Based in West Grove, PA — your neighbors in pest control. Chester County and New Castle County specialists.', color: 'bg-[hsl(36,100%,47%)]' },
              { title: '5.0 Star Rated', body: 'Consistent 5-star Google reviews from homeowners throughout Glen Mills and surrounding communities.', color: 'bg-[hsl(207,73%,44%)]' },
              { title: '24/7 Emergency', body: 'Pest emergencies do not keep business hours. Our team is available around the clock for urgent situations.', color: 'bg-[hsl(132,48%,25%)]' },
            ].map((card, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
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
            Frequently Asked Questions — Wildlife & Rodent Control in Glen Mills
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
          <h2 className="text-3xl font-bold text-white mb-4">Wildlife Problem in Glen Mills? We Can Help.</h2>
          <p className="text-xl text-green-100 mb-8">From raccoons in the attic to mice in the walls, our team handles all wildlife and rodent situations in Glen Mills, PA with humane, permanent solutions.</p>
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
            Other Services We Offer in Glen Mills, PA
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/termites"><Button variant="outline">Termite Treatment</Button></Link>
            <Link href="/wildlife-control"><Button variant="outline">Wildlife Control</Button></Link>
            <Link href="/pest-control"><Button variant="outline">Ant &amp; Wasp Control</Button></Link>
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
