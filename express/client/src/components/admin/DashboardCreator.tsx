import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, BarChart3, Eye, Globe, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import type { Dashboard, InsertDashboard, Project } from "@shared/schema";
import { insertDashboardSchema } from "@shared/schema";

const dashboardFormSchema = insertDashboardSchema
  .omit({ createdBy: true })
  .extend({
    id: z.number().optional(),
  });

type DashboardFormData = z.infer<typeof dashboardFormSchema>;

export function DashboardCreator() {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<DashboardFormData>({
    resolver: zodResolver(dashboardFormSchema),
    defaultValues: {
      title: "",
      type: "project",
      isPublic: false,
      projectId: undefined,
    },
  });

  // Fetch dashboards
  const { data: dashboardsResponse, isLoading } = useQuery({
    queryKey: ["/api/dashboards"],
    select: (data: any) => data.dashboards as Dashboard[],
  });

  // Fetch projects for dropdown
  const { data: projectsResponse } = useQuery({
    queryKey: ["/api/projects"],
    select: (data: any) => data.projects as Project[],
  });

  // Create dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: async (data: InsertDashboard) => {
      const response = await apiRequest("POST", "/api/dashboards", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Dashboard created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create dashboard",
        variant: "destructive",
      });
    },
  });

  // Update dashboard mutation
  const updateDashboardMutation = useMutation({
    mutationFn: async ({ id, ...data }: DashboardFormData) => {
      const response = await apiRequest("PUT", `/api/dashboards/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      setIsDialogOpen(false);
      setSelectedDashboard(null);
      form.reset();
      toast({
        title: "Success",
        description: "Dashboard updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update dashboard",
        variant: "destructive",
      });
    },
  });

  // Delete dashboard mutation
  const deleteDashboardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/dashboards/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Success",
        description: "Dashboard deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete dashboard",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DashboardFormData) => {
    if (selectedDashboard) {
      updateDashboardMutation.mutate({ ...data, id: selectedDashboard.id });
    } else {
      const { id, ...insertData } = data;
      createDashboardMutation.mutate(insertData);
    }
  };

  const handleEdit = (dashboard: Dashboard) => {
    setSelectedDashboard(dashboard);
    form.reset({
      title: dashboard.title,
      type: dashboard.type,
      isPublic: dashboard.isPublic,
      projectId: dashboard.projectId || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this dashboard?")) {
      deleteDashboardMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setSelectedDashboard(null);
    form.reset();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      handleDialogClose();
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      project: "default",
      client: "secondary",
      overview: "outline",
    };
    return <Badge variant={variants[type] || "default"}>{type}</Badge>;
  };

  const getVisibilityIcon = (isPublic: boolean) => {
    return isPublic ? (
      <Globe className="w-4 h-4 text-green-600" />
    ) : (
      <Lock className="w-4 h-4 text-gray-600" />
    );
  };

  const getProjectName = (projectId: number | null) => {
    if (!projectId) return "—";
    const project = projectsResponse?.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const dashboards = dashboardsResponse || [];
  const projects = projectsResponse || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Management</h1>
          <p className="text-muted-foreground">
            Create and manage analytics dashboards for your projects
          </p>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          data-testid="button-create-dashboard"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Dashboard
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedDashboard ? "Edit Dashboard" : "Create New Dashboard"}
              </DialogTitle>
              <DialogDescription>
                {selectedDashboard 
                  ? "Update the dashboard information below."
                  : "Create a new dashboard to visualize project data and analytics."
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dashboard Title</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter dashboard title"
                          data-testid="input-dashboard-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-dashboard-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="overview">Overview</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} 
                          value={field.value?.toString() || "none"}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-dashboard-project">
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Public Access</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Allow public access to this dashboard
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-dashboard-public"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    data-testid="button-cancel-dashboard"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createDashboardMutation.isPending || updateDashboardMutation.isPending}
                    data-testid="button-save-dashboard"
                  >
                    {createDashboardMutation.isPending || updateDashboardMutation.isPending
                      ? "Saving..."
                      : selectedDashboard
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
            <BarChart3 className="w-5 h-5" />
            Dashboards
          </CardTitle>
          <CardDescription>
            {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} for data visualization and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8" data-testid="loading-dashboards">
              Loading dashboards...
            </div>
          ) : dashboards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-dashboards">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No dashboards yet. Create your first dashboard to visualize project data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboards.map((dashboard) => (
                    <TableRow key={dashboard.id} data-testid={`row-dashboard-${dashboard.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium" data-testid={`text-dashboard-title-${dashboard.id}`}>
                              {dashboard.title}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`badge-dashboard-type-${dashboard.id}`}>
                        {getTypeBadge(dashboard.type)}
                      </TableCell>
                      <TableCell data-testid={`text-dashboard-project-${dashboard.id}`}>
                        {getProjectName(dashboard.projectId)}
                      </TableCell>
                      <TableCell data-testid={`icon-dashboard-visibility-${dashboard.id}`}>
                        <div className="flex items-center gap-2">
                          {getVisibilityIcon(dashboard.isPublic)}
                          <span className="text-sm text-muted-foreground">
                            {dashboard.isPublic ? "Public" : "Private"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-dashboard-created-${dashboard.id}`}>
                        {new Date(dashboard.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(dashboard)}
                            data-testid={`button-edit-dashboard-${dashboard.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dashboard.id)}
                            disabled={deleteDashboardMutation.isPending}
                            data-testid={`button-delete-dashboard-${dashboard.id}`}
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