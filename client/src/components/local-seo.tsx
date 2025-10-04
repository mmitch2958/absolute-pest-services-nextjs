import { useEffect } from 'react';

interface LocalSEOProps {
  title?: string;
  description?: string;
  serviceName?: string;
  serviceArea?: string;
  schemaType?: 'LocalBusiness' | 'Service' | 'WebPage';
}

export default function LocalSEO({ 
  title = "Professional Pest Control Services", 
  description = "Expert pest control services in PA, DE, and MD. Humane wildlife control, bed bug treatment, termite control, and bat removal. Licensed and insured.",
  serviceName,
  serviceArea,
  schemaType = 'LocalBusiness'
}: LocalSEOProps) {
  
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://absolutepestservices.com",
    "name": "Absolute Pest Services",
    "image": "https://absolutepestservices.com/logo.png",
    "telephone": [
      "+1-610-325-4000",
      "+1-484-643-2225",
      "+1-302-235-1975"
    ],
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
      "latitude": "39.8221",
      "longitude": "-75.8274"
    },
    "url": "https://absolutepestservices.com",
    "sameAs": [
      "https://www.google.com/maps/place/Absolute+Pest+Services",
      "https://www.facebook.com/absolutepestservices",
      "https://www.yelp.com/biz/absolute-pest-services",
      "https://www.bbb.org/absolute-pest-services"
    ],
    "priceRange": "$$",
    "paymentAccepted": "Cash, Credit Card, Check",
    "currenciesAccepted": "USD",
    "areaServed": [
      {
        "@type": "City",
        "name": "West Grove",
        "containedInPlace": {
          "@type": "State",
          "name": "Pennsylvania"
        }
      },AdministrativeArea
      {
        "@type": "",
        "name": "Chester County",
        "containedInPlace": {
          "@type": "State",
          "name": "Pennsylvania"
        }
      },
      {
        "@type": "AdministrativeArea",
        "name": "Delaware County",
        "containedInPlace": {
          "@type": "State",
          "name": "Pennsylvania"
        }
      },
      {
        "@type": "AdministrativeArea",
        "name": "Montgomery County",
        "containedInPlace": {
          "@type": "State",
          "name": "Pennsylvania"
        }
      },
      {
        "@type": "AdministrativeArea",
        "name": "New Castle County",
        "containedInPlace": {
          "@type": "State",
          "name": "Delaware"
        }
      },
      {
        "@type": "City",
        "name": "Hockessin",
        "containedInPlace": {
          "@type": "State",
          "name": "Delaware"
        }
      },
      {
        "@type": "City",
        "name": "Newark",
        "containedInPlace": {
          "@type": "State",
          "name": "Delaware"
        }
      },
      {
        "@type": "City",
        "name": "Wilmington",
        "containedInPlace": {
          "@type": "State",
          "name": "Delaware"
        }
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Pest Control Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Wildlife Control",
            "description": "Humane wildlife removal and exclusion services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bed Bug Treatment",
            "description": "Comprehensive bed bug inspection and treatment"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Termite Treatment",
            "description": "Termite inspection, treatment, and prevention"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Bat Removal",
            "description": "Safe and humane bat removal services"
          }
        }
      ]
    },
    "openingHours": [
      "Mo-Fr 08:00-17:00",
      "Sa 08:00-12:00"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-610-325-4000",
      "contactType": "Customer Service",
      "availableLanguage": "English"
    }
  };

  const serviceSchema = serviceName ? {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
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
    "areaServed": serviceArea || "Chester County, PA",
    "serviceType": "Pest Control"
  } : null;

  const pageTitle = `${title} | Absolute Pest Services - PA, DE, MD`;
  const pageDescription = description + " Serving Chester County, Delaware County, Montgomery County PA, New Castle County DE, and Northeast MD.";

  useEffect(() => {
    // Update page title
    document.title = pageTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', pageDescription);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = pageDescription;
      document.head.appendChild(meta);
    }
    
    // Add local SEO meta tags
    const localSeoMetas = [
      { name: 'geo.region', content: 'US-PA' },
      { name: 'geo.placename', content: 'West Grove, PA' },
      { name: 'geo.position', content: '39.8221;-75.8274' },
      { name: 'ICBM', content: '39.8221, -75.8274' },
      { name: 'keywords', content: 'pest control, exterminator, wildlife control, bed bugs, termites, bat removal, Chester County, Delaware County, Montgomery County, New Castle County, West Grove, Hockessin, Newark, Wilmington, Pennsylvania, Delaware, Maryland' }
    ];
    
    localSeoMetas.forEach(({ name, content }) => {
      let existingMeta = document.querySelector(`meta[name="${name}"]`);
      if (existingMeta) {
        existingMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
    
    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: pageDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://absolutepestservices.com' },
      { property: 'og:image', content: 'https://absolutepestservices.com/logo.png' },
      { property: 'og:locale', content: 'en_US' }
    ];
    
    ogTags.forEach(({ property, content }) => {
      let existingMeta = document.querySelector(`meta[property="${property}"]`);
      if (existingMeta) {
        existingMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
    
    // Add Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: pageDescription },
      { name: 'twitter:image', content: 'https://absolutepestservices.com/logo.png' }
    ];
    
    twitterTags.forEach(({ name, content }) => {
      let existingMeta = document.querySelector(`meta[name="${name}"]`);
      if (existingMeta) {
        existingMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });
    
    // Add structured data
    const existingBusinessSchema = document.querySelector('script[data-schema="business"]');
    if (existingBusinessSchema) {
      existingBusinessSchema.remove();
    }
    
    const businessScript = document.createElement('script');
    businessScript.type = 'application/ld+json';
    businessScript.setAttribute('data-schema', 'business');
    businessScript.textContent = JSON.stringify(businessSchema);
    document.head.appendChild(businessScript);
    
    // Add service schema if provided
    if (serviceSchema) {
      const existingServiceSchema = document.querySelector('script[data-schema="service"]');
      if (existingServiceSchema) {
        existingServiceSchema.remove();
      }
      
      const serviceScript = document.createElement('script');
      serviceScript.type = 'application/ld+json';
      serviceScript.setAttribute('data-schema', 'service');
      serviceScript.textContent = JSON.stringify(serviceSchema);
      document.head.appendChild(serviceScript);
    }
  }, [pageTitle, pageDescription, serviceSchema]);
  
  return null;
}