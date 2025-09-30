import LocalSEO from '@/components/local-seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import ScheduleInspectionModal from '@/components/schedule-inspection-modal';
import GoogleBusinessIntegration from '@/components/google-business-integration';
import GoogleReviewRequest from '@/components/google-review-request';

export default function ServiceAreas() {
  const serviceAreas = [
    {
      state: 'Pennsylvania',
      phone: '610-325-4000 or 484-643-2225',
      counties: ['Chester County', 'Delaware County', 'Montgomery County'],
      cities: ['West Grove', 'Oxford', 'Kennett Square', 'Avondale', 'Toughkenamon', 'Media', 'Chester', 'Aston', 'Brookhaven', 'Norristown', 'King of Prussia', 'Collegeville', 'Pottstown', 'Newtown Square']
    },
    {
      state: 'Delaware',
      phone: '302-235-1975',
      counties: ['New Castle County'],
      cities: ['Hockessin', 'Newark', 'Wilmington', 'Bear', 'Middletown', 'New Castle', 'Pike Creek', 'Claymont', 'Elsmere']
    },
    {
      state: 'Maryland',
      phone: '610-325-4000',
      counties: ['Northeast Maryland'],
      cities: ['Elkton', 'North East', 'Perryville', 'Port Deposit', 'Rising Sun', 'Conowingo', 'Cecilton']
    }
  ];

  const services = [
    'Wildlife Control & Removal',
    'Bed Bug Treatment',
    'Termite Inspection & Treatment',
    'Bat Removal Services',
    'Rodent Control',
    'Ant & Insect Control',
    'Preventive Pest Management'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <LocalSEO 
        title="Service Areas - Professional Pest Control Coverage"
        description="Absolute Pest Services provides professional pest control throughout Chester County, Delaware County, Montgomery County PA, New Castle County DE, and Northeast MD. Local phone numbers and emergency services available."
        serviceArea="Pennsylvania, Delaware, Maryland"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Service Areas
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Professional pest control services across Pennsylvania, Delaware, and Maryland. 
            Local phone numbers and emergency response available in all coverage areas.
          </p>
        </div>

        {/* Service Areas Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {serviceAreas.map((area, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {area.state}
                </CardTitle>
                <CardDescription className="flex items-center justify-center gap-2 text-lg">
                  <Phone className="h-5 w-5" />
                  {area.phone}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Counties Served:</h4>
                    <ul className="space-y-1">
                      {area.counties.map((county, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {county}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Cities & Towns:</h4>
                    <div className="grid grid-cols-2 gap-1 text-sm text-gray-600 dark:text-gray-300">
                      {area.cities.map((city, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-emerald-500" />
                          {city}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Google Business Integration */}
        <div className="mb-12">
          <GoogleBusinessIntegration />
        </div>

        {/* Business Hours & Contact */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Monday - Friday:</span>
                  <span>8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Saturday:</span>
                  <span>8:00 AM - 12:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday:</span>
                  <span>Emergency Calls Only</span>
                </div>
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    <strong>Emergency Services:</strong> Available 24/7 for urgent wildlife intrusions and pest emergencies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Main Office Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Absolute Pest Services</p>
                  <p className="text-gray-600 dark:text-gray-300">21 Sheffield Dr</p>
                  <p className="text-gray-600 dark:text-gray-300">West Grove, PA 19390</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm"><strong>PA:</strong> 610-325-4000 or 484-643-2225</p>
                  <p className="text-sm"><strong>DE:</strong> 302-235-1975</p>
                </div>
                <div className="pt-2">
                  <Link href="/request-service">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      Request Service Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Services Offered */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Professional Pest Control Services
            </CardTitle>
            <CardDescription>
              Complete pest management solutions available in all service areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-gray-900 dark:text-white">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Google Review Request */}
        <div className="mb-12">
          <GoogleReviewRequest />
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Schedule Your Service?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Contact us today for a free inspection and customized pest control solution
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ScheduleInspectionModal>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4">
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
            <Link href="/request-service">
              <Button size="lg" variant="outline" className="px-8 py-4">
                Request Service Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}