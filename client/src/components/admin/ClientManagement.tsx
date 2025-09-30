import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Building2, UserCheck, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import type { Client, InsertClient } from "@shared/schema";
import { insertClientSchema } from "@shared/schema";

const clientFormSchema = insertClientSchema.extend({
  id: z.number().optional(),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export function ClientManagement() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "prospect" | "client">("all");
  const { toast } = useToast();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
      clientType: "prospect",
      status: "active",
      notes: "",
    },
  });

  // Fetch clients
  const { data: clientsResponse, isLoading } = useQuery({
    queryKey: ["/api/clients"],
    select: (data: any) => data.clients as Client[],
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
      const response = await apiRequest("POST", "/api/clients", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Client created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create client",
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, ...data }: ClientFormData) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setIsDialogOpen(false);
      setSelectedClient(null);
      form.reset();
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/clients/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  // Convert to client mutation
  const convertToClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, { clientType: "client" });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Success",
        description: "Prospect converted to client successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to convert prospect",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (selectedClient) {
      updateClientMutation.mutate({ ...data, id: selectedClient.id });
    } else {
      const { id, ...insertData } = data;
      createClientMutation.mutate(insertData);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    form.reset({
      name: client.name,
      email: client.email,
      phone: client.phone ?? "",
      address: client.address ?? "",
      contactPerson: client.contactPerson ?? "",
      clientType: client.clientType,
      status: client.status,
      notes: client.notes ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleConvertToClient = (id: number) => {
    if (confirm("Convert this prospect to a client?")) {
      convertToClientMutation.mutate(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setSelectedClient(null);
    form.reset();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      handleDialogClose();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const getClientTypeBadge = (clientType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      prospect: "outline",
      client: "default",
    };
    return <Badge variant={variants[clientType] || "default"}>{clientType}</Badge>;
  };

  const allClients = clientsResponse || [];
  const clients = filterType === "all" 
    ? allClients 
    : allClients.filter(c => c.clientType === filterType);

  const prospectCount = allClients.filter(c => c.clientType === "prospect").length;
  const clientCount = allClients.filter(c => c.clientType === "client").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your client portfolio and relationships
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          data-testid="button-create-client"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Clients
              </CardTitle>
              <CardDescription>
                {prospectCount} prospects, {clientCount} clients
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              data-testid="button-filter-all"
            >
              All ({allClients.length})
            </Button>
            <Button
              variant={filterType === "prospect" ? "default" : "outline"}
              onClick={() => setFilterType("prospect")}
              data-testid="button-filter-prospects"
            >
              Prospects ({prospectCount})
            </Button>
            <Button
              variant={filterType === "client" ? "default" : "outline"}
              onClick={() => setFilterType("client")}
              data-testid="button-filter-clients"
            >
              Clients ({clientCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedClient ? "Edit Client" : "Create New Client"}
              </DialogTitle>
              <DialogDescription>
                {selectedClient 
                  ? "Update the client information below."
                  : "Add a new client to your portfolio."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter company name"
                          data-testid="input-client-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="Enter email address"
                          data-testid="input-client-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Enter phone number"
                          data-testid="input-client-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Enter contact person name"
                          data-testid="input-client-contact"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-client-status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="prospective">Prospective</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Enter address"
                          data-testid="textarea-client-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Enter additional notes"
                          data-testid="textarea-client-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    data-testid="button-cancel-client"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createClientMutation.isPending || updateClientMutation.isPending}
                    data-testid="button-save-client"
                  >
                    {createClientMutation.isPending || updateClientMutation.isPending
                      ? "Saving..."
                      : selectedClient
                      ? "Update"
                      : "Create"
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Clients
          </CardTitle>
          <CardDescription>
            {clients.length} client{clients.length !== 1 ? 's' : ''} in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-clients">
              Loading clients...
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-clients">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No clients yet. Add your first client to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} data-testid={`row-client-${client.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-client-name-${client.id}`}>
                            {client.name}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-client-email-${client.id}`}>
                            {client.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-client-contact-${client.id}`}>
                        {client.contactPerson || "—"}
                      </TableCell>
                      <TableCell data-testid={`badge-client-type-${client.id}`}>
                        {getClientTypeBadge(client.clientType)}
                      </TableCell>
                      <TableCell data-testid={`badge-client-status-${client.id}`}>
                        {getStatusBadge(client.status)}
                      </TableCell>
                      <TableCell data-testid={`text-client-phone-${client.id}`}>
                        {client.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {client.clientType === "prospect" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConvertToClient(client.id)}
                              disabled={convertToClientMutation.isPending}
                              data-testid={`button-convert-client-${client.id}`}
                              title="Convert to Client"
                            >
                              <UserCheck className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(client)}
                            data-testid={`button-edit-client-${client.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(client.id)}
                            disabled={deleteClientMutation.isPending}
                            data-testid={`button-delete-client-${client.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}