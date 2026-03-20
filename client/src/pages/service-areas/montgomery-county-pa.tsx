import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, MapPin, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import { AbsoluteLogoSimple } from '@/components/absolute-logo';
import GoogleReviewRequest from '@/components/google-review-request';

export default function MontgomeryCountyPA() {
  const cities = [
    'Norristown',
    'King of Prussia',
    'Collegeville',
    'Pottstown',
    'Lansdale',
    'Hatfield',
    'Blue Bell',
    'Conshohocken'
  ];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-emerald-50">
      <Helmet>
        <title>Montgomery County PA Pest Control Services | Absolute Pest Services</title>
        <meta name="description" content="Montgomery County PA: Expert pest control in Norristown, King of Prussia, Collegeville, Pottstown. Licensed, insured, emergency service available." />
        <link rel="canonical" href="https://absolutepestservices.com/service-areas/montgomery-county-pa" />
      </Helmet>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(36,100%,47%)] to-[hsl(36,100%,37%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Montgomery County, PA Pest Control Services
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Professional pest control services throughout Montgomery County, Pennsylvania. 
            Protecting homes in Norristown, King of Prussia, and surrounding communities 
            with safe, effective treatments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+14846432225" className="inline-flex items-center bg-white text-[hsl(36,100%,47%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 484-643-2225
            </a>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(132,48%,35%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(132,48%,25%)]">
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
              Cities We Serve in Montgomery County
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Fast, reliable pest control services for homeowners and businesses 
              across Montgomery County, PA.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {cities.map((city, index) => (
              <Card key={index} className="bg-purple-50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mx-auto mb-3">
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
              Pest Control Services in Montgomery County
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete pest management solutions for your Montgomery County property.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center flex-shrink-0">
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

      {/* Contact Info */}
      <section className="py-16 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Call Us</h3>
                <p className="text-2xl font-bold text-[hsl(36,100%,47%)]">484-643-2225</p>
                <p className="text-gray-600 mt-2">24/7 Emergency Service</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-4">
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
