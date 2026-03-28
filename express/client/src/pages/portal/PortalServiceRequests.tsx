import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  FileText, 
  Plus, 
  MapPin,
  Clock,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";

interface ServiceRequest {
  id: number;
  serviceType: string;
  description: string;
  address: string;
  city: string;
  priority: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: string;
  finalCost?: string;
  technicianNotes?: string;
  createdAt: string;
}

export default function PortalServiceRequests() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('GET', '/api/portal/service-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.serviceRequests);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load service requests",
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">Service Requests</h1>
          <p className="text-gray-400 mt-1">Track your submitted service requests</p>
        </div>
        <Button 
          onClick={() => setLocation('/portal/service-requests/new')}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Service Requests List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
        </div>
      ) : requests.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Service Requests</h3>
            <p className="text-gray-400 mb-6">You haven't submitted any service requests yet.</p>
            <Button 
              onClick={() => setLocation('/portal/service-requests/new')}
              className="bg-blue-600 hover:bg-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card 
              key={request.id} 
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setLocation(`/portal/appointments/${request.id}?type=service`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        Service
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {request.serviceType}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{request.description}</p>
                    <div className="flex items-center text-gray-400 mb-1">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{request.address}, {request.city}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        {request.scheduledDate && ` • Scheduled: ${format(new Date(request.scheduledDate), 'MMM d, yyyy')}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {request.estimatedCost && (
                      <p className="text-white font-medium">Est. ${request.estimatedCost}</p>
                    )}
                    {request.finalCost && (
                      <p className="text-green-400 font-medium">${request.finalCost}</p>
                    )}
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
