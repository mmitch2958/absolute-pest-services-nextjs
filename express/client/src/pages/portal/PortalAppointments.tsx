import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Calendar, 
  Plus, 
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: number;
  type: 'inspection' | 'service';
  serviceType: string;
  address: string;
  city: string;
  date: string;
  time?: string;
  status: string;
  urgency: string;
  description: string;
  createdAt: string;
}

export default function PortalAppointments() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, typeFilter, search]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (search) params.append('search', search);
      
      const res = await apiRequest('GET', `/api/portal/appointments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
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

  const getTypeLabel = (type: string) => {
    return type === 'inspection' ? 'Inspection' : 'Service';
  };

  const getTypeColor = (type: string) => {
    return type === 'inspection' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/portal')}
            className="text-gray-400 hover:text-white -ml-3 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Appointments</h1>
          <p className="text-gray-400 mt-1">View all your inspections and service requests</p>
        </div>
        <Button 
          onClick={() => setLocation('/portal/appointments/new')}
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by address or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="">All Types</option>
              <option value="inspection">Inspections</option>
              <option value="service">Services</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
        </div>
      ) : appointments.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Appointments Found</h3>
            <p className="text-gray-400 mb-6">
              {search || statusFilter || typeFilter 
                ? "No appointments match your filters. Try adjusting your search criteria."
                : "You haven't scheduled any appointments yet."}
            </p>
            <Button 
              onClick={() => setLocation('/portal/appointments/new')}
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Your First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <Card 
              key={`${appointment.type}-${appointment.id}`} 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setLocation(`/portal/appointments/${appointment.id}?type=${appointment.type}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getTypeColor(appointment.type)}>
                        {getTypeLabel(appointment.type)}
                      </Badge>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {appointment.serviceType}
                    </h3>
                    <div className="flex items-center text-gray-400 mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{appointment.address}, {appointment.city}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {format(new Date(appointment.date), 'MMM d, yyyy')}
                        {appointment.time && ` at ${appointment.time}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Created {format(new Date(appointment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
