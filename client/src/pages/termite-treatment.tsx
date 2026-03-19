import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Home, Clock, CheckCircle, AlertTriangle, Search } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";

export default function TermiteTreatment() {
  useEffect(() => {
    // Service schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Termite Treatment",
      "provider": {
        "@type": "LocalBusiness",
        "name": "Absolute Pest Services",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "21 Sheffield Dr",
          "addressLocality": "West Grove",
          "addressRegion": "PA",
          "postalCode": "19390"
        },
        "telephone": "+1-610-325-4000"
      },
      "areaServed": "Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE",
      "serviceType": "Pest Control"
    };
    const svcScript = document.createElement('script');
    svcScript.type = 'application/ld+json';
    svcScript.setAttribute('data-schema', 'service-termite');
    svcScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(svcScript);

    // FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I know if I have termites?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Warning signs include mud tubes along your foundation, hollow-sounding wood, discarded wings near windowsills, small sawdust-like frass near wood structures, and doors or windows that suddenly stick."
          }
        },
        {
          "@type": "Question",
          "name": "What termite treatment options do you offer?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer liquid barrier treatments, termite baiting systems, direct wood treatment, and ongoing monitoring programs. Our licensed technicians recommend the best solution based on your specific situation."
          }
        },
        {
          "@type": "Question",
          "name": "How long does termite treatment last?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Liquid barrier treatments typically last 5–10 years. Baiting systems provide ongoing protection with regular monitoring. We offer annual inspection and maintenance programs for continued peace of mind."
          }
        },
        {
          "@type": "Question",
          "name": "Do you provide termite inspection reports for home sales?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We provide official termite inspection reports (WDI reports) commonly required for real estate transactions throughout PA, DE, and MD."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-termite');
    faqScript.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(faqScript);

    // Breadcrumb schema
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://absolutepestservices.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Termite Treatment",
          "item": "https://absolutepestservices.com/termite-treatment"
        }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-termite');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelector('script[data-schema="service-termite"]')?.remove();
      document.querySelector('script[data-schema="faq-termite"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb-termite"]')?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Termite Inspection &amp; Treatment Services | Absolute Pest Services PA, DE, MD</title>
        <meta name="description" content="Licensed termite inspection, treatment &amp; prevention in PA, DE &amp; MD. Liquid barriers, baiting systems &amp; ongoing monitoring. Protect your home from costly termite damage. Call 610-869-3000." />
        <link rel="canonical" href="https://absolutepestservices.com/termite-treatment" />
        <meta property="og:title" content="Termite Inspection &amp; Treatment Services | Absolute Pest Services" />
        <meta property="og:description" content="Licensed termite inspection, treatment &amp; prevention in PA, DE &amp; MD. Liquid barriers, baiting systems &amp; ongoing monitoring to protect your home." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/termite-treatment" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Termite Inspection &amp; Treatment | Absolute Pest Services" />
        <meta name="twitter:description" content="Licensed termite inspection, treatment &amp; prevention in PA, DE &amp; MD. Protect your home from costly damage." />
      </Helmet>
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
              <AbsoluteLogoSimple />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm text-[hsl(210,13%,28%)]">24/7 Emergency Service</span>
                <span className="text-lg font-semibold text-[hsl(132,48%,35%)]">610-869-3000</span>
              </div>
              <QuoteRequestModal>
                <Button className="bg-[hsl(36,100%,47%)] text-white hover:bg-[hsl(36,100%,37%)] font-medium">
                  Get Quote
                </Button>
              </QuoteRequestModal>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[hsl(36,100%,47%)] to-[hsl(36,100%,37%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Comprehensive Termite Protection
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Protect your most valuable investment with our comprehensive termite inspections, 
            treatments, and baiting systems. Don't let termites destroy your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[hsl(36,100%,47%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </Button>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(132,48%,35%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(132,48%,25%)]">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>

      {/* Service Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-6">
                Protect Your Home's Foundation
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Termites cause billions of dollars in property damage each year, often going undetected 
                until significant structural damage has occurred. Our comprehensive termite protection 
                program includes thorough inspections, advanced treatment options, and ongoing monitoring.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We use the latest technology including liquid barriers, baiting systems, and monitoring 
                stations to create a complete protection system around your property. Our licensed 
                technicians provide detailed reports and recommendations for long-term protection 
                throughout Chester County, Delaware County, and the greater tri-state area.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mr-3">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Thorough Inspections</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Advanced Treatment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Ongoing Protection</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(36,100%,47%)] rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Licensed Experts</span>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Termite inspection and treatment" 
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Warning Signs */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Warning Signs of Termite Activity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Early detection is crucial. Watch for these signs of termite activity around your property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Mud Tubes",
                description: "Pencil-thick mud tubes along foundation walls, floor joists, or other surfaces connecting soil to wood.",
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                title: "Swarmers",
                description: "Winged termites or discarded wings near windowsills, doors, or other entry points, especially in spring.",
                color: "bg-[hsl(132,48%,35%)]"
              },
              {
                title: "Wood Damage",
                description: "Hollow-sounding wood when tapped, or wood that appears damaged along the grain pattern.",
                color: "bg-[hsl(207,73%,44%)]"
              },
              {
                title: "Frass",
                description: "Small piles of wood-colored droppings or sawdust-like material near wooden structures.",
                color: "bg-red-600"
              },
              {
                title: "Tight Fitting Doors",
                description: "Doors or windows that suddenly become difficult to open or close due to moisture and warping.",
                color: "bg-purple-600"
              },
              {
                title: "Sagging Floors",
                description: "Floors that sag or feel spongy underfoot, indicating potential structural damage beneath.",
                color: "bg-teal-600"
              }
            ].map((sign, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${sign.color} rounded-full flex items-center justify-center mb-4`}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">
                    {sign.title}
                  </h3>
                  <p className="text-gray-600">
                    {sign.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Treatment Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Our Termite Treatment Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer multiple treatment options to effectively eliminate termites and protect your property.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Liquid Barrier Treatment",
                description: "Creates a protective chemical barrier around your home's foundation that termites cannot cross. Long-lasting protection with immediate results.",
                features: ["Immediate protection", "Long-lasting barrier", "Proven effectiveness", "Professional application"],
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                title: "Termite Baiting System",
                description: "Strategic placement of bait stations around your property that termites carry back to the colony, eliminating the entire colony.",
                features: ["Colony elimination", "Environmentally friendly", "Ongoing monitoring", "Minimal disruption"],
                color: "bg-[hsl(132,48%,35%)]"
              },
              {
                title: "Wood Treatment",
                description: "Direct treatment of infested wood structures using specialized products that penetrate deep into wood fibers.",
                features: ["Direct application", "Deep penetration", "Structural protection", "Quick results"],
                color: "bg-[hsl(207,73%,44%)]"
              },
              {
                title: "Monitoring & Maintenance",
                description: "Regular inspections and monitoring to ensure continued protection and early detection of new termite activity.",
                features: ["Regular inspections", "Early detection", "Ongoing protection", "Peace of mind"],
                color: "bg-purple-600"
              }
            ].map((treatment, index) => (
              <Card key={index} className="bg-[hsl(0,0%,98%)]">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 ${treatment.color} rounded-full flex items-center justify-center mb-6`}>
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-[hsl(210,13%,28%)] mb-4">
                    {treatment.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {treatment.description}
                  </p>
                  <ul className="space-y-2">
                    {treatment.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-[hsl(132,48%,35%)] mr-2" />
                        <span className="text-[hsl(210,13%,28%)]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[hsl(36,100%,47%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Don't Wait - Protect Your Investment Today
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Termite damage can be costly and extensive. Early detection and treatment are key to 
            protecting your home. Schedule your inspection today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-[hsl(36,100%,47%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </Button>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(132,48%,35%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(132,48%,25%)]">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Inspection
              </Button>
            </ScheduleInspectionModal>
          </div>
        </div>
      </section>
    </div>
  );
}