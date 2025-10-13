import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { trackEvent } from '@/lib/analytics';
import { Calendar as CalendarIcon, Clock, MapPin, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface InspectionFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  serviceType: string;
  preferredDate: Date | null;
  preferredTime: string;
  urgency: string;
  message: string;
}

interface ScheduleInspectionModalProps {
  children: React.ReactNode;
}

export default function ScheduleInspectionModal({ children }: ScheduleInspectionModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InspectionFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    serviceType: '',
    preferredDate: null,
    preferredTime: '',
    urgency: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InspectionFormData) => {
      const payload = {
        ...data,
        preferredDate: data.preferredDate?.toISOString() || new Date().toISOString(),
      };
      const response = await apiRequest('POST', '/api/inspection', payload);
      return response.json();
    },
    onSuccess: () => {
      // Track inspection scheduling conversion for Google Ads
      trackEvent('form_submit', 'inspection', 'inspection_schedule_submit');
      
      toast({
        title: "Inspection Scheduled Successfully",
        description: "We'll contact you within 24 hours to confirm your appointment!",
      });
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        serviceType: '',
        preferredDate: null,
        preferredTime: '',
        urgency: '',
        message: ''
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error Scheduling Inspection",
        description: "Please try again or call us directly at 610-869-3000.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.preferredDate) {
      toast({
        title: "Date Required",
        description: "Please select a preferred date for your inspection.",
        variant: "destructive"
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (field: keyof InspectionFormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const timeSlots = [
    { value: "morning", label: "Morning (8:00 AM - 12:00 PM)" },
    { value: "afternoon", label: "Afternoon (12:00 PM - 5:00 PM)" },
    { value: "evening", label: "Evening (5:00 PM - 8:00 PM)" },
    { value: "anytime", label: "Anytime" }
  ];

  const urgencyLevels = [
    { value: "low", label: "Low - Within 2 weeks" },
    { value: "medium", label: "Medium - Within 1 week" },
    { value: "high", label: "High - Within 3 days" },
    { value: "emergency", label: "Emergency - As soon as possible" }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(210,13%,28%)] flex items-center">
            <CalendarIcon className="mr-2 h-6 w-6 text-[hsl(132,48%,35%)]" />
            Schedule Your Inspection
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-[hsl(210,13%,28%)]">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-[hsl(210,13%,28%)]">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-[hsl(210,13%,28%)]">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-[hsl(210,13%,28%)]">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium text-[hsl(210,13%,28%)] flex items-center">
              <MapPin className="mr-1 h-4 w-4" />
              Property Address *
            </Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="mt-1"
              placeholder="123 Main St, State, ZIP"
              required
            />
          </div>

          <div>
            <Label htmlFor="city" className="text-sm font-medium text-[hsl(210,13%,28%)]">
              City *
            </Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="mt-1"
              placeholder="e.g., Philadelphia, Wilmington"
              required
              data-testid="input-inspection-city"
            />
          </div>

          <div>
            <Label htmlFor="serviceType" className="text-sm font-medium text-[hsl(210,13%,28%)]">
              Service Type *
            </Label>
            <Select value={formData.serviceType} onValueChange={(value) => handleChange('serviceType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select the type of service needed..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-pest-control">General Pest Control Inspection</SelectItem>
                <SelectItem value="termite-inspection">Termite Inspection</SelectItem>
                <SelectItem value="bed-bug-inspection">Bed Bug Inspection</SelectItem>
                <SelectItem value="wildlife-inspection">Wildlife Control Assessment</SelectItem>
                <SelectItem value="bat-inspection">Bat Removal Assessment</SelectItem>
                <SelectItem value="rodent-inspection">Rodent Control Inspection</SelectItem>
                <SelectItem value="ant-inspection">Ant Control Inspection</SelectItem>
                <SelectItem value="wasp-inspection">Wasp/Hornet Inspection</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-[hsl(210,13%,28%)]">
                Preferred Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full mt-1 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.preferredDate ? format(formData.preferredDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.preferredDate || undefined}
                    onSelect={(date) => handleChange('preferredDate', date || null)}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="text-sm font-medium text-[hsl(210,13%,28%)] flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Preferred Time *
              </Label>
              <Select value={formData.preferredTime} onValueChange={(value) => handleChange('preferredTime', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select preferred time..." />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-[hsl(210,13%,28%)] flex items-center">
              <AlertCircle className="mr-1 h-4 w-4" />
              Urgency Level *
            </Label>
            <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="How urgent is this inspection?" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message" className="text-sm font-medium text-[hsl(210,13%,28%)]">
              Additional Information
            </Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="mt-1"
              placeholder="Please describe any specific pest issues, property details, or special requirements..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[hsl(132,48%,35%)] text-white hover:bg-[hsl(132,48%,25%)] font-semibold"
              disabled={submitMutation.isPending}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? 'Scheduling...' : 'Schedule Inspection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}