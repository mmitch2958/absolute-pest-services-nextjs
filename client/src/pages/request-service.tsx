import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Bug, Home, Shield, Zap } from "lucide-react";
import { useLocation } from "wouter";
import LocalSEO from "@/components/local-seo";
import { Turnstile } from '@marsidev/react-turnstile';

export default function RequestService() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');

  const [serviceForm, setServiceForm] = useState({
    firstName: '',
    lastName: '',
    serviceType: '',
    description: '',
    address: '',
    city: '',
    priority: 'medium'
  });

  const serviceTypes = [
    { value: 'General Pest Control', label: 'General Pest Control', icon: Bug },
    { value: 'Termite Control', label: 'Termite Control', icon: Home },
    { value: 'Rodent Control', label: 'Rodent Control', icon: Shield },
    { value: 'Bed Bug Treatment', label: 'Bed Bug Treatment', icon: Bug },
    { value: 'Ant Control', label: 'Ant Control', icon: Bug },
    { value: 'Cockroach Control', label: 'Cockroach Control', icon: Bug },
    { value: 'Wasp/Bee Removal', label: 'Wasp/Bee Removal', icon: Zap },
    { value: 'Spider Control', label: 'Spider Control', icon: Bug },
    { value: 'Mosquito Control', label: 'Mosquito Control', icon: Bug },
    { value: 'Flea Control', label: 'Flea Control', icon: Bug },
    { value: 'Other', label: 'Other', icon: Bug }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low - Routine maintenance' },
    { value: 'medium', label: 'Medium - Standard service' },
    { value: 'high', label: 'High - Urgent problem' },
    { value: 'emergency', label: 'Emergency - Immediate attention needed' }
  ];

  if (!isLoading && !isAuthenticated) {
    setLocation('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only require CAPTCHA if it's configured
    if (import.meta.env.VITE_TURNSTILE_SITE_KEY && !captchaToken) {
      toast({
        title: "Verification Required",
        description: "Please complete the CAPTCHA verification.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/service-requests', { ...serviceForm, captchaToken });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Service Request Submitted",
          description: "Your service request has been created successfully. We'll contact you soon to schedule the service.",
        });
        setCaptchaToken('');
        setLocation('/dashboard');
      } else {
        toast({
          title: "Submission Failed",
          description: data.message || "Failed to submit service request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit service request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,98%)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      <LocalSEO 
        title="Request Pest Control Service - Professional Extermination"
        description="Request professional pest control services in PA, DE, MD. Fast response times, licensed technicians, and comprehensive pest management solutions. Get a free quote today."
        serviceName="Pest Control Service Request"
        serviceArea="Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE"
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="ghost" onClick={() => setLocation('/dashboard')}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-[hsl(210,13%,28%)] ml-4">
              Request Service
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl text-gray-700 mb-2">
            Tell us about your pest control needs
          </h2>
          <p className="text-gray-600">
            Fill out the form below and we'll get back to you to schedule your service appointment.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-[hsl(210,13%,28%)]">
              Service Request Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-base font-medium">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    data-testid="input-firstName"
                    value={serviceForm.firstName}
                    onChange={(e) => setServiceForm({ ...serviceForm, firstName: e.target.value })}
                    placeholder="Enter your first name"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-base font-medium">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    data-testid="input-lastName"
                    value={serviceForm.lastName}
                    onChange={(e) => setServiceForm({ ...serviceForm, lastName: e.target.value })}
                    placeholder="Enter your last name"
                    className="mt-2"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="serviceType" className="text-base font-medium">
                  Service Type <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={serviceForm.serviceType} 
                  onValueChange={(value) => setServiceForm({ ...serviceForm, serviceType: value })}
                  required
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select the type of service you need" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="flex items-center">
                          <service.icon className="h-4 w-4 mr-2" />
                          {service.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address" className="text-base font-medium">
                  Service Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  value={serviceForm.address}
                  onChange={(e) => setServiceForm({ ...serviceForm, address: e.target.value })}
                  placeholder="Enter the street address where service is needed"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city" className="text-base font-medium">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  data-testid="input-service-city"
                  value={serviceForm.city}
                  onChange={(e) => setServiceForm({ ...serviceForm, city: e.target.value })}
                  placeholder="e.g., Philadelphia, Wilmington"
                  className="mt-2"
                  required
                />
              </div>

              <div>
                <Label htmlFor="priority" className="text-base font-medium">
                  Priority Level <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={serviceForm.priority} 
                  onValueChange={(value) => setServiceForm({ ...serviceForm, priority: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium">
                  Problem Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Please describe the pest problem in detail. Include information about:
• What type of pests you're seeing
• Where you've noticed them
• How long the problem has been occurring
• Any previous treatments attempted
• Specific concerns or questions you have"
                  className="mt-2 min-h-32"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• We'll review your request within 24 hours</li>
                  <li>• Our team will contact you to schedule an inspection</li>
                  <li>• We'll provide you with a detailed treatment plan and quote</li>
                  <li>• Service can typically be scheduled within 2-3 business days</li>
                </ul>
              </div>

              {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile
                    siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setCaptchaToken('')}
                    onExpire={() => setCaptchaToken('')}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/dashboard')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-[hsl(132,48%,35%)] hover:bg-[hsl(132,48%,25%)]"
                  data-testid="button-submit-service"
                >
                  {submitting ? "Submitting..." : "Submit Service Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}