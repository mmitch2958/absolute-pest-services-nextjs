import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  FileText, 
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const SERVICE_TYPES = [
  "Pest Control Treatment",
  "Termite Treatment",
  "Wildlife Removal",
  "Bed Bug Treatment",
  "Mosquito Treatment",
  "Rodent Extermination",
  "Bee/Wasp Removal",
  "Other"
];

export default function PortalNewServiceRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    address: '',
    city: 'Pittsburgh',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.serviceType || !formData.description || !formData.address || !formData.city || !formData.priority) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest('POST', '/api/portal/service-requests', formData);
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        if (data.duplicateWarning) {
          setWarning("Note: You already have an open request for this service at the same address.");
        }
        toast({
          title: "Request Submitted!",
          description: "We've received your service request and will be in touch soon.",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to submit service request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit service request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Service Request Submitted!</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Thank you for your request. Our team will review it and contact you within 24-48 hours.
            </p>
            {warning && (
              <div className="flex items-center justify-center text-yellow-500 mb-6">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{warning}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setLocation('/portal/service-requests')}
                className="bg-blue-600 hover:bg-blue-500"
              >
                View My Requests
              </Button>
              <Button 
                onClick={() => setLocation('/portal')}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/portal/service-requests')}
          className="text-gray-400 hover:text-white -ml-3 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Service Requests
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Request Service</h1>
        <p className="text-gray-400 mt-1">Submit a service request for pest control treatment</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Service Details */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="serviceType" className="text-white">Service Type *</Label>
                <Select 
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-white">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-white">Priority *</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="low" className="text-white">Low - Within 2 weeks</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium - Within 1 week</SelectItem>
                    <SelectItem value="high" className="text-white">High - Within 3 days</SelectItem>
                    <SelectItem value="emergency" className="text-white">Emergency - As soon as possible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Problem Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the pest problem you're experiencing, including any specific areas of concern..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Property Address */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Service Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-white">Street Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-white">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setLocation('/portal/service-requests')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
