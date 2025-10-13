import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Send } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

interface ContactFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  serviceType: string;
  message: string;
}

export default function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    serviceType: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest('POST', '/api/contact', data);
      return response.json();
    },
    onSuccess: () => {
      // Track contact form conversion for Google Ads
      trackEvent('form_submit', 'contact', 'contact_form_submit');
      
      toast({
        title: "Message Sent Successfully",
        description: "We'll get back to you within 24 hours!",
      });
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        city: '',
        serviceType: '',
        message: ''
      });
    },
    onError: (error) => {
      toast({
        title: "Error Sending Message",
        description: "Please try again or call us directly.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-8">
        <h3 className="text-2xl font-bold text-[hsl(210,13%,28%)] mb-6">Request Service</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName" className="text-sm font-medium text-[hsl(210,13%,28%)]">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-sm font-medium text-[hsl(210,13%,28%)]">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="mt-2"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-[hsl(210,13%,28%)]">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="mt-2"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-[hsl(210,13%,28%)]">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="mt-2"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city" className="text-sm font-medium text-[hsl(210,13%,28%)]">City</Label>
            <Input
              id="city"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="mt-2"
              placeholder="e.g., Philadelphia, Wilmington"
              required
              data-testid="input-city"
            />
          </div>
          
          <div>
            <Label htmlFor="serviceType" className="text-sm font-medium text-[hsl(210,13%,28%)]">Service Type</Label>
            <Select value={formData.serviceType} onValueChange={(value) => handleChange('serviceType', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select a service..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wildlife-control">Wildlife Control</SelectItem>
                <SelectItem value="bed-bug-treatment">Bed Bug Treatment</SelectItem>
                <SelectItem value="termite-treatment">Termite Treatment</SelectItem>
                <SelectItem value="bat-removal">Bat Removal</SelectItem>
                <SelectItem value="general-pest-control">General Pest Control</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="message" className="text-sm font-medium text-[hsl(210,13%,28%)]">Message</Label>
            <Textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="mt-2"
              placeholder="Please describe your pest problem..."
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-[hsl(132,48%,35%)] text-white hover:bg-[hsl(132,48%,25%)] font-semibold"
            disabled={submitMutation.isPending}
          >
            <Send className="mr-2 h-4 w-4" />
            {submitMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
