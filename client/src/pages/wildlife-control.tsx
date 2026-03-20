import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, ArrowLeft, Shield, Heart, Clock, CheckCircle } from "lucide-react";
import { AbsoluteLogoSimple } from "@/components/absolute-logo";
import ScheduleInspectionModal from "@/components/schedule-inspection-modal";
import QuoteRequestModal from "@/components/quote-request-modal";

export default function WildlifeControl() {
  useEffect(() => {
    // LocalBusiness + Service schema
    const businessSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Wildlife Control",
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
    const bizScript = document.createElement('script');
    bizScript.type = 'application/ld+json';
    bizScript.setAttribute('data-schema', 'service-wildlife');
    bizScript.textContent = JSON.stringify(businessSchema);
    document.head.appendChild(bizScript);

    // FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What types of wildlife do you remove?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We handle raccoons, squirrels, opossums, skunks, bats, birds, groundhogs, and other nuisance wildlife using humane, non-lethal methods."
          }
        },
        {
          "@type": "Question",
          "name": "Is your wildlife removal humane?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We exclusively use non-kill, non-lethal extraction methods. Animals are safely captured and relocated away from your property."
          }
        },
        {
          "@type": "Question",
          "name": "How do you prevent wildlife from returning?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "After removal we seal all entry points, install exclusion barriers, and provide a full property assessment to identify and close potential re-entry locations."
          }
        },
        {
          "@type": "Question",
          "name": "Do you offer emergency wildlife removal?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We provide 24/7 emergency wildlife removal services throughout Chester County, Delaware County, Montgomery County PA, and New Castle County DE."
          }
        },
        {
          "@type": "Question",
          "name": "Are you licensed to perform wildlife removal in Pennsylvania and Delaware?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Absolute Pest Services is fully licensed and insured for wildlife control operations in Pennsylvania, Delaware, and Maryland."
          }
        }
      ]
    };
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.setAttribute('data-schema', 'faq-wildlife');
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
          "name": "Wildlife Control",
          "item": "https://absolutepestservices.com/wildlife-control"
        }
      ]
    };
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.setAttribute('data-schema', 'breadcrumb-wildlife');
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      document.querySelector('script[data-schema="service-wildlife"]')?.remove();
      document.querySelector('script[data-schema="faq-wildlife"]')?.remove();
      document.querySelector('script[data-schema="breadcrumb-wildlife"]')?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <Helmet>
        <title>Humane Wildlife Control &amp; Removal Services | Absolute Pest Services PA, DE, MD</title>
        <meta name="description" content="Professional humane wildlife removal in PA, DE &amp; MD. Non-kill extraction for raccoons, squirrels, opossums, skunks &amp; more. Licensed wildlife control specialists. Call 610-869-3000." />
        <link rel="canonical" href="https://absolutepestservices.com/wildlife-control" />
        <meta property="og:title" content="Humane Wildlife Control &amp; Removal Services | Absolute Pest Services" />
        <meta property="og:description" content="Professional humane wildlife removal in PA, DE &amp; MD. Non-kill extraction for raccoons, squirrels, opossums, skunks &amp; more. Licensed wildlife control specialists." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://absolutepestservices.com/wildlife-control" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Humane Wildlife Control &amp; Removal | Absolute Pest Services" />
        <meta name="twitter:description" content="Professional humane wildlife removal in PA, DE &amp; MD. Non-kill extraction for raccoons, squirrels, opossums &amp; more." />
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
      <section className="bg-gradient-to-r from-[hsl(132,48%,35%)] to-[hsl(132,48%,25%)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Professional Wildlife Control Services
          </h1>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Humane, non-lethal wildlife removal and exclusion services to protect your property 
            while ensuring the safety of animals and your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+16108693000" className="inline-flex items-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </a>
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
                Humane Wildlife Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our wildlife control services focus on humane, non-lethal methods to safely remove 
                unwanted animals from your property. We believe in protecting both your family and 
                the wildlife that may have found their way into your home or business.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Using proven exclusion techniques and safe removal methods, we ensure that animals 
                are relocated safely while preventing future intrusions through comprehensive 
                property assessments and repairs. Our wildlife control services cover Chester County, 
                Kennett Square, Hockessin, and surrounding communities in Pennsylvania and Delaware.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mr-3">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Humane Methods</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mr-3">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Safe Removal</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">24/7 Emergency</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[hsl(210,13%,28%)] font-medium">Prevention Focus</span>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://images.unsplash.com/photo-1615729947596-a598e5de52c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Wildlife control professional serving Chester County PA" 
                className="rounded-xl shadow-lg w-full h-auto"
                loading="lazy"
                width="1000"
                height="667"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Common Wildlife Issues */}
      <section className="py-20 bg-[hsl(0,0%,98%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Common Wildlife Issues We Handle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our experienced team handles a wide variety of wildlife situations with 
              safe, humane, and effective solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Raccoons",
                description: "Safe removal from attics, chimneys, and crawl spaces with exclusion repairs to prevent return.",
                color: "bg-[hsl(132,48%,35%)]"
              },
              {
                title: "Squirrels",
                description: "Humane capture and relocation with entry point sealing and damage repair services.",
                color: "bg-[hsl(207,73%,44%)]"
              },
              {
                title: "Opossums",
                description: "Non-lethal removal and habitat modification to discourage future visits to your property.",
                color: "bg-[hsl(36,100%,47%)]"
              },
              {
                title: "Skunks",
                description: "Safe extraction from under porches and sheds with odor-free removal techniques.",
                color: "bg-red-600"
              },
              {
                title: "Bats",
                description: "Specialized bat exclusion services following humane practices and legal requirements.",
                color: "bg-purple-600"
              },
              {
                title: "Birds",
                description: "Nest removal, bird proofing, and humane deterrent installation for problem areas.",
                color: "bg-teal-600"
              }
            ].map((animal, index) => (
              <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${animal.color} rounded-full flex items-center justify-center mb-4`}>
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(210,13%,28%)] mb-3">
                    {animal.title}
                  </h3>
                  <p className="text-gray-600">
                    {animal.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[hsl(210,13%,28%)] mb-4">
              Our Humane Wildlife Control Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every wildlife situation is handled with care, professionalism, and respect for both 
              property owners and the animals involved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Assessment",
                description: "Thorough property inspection to identify entry points, damage, and wildlife species."
              },
              {
                step: "2",
                title: "Safe Removal",
                description: "Humane capture and relocation using non-lethal methods and proper equipment."
              },
              {
                step: "3",
                title: "Exclusion",
                description: "Sealing entry points and installing barriers to prevent future intrusions."
              },
              {
                step: "4",
                title: "Prevention",
                description: "Ongoing monitoring and maintenance to ensure long-term wildlife control."
              }
            ].map((process, index) => (
              <Card key={index} className="bg-[hsl(0,0%,98%)] text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-[hsl(132,48%,35%)] rounded-full flex items-center justify-center mx-auto mb-4">
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

      {/* CTA Section */}
      <section className="py-20 bg-[hsl(132,48%,35%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Need Wildlife Control Services?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Don't let wildlife problems escalate. Contact our experienced team for safe, 
            humane, and effective wildlife control solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+16108693000" className="inline-flex items-center bg-white text-[hsl(132,48%,35%)] px-8 py-4 text-lg font-semibold hover:bg-gray-100 rounded-md">
              <Phone className="mr-2 h-5 w-5" />
              Call Now: 610-869-3000
            </a>
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