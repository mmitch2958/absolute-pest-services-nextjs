import { MapPin, Star, Phone, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleBusinessIntegration() {
  const businessInfo = {
    name: "Absolute Pest Services",
    address: "21 Sheffield Dr, West Grove, PA 19390",
    phone: "610-325-4000",
    rating: 4.8,
    reviewCount: 156,
    googleMapsUrl: "https://maps.google.com/maps?q=21+Sheffield+Dr,+West+Grove,+PA+19390",
    googleBusinessUrl: "https://g.co/kgs/4KuaC2E",
    hours: [
      { day: "Monday - Friday", time: "8:00 AM - 5:00 PM" },
      { day: "Saturday", time: "8:00 AM - 12:00 PM" },
      { day: "Sunday", time: "Emergency Calls Only" }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Google Business Profile CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-blue-800 dark:text-blue-200">
            <MapPin className="h-5 w-5" />
            Find Us on Google
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${star <= Math.floor(businessInfo.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {businessInfo.rating}
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              ({businessInfo.reviewCount} reviews)
            </span>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300">
              <strong>{businessInfo.name}</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {businessInfo.address}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.open(businessInfo.googleBusinessUrl, '_blank')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Google
            </Button>
            <Button 
              onClick={() => window.open(businessInfo.googleMapsUrl, '_blank')}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Get Directions
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Leave us a review on Google to help other customers find us!
          </p>
        </CardContent>
      </Card>
      
      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-600" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {businessInfo.hours.map((schedule, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {schedule.day}
                </span>
                <span className="text-gray-600 dark:text-gray-300">
                  {schedule.time}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <strong>24/7 Emergency Service Available</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Google Business Profile Schema Component
export function GoogleBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://absolutepestservices.com/#business",
    "name": "Absolute Pest Services",
    "image": [
      "https://absolutepestservices.com/images/business-exterior.jpg",
      "https://absolutepestservices.com/images/service-truck.jpg",
      "https://absolutepestservices.com/images/team-photo.jpg"
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
    "telephone": [
      "+1-610-325-4000",
      "+1-484-643-2225",
      "+1-302-235-1975"
    ],
    "url": "https://absolutepestservices.com",
    "sameAs": [
      "https://www.google.com/maps/place/Absolute+Pest+Services",
      "https://www.facebook.com/absolutepestservices",
      "https://www.yelp.com/biz/absolute-pest-services"
    ],
    "openingHours": [
      "Mo-Fr 08:00-17:00",
      "Sa 08:00-12:00"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "156"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Sarah M."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Excellent service! They handled our wildlife problem humanely and effectively. Highly recommend Absolute Pest Services."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Mike T."
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Professional team, fair pricing, and great results. They eliminated our bed bug problem completely."
      }
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}