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
  Calendar, 
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { format, addDays } from "date-fns";

const SERVICE_TYPES = [
  "General Pest Control",
  "Termite Inspection",
  "Wildlife Removal",
  "Bed Bug Treatment",
  "Mosquito Control",
  "Rodent Control",
  "Bee & Wasp Removal",
  "Other"
];

const TIME_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM"
];

export default function PortalNewAppointment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    preferredDate: '',
    preferredTime: '',
    urgency: 'medium',
    address: '',
    city: 'Pittsburgh',
    message: ''
  });

  // Get minimum date (tomorrow)
  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.serviceType || !formData.preferredDate || !formData.preferredTime || 
        !formData.urgency || !formData.address || !formData.city) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiRequest('POST', '/api/portal/appointments', formData);
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        toast({
          title: "Appointment Scheduled!",
          description: "We've sent you a confirmation email",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to schedule appointment",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
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
            <h2 className="text-2xl font-bold text-white mb-3">Appointment Scheduled!</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Your inspection has been scheduled for {format(new Date(formData.preferredDate), 'MMMM d, yyyy')} 
              {' '}{formData.preferredTime}. We've sent a confirmation email with the details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => setLocation('/portal/appointments')}
                className="bg-yellow-500 hover:bg-yellow-400 text-gray-900"
              >
                View My Appointments
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
          onClick={() => setLocation('/portal/appointments')}
          className="text-gray-400 hover:text-white -ml-3 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Appointments
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Schedule Inspection</h1>
        <p className="text-gray-400 mt-1">Book a property inspection with our team</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Service Type */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preferredDate" className="text-white">Preferred Date *</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    min={minDate}
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="mt-1 bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="preferredTime" className="text-white">Preferred Time *</Label>
                  <Select 
                    value={formData.preferredTime}
                    onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                  >
                    <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time} className="text-white">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="urgency" className="text-white">Urgency *</Label>
                <Select 
                  value={formData.urgency}
                  onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                >
                  <SelectTrigger className="mt-1 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20">
                    <SelectItem value="low" className="text-white">Low - Within 2 weeks</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium - Within 1 week</SelectItem>
                    <SelectItem value="high" className="text-white">High - Within 3 days</SelectItem>
                    <SelectItem value="emergency" className="text-white">Emergency - As soon as possible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Property Address */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Property Address</CardTitle>
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

          {/* Additional Info */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="message" className="text-white">Notes for Technician (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Describe any specific pest issues, access instructions, or other details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setLocation('/portal/appointments')}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={submitting}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Inspection
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
