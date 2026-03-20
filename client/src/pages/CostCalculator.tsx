import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calculator, Home, Bug, DollarSign, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export default function CostCalculator() {
  const [serviceType, setServiceType] = useState("");
  const [propertySize, setPropertySize] = useState("");
  const [severity, setSeverity] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<{ min: number; max: number } | null>(null);

  const serviceTypes = [
    { value: "general-pest", label: "General Pest Control", baseMin: 100, baseMax: 300 },
    { value: "termite", label: "Termite Treatment", baseMin: 500, baseMax: 3000 },
    { value: "bed-bug", label: "Bed Bug Treatment", baseMin: 300, baseMax: 1500 },
    { value: "wildlife", label: "Wildlife Control", baseMin: 200, baseMax: 800 },
    { value: "bat-removal", label: "Bat Removal", baseMin: 300, baseMax: 1200 },
    { value: "rodent", label: "Rodent Control", baseMin: 150, baseMax: 500 },
  ];

  const propertySizes = [
    { value: "small", label: "Small (< 1,500 sq ft)", multiplier: 0.8 },
    { value: "medium", label: "Medium (1,500 - 3,000 sq ft)", multiplier: 1.0 },
    { value: "large", label: "Large (3,000 - 5,000 sq ft)", multiplier: 1.3 },
    { value: "xlarge", label: "Extra Large (> 5,000 sq ft)", multiplier: 1.6 },
  ];

  const severityLevels = [
    { value: "minor", label: "Minor Infestation", multiplier: 0.8 },
    { value: "moderate", label: "Moderate Infestation", multiplier: 1.0 },
    { value: "severe", label: "Severe Infestation", multiplier: 1.4 },
  ];

  const calculateCost = () => {
    if (!serviceType || !propertySize || !severity) return;

    const service = serviceTypes.find(s => s.value === serviceType);
    const property = propertySizes.find(p => p.value === propertySize);
    const sev = severityLevels.find(s => s.value === severity);

    if (!service || !property || !sev) return;

    const min = Math.round(service.baseMin * property.multiplier * sev.multiplier);
    const max = Math.round(service.baseMax * property.multiplier * sev.multiplier);

    setEstimatedCost({ min, max });
  };

  return (
    <>
      <Helmet>
        <title>Pest Control Cost Calculator - Free Estimate | Absolute Pest Services</title>
        <meta name="description" content="Calculate pest control costs instantly. Get free estimates for termite treatment, bed bug removal, wildlife control, and more. Serving PA, DE, and MD." />
        <link rel="canonical" href="https://absolutepestservices.com/cost-calculator" />
        <meta property="og:title" content="Pest Control Cost Calculator - Free Estimate | Absolute Pest Services" />
        <meta property="og:description" content="Calculate pest control costs instantly. Get free estimates for various pest control services." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="w-10 h-10" />
              <h1 className="text-4xl md:text-5xl font-bold" data-testid="text-page-title">
                Pest Control Cost Calculator
              </h1>
            </div>
            <p className="text-xl text-green-100 max-w-2xl" data-testid="text-page-subtitle">
              Get an instant estimate for your pest control needs
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card data-testid="card-calculator">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Calculate Your Estimate
                </CardTitle>
                <CardDescription>
                  Select your service details to get an estimated cost range
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger id="serviceType" data-testid="select-service-type">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="propertySize">Property Size *</Label>
                  <Select value={propertySize} onValueChange={setPropertySize}>
                    <SelectTrigger id="propertySize" data-testid="select-property-size">
                      <SelectValue placeholder="Select property size" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertySizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Infestation Severity *</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger id="severity" data-testid="select-severity">
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                      {severityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={calculateCost}
                  disabled={!serviceType || !propertySize || !severity}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  data-testid="button-calculate"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Estimate
                </Button>

                {estimatedCost && (
                  <div className="mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-200" data-testid="section-estimate">
                    <div className="text-center">
                      <p className="text-gray-700 font-medium mb-2" data-testid="text-estimate-label">
                        Estimated Cost Range
                      </p>
                      <p className="text-4xl font-bold text-green-700" data-testid="text-estimate-amount">
                        ${estimatedCost.min} - ${estimatedCost.max}
                      </p>
                      <p className="text-sm text-gray-600 mt-2" data-testid="text-estimate-disclaimer">
                        This is an estimate. Actual costs may vary based on inspection findings.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card data-testid="card-info">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="w-6 h-6" />
                    What Affects Pest Control Costs?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Service Type</h3>
                    <p className="text-gray-600 text-sm">
                      Different pests require different treatment methods and materials, affecting overall cost.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Property Size</h3>
                    <p className="text-gray-600 text-sm">
                      Larger properties require more time, materials, and labor for comprehensive treatment.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Infestation Severity</h3>
                    <p className="text-gray-600 text-sm">
                      Severe infestations may require multiple treatments and more extensive work.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-gray-600 text-sm">
                      Accessibility and local regulations can impact service costs.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-600 text-white" data-testid="card-cta">
                <CardHeader>
                  <CardTitle className="text-white">Get an Accurate Quote</CardTitle>
                  <CardDescription className="text-green-100">
                    Schedule a free inspection for a precise estimate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Our cost calculator provides general estimates. For an accurate quote tailored to your specific situation, schedule a free inspection with our certified technicians.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link href="/contact">
                      <Button className="w-full bg-white text-green-700 hover:bg-gray-100" size="lg" data-testid="button-schedule">
                        Schedule Free Inspection
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-green-700" asChild data-testid="button-call">
                      <a href="tel:4846432225">
                        <Phone className="w-4 h-4 mr-2" />
                        Call (484) 643-2225
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">Pennsylvania</Badge>
                    <Badge variant="secondary">Delaware</Badge>
                    <Badge variant="secondary">Maryland</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    We proudly serve homeowners and businesses throughout the tri-state area with professional pest control solutions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Why Choose Absolute Pest Services?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-gray-600 text-sm">
                  No hidden fees. We provide detailed estimates before starting any work.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Licensed & Insured</h3>
                <p className="text-gray-600 text-sm">
                  Fully certified technicians with comprehensive liability coverage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Satisfaction Guaranteed</h3>
                <p className="text-gray-600 text-sm">
                  We stand behind our work with a 100% satisfaction guarantee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
