import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  User, 
  Save,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  ArrowLeft
} from "lucide-react";

interface Profile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

export default function PortalProfile() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('GET', '/api/portal/profile');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setFormData({
          firstName: data.profile.firstName || '',
          lastName: data.profile.lastName || '',
          phone: data.profile.phone || '',
          address: data.profile.address || ''
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      const res = await apiRequest('PUT', '/api/portal/profile', formData);
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setProfile(data.profile);
        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully",
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/portal')}
          className="text-gray-400 hover:text-white -ml-3 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          {/* Profile Card */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2 text-yellow-500" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email (read-only) */}
              <div>
                <Label className="text-gray-400">Email Address</Label>
                <div className="flex items-center mt-1">
                  <Mail className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-white">{profile?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Contact support to change your email address</p>
              </div>

              {/* First Name */}
              <div>
                <Label htmlFor="firstName" className="text-white">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* Last Name */}
              <div>
                <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 bg-white/10 border-white/20 text-white"
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(555) 555-5555"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address" className="text-white">Default Address</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <Button 
              type="submit"
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full mr-2" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            {success && (
              <span className="text-green-400 text-sm">Your changes have been saved</span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
