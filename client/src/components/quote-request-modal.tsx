import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { trackEvent } from '@/lib/analytics';
import { FileText, MapPin } from 'lucide-react';

interface QuoteFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  serviceType: string;
  message: string;
}

interface QuoteRequestModalProps {
  children: React.ReactNode;
}

export default function QuoteRequestModal({ children }: QuoteRequestModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<QuoteFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data: QuoteFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      // Track quote request conversion for Google Ads
      trackEvent('form_submit', 'quote', 'quote_request_submit');
      
      toast({
        title: "Quote Request Received",
        description: "Thank you! We'll send you a detailed quote within 24 hours.",
      });
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: '',
        serviceType: '',
        message: ''
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error Submitting Request",
        description: "Please try again or call us directly at 484-643-2225.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (field: keyof QuoteFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(210,13%,28%)] flex items-center">
            <FileText className="mr-2 h-6 w-6 text-[hsl(132,48%,35%)]" />
            Quote Request
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
              placeholder="123 Main St, City, State, ZIP"
              required
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
                <SelectItem value="general-pest-control">General Pest Control</SelectItem>
                <SelectItem value="termite-control">Termite Control</SelectItem>
                <SelectItem value="bed-bug-treatment">Bed Bug Treatment</SelectItem>
                <SelectItem value="wildlife-control">Wildlife Control</SelectItem>
                <SelectItem value="bat-removal">Bat Removal</SelectItem>
                <SelectItem value="rodent-control">Rodent Control</SelectItem>
                <SelectItem value="ant-control">Ant Control</SelectItem>
                <SelectItem value="wasp-control">Wasp/Hornet Control</SelectItem>
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
              placeholder="Please describe your pest control needs, property details, or any specific questions..."
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
              <FileText className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? 'Submitting...' : 'Request Quote'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
