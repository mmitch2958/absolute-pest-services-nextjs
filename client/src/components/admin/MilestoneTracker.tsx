import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Target, Calendar, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

import type { Milestone, InsertMilestone, Project } from "@shared/schema";
import { insertMilestoneSchema } from "@shared/schema";

const milestoneFormSchema = insertMilestoneSchema.extend({
  id: z.number().optional(),
  dueDate: z.date().optional(),
});

type MilestoneFormData = z.infer<typeof milestoneFormSchema>;

export function MilestoneTracker() {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      progress: 0,
      notes: "",
      projectId: 0,
    },
  });

  // Fetch milestones
  const { data: milestonesResponse, isLoading: milestonesLoading } = useQuery({
    queryKey: ["/api/milestones"],
    select: (data: any) => data.milestones as Milestone[],
  });

  // Fetch projects for dropdown
  const { data: projectsResponse } = useQuery({
    queryKey: ["/api/projects"],
    select: (data: any) => data.projects as Project[],
  });

  // Fetch milestones for selected project
  const { data: projectMilestonesResponse } = useQuery({
    queryKey: ["/api/projects", selectedProjectId, "milestones"],
    queryFn: selectedProjectId 
      ? () => apiRequest(`/api/projects/${selectedProjectId}/milestones`)
      : undefined,
    enabled: !!selectedProjectId,
    select: (data: any) => data.milestones as Milestone[],
  });

  // Create milestone mutation
  const createMilestoneMutation = useMutation({
    mutationFn: async (data: InsertMilestone) => {
      const response = await apiRequest("POST", "/api/milestones", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      if (selectedProjectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "milestones"] });
      }
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Milestone created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create milestone",
        variant: "destructive",
      });
    },
  });

  // Update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: async ({ id, ...data }: MilestoneFormData) => {
      const response = await apiRequest("PUT", `/api/milestones/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      if (selectedProjectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "milestones"] });
      }
      setIsDialogOpen(false);
      setSelectedMilestone(null);
      form.reset();
      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update milestone",
        variant: "destructive",
      });
    },
  });

  // Delete milestone mutation
  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/milestones/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      if (selectedProjectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", selectedProjectId, "milestones"] });
      }
      toast({
        title: "Success",
        description: "Milestone deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete milestone",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MilestoneFormData) => {
    const formattedData = {
      ...data,
      dueDate: data.dueDate,
      progress: data.progress || 0,
    };

    if (selectedMilestone) {
      updateMilestoneMutation.mutate({ ...formattedData, id: selectedMilestone.id });
    } else {
      const { id, ...insertData } = formattedData;
      createMilestoneMutation.mutate(insertData);
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    form.reset({
      title: milestone.title,
      description: milestone.description ?? "",
      status: milestone.status,
      progress: milestone.progress || 0,
      notes: milestone.notes ?? "",
      projectId: milestone.projectId,
      dueDate: milestone.dueDate ? new Date(milestone.dueDate) : undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this milestone?")) {
      deleteMilestoneMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMilestone(null);
    form.reset();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      in_progress: "default",
      completed: "secondary",
      cancelled: "destructive",
    };
    const icons: Record<string, any> = {
      pending: Circle,
      in_progress: AlertCircle,
      completed: CheckCircle2,
      cancelled: Circle,
    };
    const Icon = icons[status] || Circle;
    
    return (
      <Badge variant={variants[status] || "default"} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getProjectName = (projectId: number) => {
    const project = projectsResponse?.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  const displayMilestones = selectedProjectId ? projectMilestonesResponse || [] : milestonesResponse || [];
  const projects = projectsResponse || [];

  // Calculate summary statistics
  const completedMilestones = displayMilestones.filter(m => m.status === 'completed').length;
  const totalMilestones = displayMilestones.length;
  const completionRate = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Milestone Tracker</h1>
          <p className="text-muted-foreground">
            Track project milestones and monitor progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            onValueChange={(value) => setSelectedProjectId(value === "all" ? null : parseInt(value))}
            value={selectedProjectId?.toString() || "all"}
          >
            <SelectTrigger className="w-[200px]" data-testid="select-filter-project">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                data-testid="button-create-milestone"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {selectedMilestone ? "Edit Milestone" : "Create New Milestone"}
                </DialogTitle>
                <DialogDescription>
                  {selectedMilestone 
                    ? "Update the milestone information below."
                    : "Add a new milestone to track project progress."
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
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter milestone title"
                            data-testid="input-milestone-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger data-testid="select-milestone-project">
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
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
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Enter milestone description"
                            data-testid="textarea-milestone-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-milestone-status">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="progress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Progress (%)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-milestone-progress"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-milestone-due-date"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick due date</span>
                                )}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
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
                            placeholder="Enter additional notes"
                            data-testid="textarea-milestone-notes"
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
                      onClick={handleDialogClose}
                      data-testid="button-cancel-milestone"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMilestoneMutation.isPending || updateMilestoneMutation.isPending}
                      data-testid="button-save-milestone"
                    >
                      {createMilestoneMutation.isPending || updateMilestoneMutation.isPending
                        ? "Saving..."
                        : selectedMilestone
                        ? "Update"
                        : "Create"
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">Total Milestones</div>
            </div>
            <div className="text-2xl font-bold" data-testid="stat-total-milestones">{totalMilestones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">Completed</div>
            </div>
            <div className="text-2xl font-bold" data-testid="stat-completed-milestones">{completedMilestones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-sm font-medium text-muted-foreground">Completion Rate</div>
            </div>
            <div className="text-2xl font-bold" data-testid="stat-completion-rate">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            {selectedProjectId ? `${getProjectName(selectedProjectId)} Milestones` : "All Milestones"}
          </CardTitle>
          <CardDescription>
            {displayMilestones.length} milestone{displayMilestones.length !== 1 ? 's' : ''}
            {selectedProjectId ? " for this project" : " across all projects"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {milestonesLoading ? (
            <div className="text-center py-8" data-testid="loading-milestones">
              Loading milestones...
            </div>
          ) : displayMilestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-milestones">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No milestones yet. Create your first milestone to track progress.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayMilestones.map((milestone) => (
                    <TableRow key={milestone.id} data-testid={`row-milestone-${milestone.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium" data-testid={`text-milestone-title-${milestone.id}`}>
                            {milestone.title}
                          </div>
                          {milestone.description && (
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {milestone.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-milestone-project-${milestone.id}`}>
                        {getProjectName(milestone.projectId)}
                      </TableCell>
                      <TableCell data-testid={`badge-milestone-status-${milestone.id}`}>
                        {getStatusBadge(milestone.status)}
                      </TableCell>
                      <TableCell data-testid={`progress-milestone-${milestone.id}`}>
                        <div className="flex items-center space-x-2">
                          <Progress value={milestone.progress || 0} className="w-16" />
                          <span className="text-sm font-medium">{milestone.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-milestone-due-${milestone.id}`}>
                        {milestone.dueDate ? format(new Date(milestone.dueDate), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(milestone)}
                            data-testid={`button-edit-milestone-${milestone.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(milestone.id)}
                            disabled={deleteMilestoneMutation.isPending}
                            data-testid={`button-delete-milestone-${milestone.id}`}
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