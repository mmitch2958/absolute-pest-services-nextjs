import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  CreditCard, 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Home as HomeIcon,
  LogOut,
  User
} from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface ServiceRequest {
  id: number;
  serviceType: string;
  description: string;
  address: string;
  priority: string;
  status: string;
  scheduledDate?: string;
  completedDate?: string;
  estimatedCost?: string;
  finalCost?: string;
  technicianNotes?: string;
  createdAt: string;
}

interface Inspection {
  id: number;
  serviceType: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  urgency: string;
  status: string;
  message?: string;
  createdAt: string;
}

interface Payment {
  id: number;
  amount: string;
  status: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
      return;
    }
    
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [serviceRequestsRes, inspectionsRes, paymentsRes] = await Promise.all([
        apiRequest('GET', '/api/service-requests'),
        apiRequest('GET', '/api/inspections/my'),
        apiRequest('GET', '/api/payments/my')
      ]);

      const serviceRequestsData = await serviceRequestsRes.json();
      const inspectionsData = await inspectionsRes.json();
      const paymentsData = await paymentsRes.json();

      if (serviceRequestsData.success) {
        setServiceRequests(serviceRequestsData.serviceRequests);
      }
      if (inspectionsData.success) {
        setInspections(inspectionsData.inspections);
      }
      if (paymentsData.success) {
        setPayments(paymentsData.payments);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation('/');
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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[hsl(0,0%,98%)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(0,0%,98%)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation('/')}>
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Button>
              <h1 className="text-2xl font-bold text-[hsl(210,13%,28%)]">
                Customer Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-[hsl(132,48%,35%)]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Service Requests</p>
                  <p className="text-2xl font-bold text-[hsl(210,13%,28%)]">{serviceRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-[hsl(207,73%,44%)]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inspections</p>
                  <p className="text-2xl font-bold text-[hsl(210,13%,28%)]">{inspections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-[hsl(36,100%,47%)]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-[hsl(210,13%,28%)]">
                    {serviceRequests.filter(sr => sr.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Payments</p>
                  <p className="text-2xl font-bold text-[hsl(210,13%,28%)]">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[hsl(210,13%,28%)]">Your Service Requests</h2>
              <Button onClick={() => setLocation('/request-service')} className="bg-[hsl(132,48%,35%)] hover:bg-[hsl(132,48%,25%)]">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            <div className="grid gap-6">
              {serviceRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Requests</h3>
                    <p className="text-gray-600 mb-4">You haven't created any service requests yet.</p>
                    <Button onClick={() => setLocation('/request-service')} className="bg-[hsl(132,48%,35%)] hover:bg-[hsl(132,48%,25%)]">
                      Create Your First Request
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                serviceRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{request.serviceType}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{request.address}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{request.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </div>
                        {request.scheduledDate && (
                          <div>
                            <span className="font-medium">Scheduled:</span>{' '}
                            {format(new Date(request.scheduledDate), 'MMM d, yyyy')}
                          </div>
                        )}
                        {request.estimatedCost && (
                          <div>
                            <span className="font-medium">Estimated Cost:</span> ${request.estimatedCost}
                          </div>
                        )}
                        {request.finalCost && (
                          <div>
                            <span className="font-medium">Final Cost:</span> ${request.finalCost}
                          </div>
                        )}
                      </div>
                      
                      {request.technicianNotes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-1">Technician Notes:</p>
                          <p className="text-sm text-blue-800">{request.technicianNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="inspections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[hsl(210,13%,28%)]">Your Inspections</h2>
              <Button onClick={() => setLocation('/')} className="bg-[hsl(36,100%,47%)] hover:bg-[hsl(36,100%,37%)]">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>

            <div className="grid gap-6">
              {inspections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspections Scheduled</h3>
                    <p className="text-gray-600 mb-4">You haven't scheduled any inspections yet.</p>
                    <Button onClick={() => setLocation('/')} className="bg-[hsl(36,100%,47%)] hover:bg-[hsl(36,100%,37%)]">
                      Schedule Inspection
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                inspections.map((inspection) => (
                  <Card key={inspection.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{inspection.serviceType}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{inspection.address}</p>
                        </div>
                        <Badge className={getStatusColor(inspection.status)}>
                          {inspection.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Preferred Date:</span>{' '}
                          {format(new Date(inspection.preferredDate), 'MMM d, yyyy')}
                        </div>
                        <div>
                          <span className="font-medium">Preferred Time:</span> {inspection.preferredTime}
                        </div>
                        <div>
                          <span className="font-medium">Urgency:</span> {inspection.urgency}
                        </div>
                        <div>
                          <span className="font-medium">Requested:</span>{' '}
                          {format(new Date(inspection.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      {inspection.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">Additional Information:</p>
                          <p className="text-sm text-gray-700">{inspection.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <h2 className="text-xl font-semibold text-[hsl(210,13%,28%)]">Payment History</h2>
            
            <div className="grid gap-6">
              {payments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
                    <p className="text-gray-600">Your payment history will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                payments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-lg font-semibold text-[hsl(210,13%,28%)]">
                            ${payment.amount}
                          </p>
                          <p className="text-sm text-gray-600">
                            {payment.paymentMethod && `via ${payment.paymentMethod}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl font-semibold text-[hsl(210,13%,28%)]">Profile Information</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">First Name</Label>
                    <p className="text-lg">{user?.firstName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Name</Label>
                    <p className="text-lg">{user?.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Email</Label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                
                {user?.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-lg">{user.phone}</p>
                  </div>
                )}
                
                {user?.address && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-lg">{user.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}