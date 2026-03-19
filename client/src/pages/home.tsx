import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, MapPin, Clock, Mail, Check, Bug, Bed, Home as HomeIcon, Crown, Facebook, Twitter, Instagram, User } from "lucide-react";
import HeroSlider from "@/components/hero-slider";
import ContactForm from "@/components/contact-form";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import GoogleBusinessIntegration, { GoogleBusinessSchema } from "@/components/google-business-integration";
import GoogleReviewRequest from "@/components/google-review-request";
import SeasonalAlerts from "@/components/seasonal-alerts";
import pestControlTeamImage from "@assets/istockphoto-594474798-612x612_1758123737181.jpg";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const services = [
    {
      icon: <Bug className="w-8 h-8 text-white" />,
      title: "Wildlife Control",
      description: "Professional wildlife removal and exclusion services to protect your property from unwanted animals.",
      color: "bg-[hsl(132,48%,35%)]",
      textColor: "text-[hsl(132,48%,35%)]",
      hoverColor: "hover:text-[hsl(132,48%,25%)]",
      route: "/wildlife-control"
    },
    {
      icon: <Bed className="w-8 h-8 text-white" />,
      title: "Bed Bug Treatment",
      description: "Complete bed bug elimination using proven methods. Get back to peaceful sleep with our effective treatments.",
      color: "bg-[hsl(207,73%,44%)]",
      textColor: "text-[hsl(207,73%,44%)]",
      hoverColor: "hover:text-[hsl(207,73%,34%)]",
      route: "/bed-bug-treatment"
    },
    {
      icon: <HomeIcon className="w-8 h-8 text-white" />,
      title: "Termite Treatment",
      description: "Protect your investment with comprehensive termite inspections, treatments, and baiting systems.",
      color: "bg-[hsl(36,100%,47%)]",
      textColor: "text-[hsl(36,100%,47%)]",
      hoverColor: "hover:text-[hsl(36,100%,37%)]",
      route: "/termite-treatment"
    },
    {
      icon: <Crown className="w-8 h-8 text-white" />,
      title: "Bat Removal",
      description: "Safe and humane bat removal services with exclusion methods to prevent future infestations.",
      color: "bg-red-600",
      textColor: "text-red-600",
      hoverColor: "hover:text-red-700",
      route: "/bat-removal"
    }
  ];

  const serviceAreas = [
    {
      title: "Chester County, PA",
      color: "bg-[hsl(132,48%,35%)]",
      locations: ["West Chester", "Kennett Square", "Chadds Ford", "Oxford"]
    },
    {
      title: "Delaware County, PA",
      color: "bg-[hsl(207,73%,44%)]",
      locations: ["Glenn Mills", "Media", "Newtown Square", "And surrounding areas"]
    },
    {
      title: "Montgomery County, PA",
      color: "bg-[hsl(36,100%,47%)]",
      locations: ["Norristown", "King of Prussia", "Lansdale", "And surrounding areas"]
    },
    {
      title: "New Castle County, DE",
      color: "bg-red-600",
      locations: ["Hockessin", "Newark", "Wilmington", "And surrounding areas"]
    }
  ];

  const phoneNumbers = [
    { number: "484-643-2225", label: "Main Office" },
    { number: "610-325-4000", label: "Secondary" },
    { number: "302-235-1975", label: "Delaware" },
    { number: "484-643-2225", label: "Montgomery" }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Absolute Pest Services - Professional Pest Control in PA, DE, MD</title>
        <meta name="description" content="Expert pest control in Chester County, Delaware County &amp; Montgomery County PA, New Castle County DE, and Northeast MD. Wildlife control, bed bug treatment, termite control &amp; bat removal. Licensed, insured, 24/7 emergency service." />
        <link rel="canonical" href="https://absolutepestservices.com/" />
        <meta property="og:title" content="Absolute Pest Services - Professional Pest Control in PA, DE, MD" />
        <meta property="og:description" content="Expert pest control across PA, DE &amp; MD. Humane wildlife control, bed bug treatment, termite protection &amp; bat removal. Licensed, insured &amp; available 24/7." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/" />
        <meta property="og:image" content="https://absolutepestservices.com/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Absolute Pest Services - Professional Pest Control in PA, DE, MD" />
        <meta name="twitter:description" content="Expert pest control in PA, DE &amp; MD. Humane wildlife control, bed bug treatment, termite protection &amp; bat removal." />
      </Helmet>
      <GoogleBusinessSchema />
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <AbsoluteLogoSimple />
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button onClick={() => scrollToSection('home')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Home</button>
              <button onClick={() => scrollToSection('services')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Services</button>
              <button onClick={() => window.location.href = '/service-areas'} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Service Areas</button>
              <button onClick={() => window.location.href = '/blog'} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Blog</button>
              <button onClick={() => scrollToSection('about')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">About</button>
              <button onClick={() => scrollToSection('contact')} className="text-[hsl(210,13%,28%)] hover:text-[hsl(132,48%,35%)] transition-colors font-medium">Contact</button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm text-[hsl(210,13%,28%)]">24/7 Emergency Service</span>
                <span className="text-lg font-semibold text-[hsl(132,48%,35%)]">484-643-2225</span>
              </div>
              <QuoteRequestModal>
                <Button className="bg-[hsl(36,100%,47%)] text-white hover:bg-[hsl(36,100%,37%)] font-medium">
                  Get Quote
                </Button>
              </QuoteRequestModal>
            </div>

            <button 
              className="md:hidden text-[hsl(210,13%,28%)]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative h-screen overflow-hidden">
        <HeroSlider />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Professional Pest Control Services in <br />
              <span className="text-[hsl(36,100%,47%)]">Chester County, PA & Northern Delaware</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 leading-relaxed">
              Expert pest control services across Chester County, Delaware County, Montgomery County PA, 
              New Castle County DE, and Northeast MD. Humane wildlife control, bed bug treatment, 
              termite control, and bat removal — licensed and insured.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[hsl(132,48%,35%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(132,48%,25%)]">
                <Phone className="mr-2 h-5 w-5" />
                Call Now: 484-643-2225
              </Button>
              <ScheduleInspectionModal>
                <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Inspection
                </Button>
              </ScheduleInspectionModal>
              <Button 
                className="bg-[hsl(207,73%,44%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(207,73%,34%)]"
                onClick={() => window.location.href = '/auth'}
              >
                <User className="mr-2 h-5 w-5" />
                Client Login
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SeasonalAlerts />
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">Our Professional Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive pest control solutions for residential and commercial properties. 
              Our experienced team handles all types of pest problems with safe, effective treatments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-[hsl(0,0%,98%)] hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = service.route}>
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-4">{service.title}</h3>
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  <button className={`${service.textColor} font-medium ${service.hoverColor} transition-colors`}>
                    Learn More →
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section id="areas" className="py-20 bg-gradient-to-br from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Our Service Areas</h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Proudly serving communities across Pennsylvania and Delaware with professional pest control services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceAreas.map((area, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${area.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-4">{area.title}</h3>
                  <ul className="text-gray-600 space-y-2">
                    {area.locations.map((location, locationIndex) => (
                      <li key={locationIndex}>{location}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={pestControlTeamImage} 
                alt="Professional pest control team" 
                className="rounded-xl shadow-lg object-cover"
                style={{ width: '300px', height: '400px', minWidth: '100px', flexShrink: 0 }}
              />
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-6">
                Professional, Courteous Pest Control
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Absolute Pest Service offers the best in professional pest control service to southeastern Pennsylvania and northern Delaware. Our staff's many years of experience ensures that your pest problems will be taken care of quickly and efficiently.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're dealing with wasp problems, ant infestations, bed bug issues, or any other pest concerns, our experienced team is available throughout our service area to provide immediate assistance.
              </p>
              
              <div className="space-y-4">
                {[
                  "Licensed & Insured Professionals",
                  "Emergency Service Available",
                  "Safe & Effective Treatment Methods",
                  "Satisfaction Guarantee"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mr-4">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-[hsl(210,13%,28%)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[hsl(210,13%,28%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Contact Us Today</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Don't wait! Get professional pest control service when you need it most. 
              We're available for emergency service calls.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="bg-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-[hsl(210,13%,28%)] mb-6">Get In Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(210,13%,28%)]">Main Office</h4>
                      <p className="text-gray-600">484-643-2225</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[hsl(207,73%,44%)] rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(210,13%,28%)]">Additional Lines</h4>
                      <p className="text-gray-600">610-325-4000 • 302-235-1975 • 484-643-2225</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mr-4">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(210,13%,28%)]">Emergency Service</h4>
                      <p className="text-gray-600">Available Same Day</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mr-4">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[hsl(210,13%,28%)]">Email</h4>
                      <a 
                        href="mailto:rob@absolutepestservices.com" 
                        className="text-gray-600 hover:text-[hsl(132,48%,35%)] transition-colors underline"
                      >
                        rob@absolutepestservices.com
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Google Business Integration */}
                <div className="mt-8">
                  <GoogleBusinessIntegration />
                </div>
                
                {/* Google Review Request */}
                <div className="mt-6">
                  <GoogleReviewRequest />
                </div>
              </CardContent>
            </Card>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-[hsl(132,48%,35%)] mb-4">
                <Bug className="inline mr-2" />
                Absolute Pest Services
              </div>
              <p className="text-gray-400 mb-4">
                Professional pest control service to southeastern Pennsylvania and northern Delaware. 
                Our experienced team is available for all your pest control needs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/wildlife-control" className="hover:text-white transition-colors">Wildlife Control</a></li>
                <li><a href="/bed-bug-treatment" className="hover:text-white transition-colors">Bed Bug Treatment</a></li>
                <li><a href="/termite-treatment" className="hover:text-white transition-colors">Termite Treatment</a></li>
                <li><a href="/bat-removal" className="hover:text-white transition-colors">Bat Removal</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Service Areas</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/service-areas/chester-county-pa" className="hover:text-white transition-colors">Chester County, PA</a></li>
                <li><a href="/service-areas/delaware-county-pa" className="hover:text-white transition-colors">Delaware County, PA</a></li>
                <li><a href="/service-areas/new-castle-county-de" className="hover:text-white transition-colors">New Castle County, DE</a></li>
                <li><a href="/service-areas/montgomery-county-pa" className="hover:text-white transition-colors">Montgomery County, PA</a></li>
                <li><a href="/service-areas/northeast-maryland" className="hover:text-white transition-colors">Northeast Maryland</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Absolute Pest Services. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
