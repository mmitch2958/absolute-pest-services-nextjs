import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleReviewRequest from '@/components/google-review-request';

export default function GlenMillsPA() {
  const neighborhoods = ["Glen Mills","Thornbury Township","Chester Heights","Concord Township","Garnet Valley","Aston vicinity"];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control',
  ];

  const faqs = [{"q":"Does living near Ridley Creek State Park increase pest risk in Glen Mills?","a":"Significantly. Ridley Creek State Park is a major wildlife reservoir. Raccoons, squirrels, deer, foxes, and even black bears have been spotted in Glen Mills neighborhoods adjacent to the park."},{"q":"Are termites a problem in Glen Mills new construction?","a":"Yes. Even newer construction near wooded lots in Thornbury Township and Garnet Valley can have termite pressure from surrounding woodland. Pre-treatment and annual inspections are advised."},{"q":"What should Glen Mills homeowners know about stink bugs?","a":"Glen Mills is firmly in Chester County stink bug territory. Our fall barrier applications prevent thousands of stink bugs from overwintering in your walls and attic."},{"q":"Do you service the Garnet Valley and Chester Heights areas?","a":"Yes. Glen Mills, Garnet Valley, Chester Heights, and Thornbury Township are all within our Chester County service area."}];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <Helmet>
        <title>Glen Mills PA Pest Control Services | Absolute Pest Services</title>
        <meta name="description" content="Glen Mills, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225." />
        <link rel="canonical" href="https://absolutepestservices.com/service-areas/glen-mills-pa" />
        <meta property="og:title" content="Glen Mills PA Pest Control Services | Absolute Pest Services" />
        <meta property="og:description" content="Glen Mills, PA pest control: wildlife removal, termite treatment, bed bug control & rodent extermination. Serving Chester County. Licensed & insured. Call 484-643-2225." />
        <meta property="og:url" content="https://absolutepestservices.com/service-areas/glen-mills-pa" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({"@context":"https://schema.org","@type":"LocalBusiness","name":"Absolute Pest Services – Glen Mills, PA Pest Control Services","telephone":"484-643-2225","address":{"@type":"PostalAddress","streetAddress":"21 Sheffield Dr","addressLocality":"West Grove","addressRegion":"PA","postalCode":"19390","addressCountry":"US"},"areaServed":"Glen Mills, PA","url":"https://absolutepestservices.com/service-areas/glen-mills-pa"})}</script>
      </Helmet>

      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Glen Mills, PA Pest Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Glen Mills' affluent suburban communities border Ridley Creek State Park, creating exceptional wildlife pressure alongside termite and rodent risk from the surrounding forested landscape.
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Neighborhoods We Serve in Glen Mills</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control throughout the Glen Mills, PA area.
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
                  <p className="text-sm text-gray-600 mt-1">PA</p>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Pest Control Services in Glen Mills</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management solutions for Glen Mills, PA homes and businesses.
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
          <h2 className="text-4xl font-bold text-gray-900 mb-10 text-center">Glen Mills Pest Control FAQs</h2>
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
