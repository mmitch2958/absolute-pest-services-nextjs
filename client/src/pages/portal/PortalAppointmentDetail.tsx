import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useParams } from "wouter";

interface AppointmentDetail {
  id: number;
  appointmentType?: string;
  serviceType: string;
  address: string;
  city: string;
  preferredDate?: string;
  preferredTime?: string;
  scheduledDate?: string;
  urgency?: string;
  priority?: string;
  status: string;
  description?: string;
  message?: string;
  createdAt: string;
  estimatedCost?: string;
  finalCost?: string;
  technicianNotes?: string;
  completedDate?: string;
}

export default function PortalAppointmentDetail() {
  const [location, setLocation] = useLocation();
  const params = useParams<{ id: string; type?: string }>();
  const { toast } = useToast();
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointment();
  }, [params.id, params.type]);

  const loadAppointment = async () => {
    try {
      setLoading(true);
      const type = params.type || 'inspection';
      const res = await apiRequest('GET', `/api/portal/appointments/${params.id}?type=${type}`);
      const data = await res.json();
      if (data.success) {
        setAppointment(data.appointment);
      } else {
        toast({
          title: "Error",
          description: "Appointment not found",
          variant: "destructive"
        });
        setLocation('/portal/appointments');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const dateValue = appointment.preferredDate || appointment.scheduledDate || appointment.createdAt;
  const isInspection = appointment.appointmentType === 'inspection';

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {appointment.serviceType}
          </h1>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
        <p className="text-gray-400 mt-1">
          {isInspection ? 'Inspection' : 'Service Request'} • {appointment.id}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Status Card */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center">
              {appointment.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
              ) : appointment.status === 'cancelled' ? (
                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              ) : (
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
              )}
              Status: {appointment.status}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Service Type</p>
                <p className="text-white font-medium">{appointment.serviceType}</p>
              </div>
              {appointment.urgency && (
                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <Badge className={getUrgencyColor(appointment.urgency)}>
                    {appointment.urgency}
                  </Badge>
                </div>
              )}
              {appointment.priority && !appointment.urgency && (
                <div>
                  <p className="text-sm text-gray-400">Priority</p>
                  <Badge className={getUrgencyColor(appointment.priority)}>
                    {appointment.priority}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-yellow-500" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white">{appointment.address}</p>
            <p className="text-gray-400">{appointment.city}</p>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-yellow-500" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointment.preferredDate && (
                <div>
                  <p className="text-sm text-gray-400">Preferred Date</p>
                  <p className="text-white font-medium">
                    {format(new Date(appointment.preferredDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              {appointment.preferredTime && (
                <div>
                  <p className="text-sm text-gray-400">Preferred Time</p>
                  <p className="text-white font-medium">{appointment.preferredTime}</p>
                </div>
              )}
              {appointment.scheduledDate && (
                <div>
                  <p className="text-sm text-gray-400">Scheduled Date</p>
                  <p className="text-white font-medium">
                    {format(new Date(appointment.scheduledDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Requested On</p>
                <p className="text-white font-medium">
                  {format(new Date(appointment.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
              {appointment.completedDate && (
                <div>
                  <p className="text-sm text-gray-400">Completed On</p>
                  <p className="text-white font-medium">
                    {format(new Date(appointment.completedDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description/Notes */}
        {(appointment.description || appointment.message || appointment.technicianNotes) && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-yellow-500" />
                {appointment.technicianNotes ? 'Technician Notes' : 'Description'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white whitespace-pre-wrap">
                {appointment.technicianNotes || appointment.description || appointment.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Cost */}
        {(appointment.estimatedCost || appointment.finalCost) && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointment.estimatedCost && (
                  <div>
                    <p className="text-sm text-gray-400">Estimated Cost</p>
                    <p className="text-white font-medium">${appointment.estimatedCost}</p>
                  </div>
                )}
                {appointment.finalCost && (
                  <div>
                    <p className="text-sm text-gray-400">Final Cost</p>
                    <p className="text-white font-medium text-green-400">${appointment.finalCost}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
