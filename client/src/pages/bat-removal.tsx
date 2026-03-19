import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Moon, Clock, CheckCircle, AlertTriangle, Eye } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";

export default function BatRemoval() {
  useEffect(() => {
    // Service schema
    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Bat Removal",
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
    svcScript.setAttribute('data-schema', 'service-bat');
    svcScript.textContent = JSON.stringify(serviceSchema);
    document.head.appendChild(svcScript);

    // FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is bat removal legal in Pennsylvania?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, but bats are protected wildlife and removal must follow state and federal regulations. Exclusion cannot be performed during maternity season (typically May–August) when flightless pups are present. Our licensed specialists ensure full legal compliance."
          }
        },
        {
          "@type": "Question",
          "name": "How do you remove bats from my home?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We use one-way exclusion devices that allow bats to exit naturally but prevent re-entry. Once all bats have left, we permanently seal all entry points and perform a full cleanup of guano and contaminated materials."
          }
        },
        {
          "@type": "Question",
          "name": "Are bats dangerous to my family?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Bats can carry rabies and their droppings (guano) can cause histoplasmosis, a respiratory illness. Never handle a bat directly. Call our team immediately for safe, professional removal."
          }
        },
        {
          "@type": "Question",
          "name": "How long does bat exclusion take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The exclusion process typically takes 1–2 weeks to ensure all bats have vacated before we seal entry points. The initial inspection and device installation can often be completed in one visit."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-bat');
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
          "name": "Bat Removal",
          "item": "https://absolutepestservices.com/bat-removal"
        }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-bat');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelector('script[data-schema="service-bat"]')?.remove();
      document.querySelector('script[data-schema="faq-bat"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb-bat"]')?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Professional Bat Removal &amp; Exclusion Services | Absolute Pest Services PA, DE, MD</title>
        <meta name="description" content="Safe, humane &amp; legal bat removal in PA, DE &amp; MD. One-way exclusion devices, guano cleanup &amp; permanent sealing. Licensed bat exclusion specialists. Call 610-869-3000 for an inspection." />
        <link rel="canonical" href="https://absolutepestservices.com/bat-removal" />
        <meta property="og:title" content="Professional Bat Removal &amp; Exclusion Services | Absolute Pest Services" />
        <meta property="og:description" content="Safe, humane &amp; legal bat removal in PA, DE &amp; MD. One-way exclusion devices, guano cleanup &amp; permanent sealing by licensed specialists." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/bat-removal" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bat Removal &amp; Exclusion Services | Absolute Pest Services" />
        <meta name="twitter:description" content="Safe, humane &amp; legal bat removal in PA, DE &amp; MD. Licensed specialists with one-way exclusion &amp; permanent sealing." />
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
      <section className="bg-gradient-to-r from-red-600 to-red-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Safe & Humane Bat Removal
          </h1>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Professional bat removal services with exclusion methods to prevent future infestations. 
            We follow all legal requirements and humane practices for safe bat removal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-red-600 px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </Button>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
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
                Professional Bat Exclusion Services
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Bats are protected wildlife that require specialized knowledge and techniques for safe, 
                legal removal. Our certified technicians understand bat behavior, roosting patterns, 
                and the legal requirements for humane bat exclusion.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We use one-way exclusion devices that allow bats to leave naturally but prevent their 
                return. Our methods comply with federal and state regulations while effectively solving 
                your bat problem without harming these beneficial animals. We provide professional bat 
                removal services across Pennsylvania, Delaware, and Maryland, including the greater 
                Philadelphia tri-state region.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Humane Methods</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Legal Compliance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Seasonal Timing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center mr-3">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Expert Assessment</span>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1604768277415-b2e3c3cb7e08?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Bat removal service Chester County PA" 
                className="rounded-xl shadow-lg w-full h-auto"
                loading="lazy"
                width="1000"
                height="667"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Bats Are Problematic */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Why Bats Need Professional Removal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              While bats are beneficial for pest control, they can create serious problems when they roost in homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Health Risks",
                description: "Bats can carry rabies and histoplasmosis. Their droppings (guano) can cause respiratory issues and disease transmission.",
                color: "bg-red-600"
              },
              {
                title: "Property Damage",
                description: "Accumulated guano and urine can damage insulation, ceiling tiles, and create persistent odors throughout the home.",
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                title: "Noise Disturbance",
                description: "Bats are active at night, creating scratching, chittering, and flapping sounds that disturb sleep and peace.",
                color: "bg-purple-600"
              },
              {
                title: "Rapid Reproduction",
                description: "Bat colonies can grow quickly, with females returning to the same roost annually to give birth to pups.",
                color: "bg-[hsl(132,48%,35%)]"
              },
              {
                title: "Difficult Access",
                description: "Bats roost in hard-to-reach areas like attics, wall voids, and soffits, requiring specialized equipment and expertise.",
                color: "bg-[hsl(207,73%,44%)]"
              },
              {
                title: "Legal Protection",
                description: "Many bat species are protected by law, requiring specific timing and methods for removal that only professionals know.",
                color: "bg-teal-600"
              }
            ].map((issue, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${issue.color} rounded-full flex items-center justify-center mb-4`}>
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">
                    {issue.title}
                  </h3>
                  <p className="text-gray-600">
                    {issue.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Exclusion Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Our Humane Bat Exclusion Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We follow a proven process that ensures complete bat removal while complying with all legal requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Inspection",
                description: "Thorough assessment to identify entry points, roost locations, and bat species for proper timing and approach.",
                color: "bg-red-600"
              },
              {
                step: "2",
                title: "Exclusion Setup",
                description: "Installation of one-way devices that allow bats to leave but prevent re-entry, timed according to bat lifecycle.",
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                step: "3",
                title: "Monitoring",
                description: "Careful observation to ensure all bats have left the structure before sealing entry points permanently.",
                color: "bg-[hsl(132,48%,35%)]"
              },
              {
                step: "4",
                title: "Sealing & Cleanup",
                description: "Complete sealing of entry points and professional cleanup of guano and contaminated materials.",
                color: "bg-[hsl(207,73%,44%)]"
              }
            ].map((process, index) => (
              <Card key={index} className="bg-[hsl(0,0%,98%)] text-center">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${process.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl font-bold text-white">{process.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">
                    {process.title}
                  </h3>
                  <p className="text-gray-600">
                    {process.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Important Information */}
      <section className="py-20 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-100 rounded-xl p-8 border-l-4 border-yellow-400">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mr-4" />
              <h3 className="text-2xl font-bold text-yellow-800">Important Legal Information</h3>
            </div>
            <div className="text-yellow-700 space-y-4">
              <p className="text-lg">
                <strong>Maternity Season:</strong> Bat exclusion cannot be performed during maternity season (typically May-August) 
                when flightless pups are present. This protects both the bats and ensures legal compliance.
              </p>
              <p className="text-lg">
                <strong>Protected Species:</strong> Many bat species are protected by federal and state laws. Only licensed 
                professionals should handle bat removal to ensure compliance with wildlife protection regulations.
              </p>
              <p className="text-lg">
                <strong>Health Precautions:</strong> Never attempt to handle bats yourself. Professional equipment and safety 
                protocols are essential due to potential disease transmission risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need Professional Bat Removal?
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Don't risk your health or legal complications. Our certified bat removal specialists 
            will handle your bat problem safely, humanely, and legally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-red-600 px-8 py-4 text-lg font-semibold hover:bg-gray-100">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </Button>
            <ScheduleInspectionModal>
              <Button className="bg-[hsl(36,100%,47%)] text-white px-8 py-4 text-lg font-semibold hover:bg-[hsl(36,100%,37%)]">
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