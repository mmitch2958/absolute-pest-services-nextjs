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
import { Send, Phone, Clock, CheckCircle, Gift } from 'lucide-react';
import { trackEvent, trackPhoneClick } from '@/lib/analytics';
import { Turnstile } from '@marsidev/react-turnstile';

interface ContactFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  serviceType: string;
  message: string;
  captchaToken?: string;
}

const PHONE_NUMBER = '484-643-2225';
const PHONE_HREF = 'tel:+14846432225';

export default function ContactForm() {
  const { toast } = useToast();
  const [captchaToken, setCaptchaToken] = useState<string>('');
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
      // GA4 conversion: contact form submission
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
      setCaptchaToken('');
    },
    onError: () => {
      toast({
        title: "Error Sending Message",
        description: "Please try again or call us directly.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
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
    
    submitMutation.mutate({ ...formData, captchaToken });
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhoneClick = () => {
    trackPhoneClick(PHONE_NUMBER);
  };

  return (
    <>
      {/* Sticky mobile click-to-call bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <a
          href={PHONE_HREF}
          onClick={handlePhoneClick}
          className="flex items-center justify-center gap-3 bg-[hsl(132,48%,35%)] text-white py-4 text-lg font-bold shadow-2xl hover:bg-[hsl(132,48%,25%)] transition-colors"
          data-testid="button-sticky-phone"
        >
          <Phone className="h-5 w-5 animate-pulse" />
          Call Now: {PHONE_NUMBER}
          <span className="text-xs font-normal text-green-200 ml-1">Same-Day Service</span>
        </a>
      </div>

      <Card className="bg-white">
        <CardContent className="p-8">
          {/* Urgency & value proposition badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              Same-Day Service Available
            </span>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Gift className="h-3.5 w-3.5" />
              Free Inspection
            </span>
            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5" />
              Licensed &amp; Insured
            </span>
          </div>

          <h3 className="text-2xl font-bold text-[hsl(210,13%,28%)] mb-2">Request a Free Quote</h3>
          <p className="text-gray-500 text-sm mb-6">
            Get a free inspection &amp; quote — no obligation. We respond within 2 hours.
          </p>

          {/* Prominent phone CTA (desktop) */}
          <a
            href={PHONE_HREF}
            onClick={handlePhoneClick}
            className="hidden md:flex items-center justify-center gap-2 w-full bg-[hsl(132,48%,35%)] text-white py-3 px-6 rounded-lg font-semibold text-lg hover:bg-[hsl(132,48%,25%)] transition-colors mb-5"
            data-testid="button-phone-click"
          >
            <Phone className="h-5 w-5" />
            Call {PHONE_NUMBER} — Same-Day Available
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-sm text-gray-400 font-medium">or submit your info below</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                placeholder="e.g., West Chester, Kennett Square"
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
                  <SelectItem value="termite-treatment">Termite Treatment</SelectItem>
                  <SelectItem value="bed-bug-treatment">Bed Bug Treatment</SelectItem>
                  <SelectItem value="rodent-control">Rodent Control</SelectItem>
                  <SelectItem value="wildlife-control">Wildlife Control</SelectItem>
                  <SelectItem value="bat-removal">Bat Removal</SelectItem>
                  <SelectItem value="general-pest-control">General Pest Control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message" className="text-sm font-medium text-[hsl(210,13%,28%)]">Describe Your Problem</Label>
              <Textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className="mt-2"
                placeholder="Please describe your pest problem so we can prepare for your free inspection..."
                required
              />
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
            
            <Button
              type="submit"
              className="w-full bg-[hsl(36,100%,47%)] text-white hover:bg-[hsl(36,100%,37%)] font-semibold py-3 text-base"
              disabled={submitMutation.isPending}
              data-testid="button-submit-contact"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitMutation.isPending ? 'Sending...' : 'Get My Free Inspection Quote'}
            </Button>

            <p className="text-xs text-gray-400 text-center">
              🔒 Your information is secure &amp; never shared. We respond within 2 hours.
            </p>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
