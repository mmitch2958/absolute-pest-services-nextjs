import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, FolderOpen, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import type { ServiceRequest, InspectionSchedule, Client } from "@shared/schema";

const linkFormSchema = z.object({
  clientId: z.number(),
});

type LinkFormData = z.infer<typeof linkFormSchema>;

export function AdminService() {
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequest | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<InspectionSchedule | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<"service" | "inspection">("service");
  const { toast } = useToast();

  const linkForm = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      clientId: 0,
    },
  });

  // Fetch service requests
  const { data: serviceRequestsResponse, isLoading: serviceRequestsLoading } = useQuery({
    queryKey: ["/api/admin/service-requests"],
    select: (data: any) => data.serviceRequests as ServiceRequest[],
  });

  // Fetch inspection schedules
  const { data: inspectionsResponse, isLoading: inspectionsLoading } = useQuery({
    queryKey: ["/api/inspection"],
    select: (data: any) => data as InspectionSchedule[],
  });

  // Fetch clients for dropdown
  const { data: clientsResponse } = useQuery({
    queryKey: ["/api/clients"],
    select: (data: any) => data.clients as Client[],
  });

  // Update service request mutation
  const updateServiceRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/admin/service-requests/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-requests"] });
      setIsLinkDialogOpen(false);
      setSelectedServiceRequest(null);
      linkForm.reset();
      toast({
        title: "Success",
        description: "Service request linked to client successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update service request",
        variant: "destructive",
      });
    },
  });

  // Update inspection mutation
  const updateInspectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PUT", `/api/admin/inspections/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspection"] });
      setIsLinkDialogOpen(false);
      setSelectedInspection(null);
      linkForm.reset();
      toast({
        title: "Success",
        description: "Inspection linked to client successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update inspection",
        variant: "destructive",
      });
    },
  });

  const onLinkSubmit = (data: LinkFormData) => {
    if (linkType === "service" && selectedServiceRequest) {
      updateServiceRequestMutation.mutate({
        id: selectedServiceRequest.id,
        updates: { clientId: data.clientId },
      });
    } else if (linkType === "inspection" && selectedInspection) {
      updateInspectionMutation.mutate({
        id: selectedInspection.id,
        updates: { clientId: data.clientId },
      });
    }
  };

  const handleLinkServiceRequest = (serviceRequest: ServiceRequest) => {
    setSelectedServiceRequest(serviceRequest);
    setLinkType("service");
    linkForm.reset({
      clientId: serviceRequest.clientId || 0,
    });
    setIsLinkDialogOpen(true);
  };

  const handleLinkInspection = (inspection: InspectionSchedule) => {
    setSelectedInspection(inspection);
    setLinkType("inspection");
    linkForm.reset({
      clientId: inspection.clientId || 0,
    });
    setIsLinkDialogOpen(true);
  };

  const getClientName = (clientId: number | null) => {
    if (!clientId) return "—";
    const client = clientsResponse?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      pending: "outline",
      scheduled: "default",
      "in-progress": "secondary",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      low: "secondary",
      medium: "default",
      high: "destructive",
    };
    return <Badge variant={variants[priority] || "default"}>{priority}</Badge>;
  };

  const serviceRequests = serviceRequestsResponse || [];
  const inspections = inspectionsResponse || [];
  const clients = clientsResponse || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground">
            Manage service requests and inspection schedules
          </p>
        </div>
      </div>

      <Tabs defaultValue="service-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="service-requests" data-testid="tab-service-requests">
            <FolderOpen className="w-4 h-4 mr-2" />
            Service Requests
          </TabsTrigger>
          <TabsTrigger value="inspections" data-testid="tab-inspections">
            <Calendar className="w-4 h-4 mr-2" />
            Inspection Schedules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>
                View and manage all service requests from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serviceRequestsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : serviceRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No service requests found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {serviceRequests.map((request) => (
                      <TableRow key={request.id} data-testid={`row-service-${request.id}`}>
                        <TableCell>{request.id}</TableCell>
                        <TableCell>{request.serviceType}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.address}</TableCell>
                        <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{getClientName(request.clientId)}</TableCell>
                        <TableCell>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLinkServiceRequest(request)}
                            data-testid={`button-link-service-${request.id}`}
                          >
                            Link to Client
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inspections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Schedules</CardTitle>
              <CardDescription>
                View and manage all inspection requests from website
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inspectionsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : inspections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No inspection schedules found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Preferred Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspections.map((inspection) => (
                      <TableRow key={inspection.id} data-testid={`row-inspection-${inspection.id}`}>
                        <TableCell>{inspection.id}</TableCell>
                        <TableCell>
                          {inspection.firstName} {inspection.lastName}
                        </TableCell>
                        <TableCell>{inspection.email}</TableCell>
                        <TableCell>{inspection.phone}</TableCell>
                        <TableCell>{inspection.serviceType}</TableCell>
                        <TableCell>
                          {new Date(inspection.preferredDate).toLocaleDateString()} {inspection.preferredTime}
                        </TableCell>
                        <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                        <TableCell>{getClientName(inspection.clientId)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLinkInspection(inspection)}
                            data-testid={`button-link-inspection-${inspection.id}`}
                          >
                            Link to Client
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Link to Client Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Client</DialogTitle>
            <DialogDescription>
              Select a client to link this {linkType === "service" ? "service request" : "inspection"} to.
            </DialogDescription>
          </DialogHeader>
          <Form {...linkForm}>
            <form onSubmit={linkForm.handleSubmit(onLinkSubmit)} className="space-y-4">
              <FormField
                control={linkForm.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-client">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name} - {client.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLinkDialogOpen(false)}
                  data-testid="button-cancel-link"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateServiceRequestMutation.isPending || updateInspectionMutation.isPending}
                  data-testid="button-save-link"
                >
                  {updateServiceRequestMutation.isPending || updateInspectionMutation.isPending
                    ? "Saving..."
                    : "Link to Client"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
