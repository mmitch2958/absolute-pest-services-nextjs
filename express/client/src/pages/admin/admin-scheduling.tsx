import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarIcon, User, MapPin, ClipboardList, AlertCircle,
  Clock, Plus, RefreshCw, UserCheck, Ban, Loader2, Check, PlusCircle,
  Home, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ScheduledJob {
  id: number;
  employeeId: number | null;
  employeeName: string;
  customerName: string;
  siteLocation: string;
  siteAddress: string | null;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  scheduledEndTime: string | null;
  status: string;
  priority: string;
  adminNotes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  scheduled:   { label: "Scheduled",   classes: "bg-blue-100 text-blue-800 border border-blue-300" },
  in_progress: { label: "In Progress", classes: "bg-yellow-100 text-yellow-800 border border-yellow-300" },
  completed:   { label: "Completed",   classes: "bg-green-100 text-green-800 border border-green-300" },
  cancelled:   { label: "Cancelled",   classes: "bg-red-100 text-red-800 border border-red-300" },
};

const PRIORITY_CONFIG: Record<string, { label: string; classes: string }> = {
  low:    { label: "Low",    classes: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", classes: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   classes: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", classes: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-gray-100 text-gray-700" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>{cfg.label}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? { label: priority, classes: "bg-gray-100 text-gray-700" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>{cfg.label}</span>;
}

function jobDisplayDate(dateStr: string) {
  try {
    return format(new Date(String(dateStr).slice(0, 10) + "T12:00:00"), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

interface Client { id: number; name: string; propertyType?: string; }

interface ClientComboboxProps {
  clients: Client[];
  value: string;
  clientId: number | null;
  onChange: (name: string, clientId: number | null) => void;
}

function ClientCombobox({ clients, value, clientId, onChange }: ClientComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputValue(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = inputValue.trim().length === 0
    ? clients
    : clients.filter(c => c.name.toLowerCase().includes(inputValue.toLowerCase()));

  const exactMatch = clients.find(c => c.name.toLowerCase() === inputValue.toLowerCase());
  const showAddNew = inputValue.trim().length > 0 && !exactMatch;

  const handleSelect = (client: Client) => {
    setInputValue(client.name);
    onChange(client.name, client.id);
    setOpen(false);
  };

  const handleAddNew = () => {
    onChange(inputValue.trim(), null);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={inputValue}
        placeholder="Type to search or enter new customer..."
        onChange={e => {
          setInputValue(e.target.value);
          setOpen(true);
          if (e.target.value.trim() === "") {
            onChange("", null);
          } else {
            const match = clients.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
            onChange(e.target.value, match?.id ?? null);
          }
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && (filtered.length > 0 || showAddNew) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {filtered.map(client => (
            <button
              key={client.id}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
              onMouseDown={e => { e.preventDefault(); handleSelect(client); }}
            >
              <Check className={`w-3 h-3 flex-shrink-0 ${clientId === client.id ? "opacity-100 text-primary" : "opacity-0"}`} />
              {client.name}
            </button>
          ))}
          {showAddNew && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-primary font-medium hover:bg-accent transition-colors border-t"
              onMouseDown={e => { e.preventDefault(); handleAddNew(); }}
            >
              <PlusCircle className="w-3 h-3 flex-shrink-0" />
              Add "{inputValue.trim()}" as new customer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface SuggestionComboboxProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function SuggestionCombobox({ options, value, onChange, placeholder = "Type to search or enter new...", disabled = false }: SuggestionComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setInputValue(value); }, [value]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = inputValue.trim().length === 0
    ? options
    : options.filter(o => o.toLowerCase().includes(inputValue.toLowerCase()));

  const exactMatch = options.some(o => o.toLowerCase() === inputValue.toLowerCase());
  const showAddNew = inputValue.trim().length > 0 && !exactMatch;

  const handleSelect = (opt: string) => {
    setInputValue(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        onChange={e => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && !disabled && (filtered.length > 0 || showAddNew) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-44 overflow-y-auto">
          {filtered.map(opt => (
            <button
              key={opt}
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-accent transition-colors"
              onMouseDown={e => { e.preventDefault(); handleSelect(opt); }}
            >
              <Check className={`w-3 h-3 flex-shrink-0 ${value === opt ? "opacity-100 text-primary" : "opacity-0"}`} />
              {opt}
            </button>
          ))}
          {showAddNew && (
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-primary font-medium hover:bg-accent transition-colors border-t"
              onMouseDown={e => { e.preventDefault(); handleSelect(inputValue.trim()); }}
            >
              <PlusCircle className="w-3 h-3 flex-shrink-0" />
              Add "{inputValue.trim()}" as new entry
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminScheduling() {
  const { toast } = useToast();

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const emptyJob = {
    customerName: "", clientId: null as number | null,
    siteLocation: "", siteAddress: "", servicedArea: "",
    workPerformed: "", jobDate: format(new Date(), "yyyy-MM-dd"),
    employeeId: "", priority: "medium", adminNotes: "", scheduledEndTime: "",
    propertyType: "residential",
  };
  const [newJob, setNewJob] = useState(emptyJob);
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [newJobDate, setNewJobDate] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const queryParams = () => {
    const p = new URLSearchParams();
    if (filterStatus !== "all") p.set("status", filterStatus);
    if (filterEmployee !== "all") p.set("employeeId", filterEmployee);
    if (filterDateFrom) p.set("dateFrom", filterDateFrom);
    if (filterDateTo) p.set("dateTo", filterDateTo);
    return p.toString();
  };

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; scheduledJobs: ScheduledJob[] }>({
    queryKey: ["/api/admin/scheduled-jobs", filterStatus, filterEmployee, filterDateFrom, filterDateTo],
    queryFn: async () => {
      const qs = queryParams();
      const res = await fetch(`/api/admin/scheduled-jobs${qs ? "?" + qs : ""}`, { credentials: "include" });
      return res.json();
    },
  });

  const { data: employeesData } = useQuery<{ success: boolean; employees: { id: number; name: string }[] }>({
    queryKey: ["/api/field/employees"],
    queryFn: async () => (await fetch("/api/field/employees", { credentials: "include" })).json(),
  });

  const { data: clientsData } = useQuery<{ success: boolean; clients: { id: number; name: string; propertyType?: string }[] }>({
    queryKey: ["/api/clients"],
    queryFn: async () => (await fetch("/api/clients", { credentials: "include" })).json(),
  });

  const { data: suggestionsData } = useQuery<{ success: boolean; customerLocations: Record<string, string[]>; locationAreas: Record<string, string[]> }>({
    queryKey: ["/api/admin/suggestions"],
    queryFn: async () => (await fetch("/api/admin/suggestions", { credentials: "include" })).json(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/admin/scheduled-jobs"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/scheduled-jobs", {
        customerName: newJob.customerName,
        clientId: newJob.clientId,
        siteLocation: newJob.siteLocation,
        siteAddress: newJob.siteAddress,
        servicedArea: newJob.servicedArea,
        workPerformed: newJob.workPerformed,
        jobDate: newJob.jobDate,
        employeeId: (newJob.employeeId && newJob.employeeId !== "none") ? parseInt(newJob.employeeId) : null,
        priority: newJob.priority,
        adminNotes: newJob.adminNotes,
        scheduledEndTime: newJob.scheduledEndTime || null,
        propertyType: newJob.propertyType,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Job created", description: "Scheduled job has been created." });
        setShowCreateDialog(false);
        setNewJob(emptyJob);
        invalidate();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    },
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/scheduled-jobs/${selectedJob?.id}/assign`, {
        employeeId: assignEmployeeId === "unassigned" ? null : parseInt(assignEmployeeId),
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Tech assigned", description: "Technician assignment updated." });
        setShowAssignDialog(false);
        setSelectedJob(null);
        invalidate();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/scheduled-jobs/${selectedJob?.id}/reschedule`, { jobDate: newJobDate });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Rescheduled", description: "Job date updated." });
        setShowRescheduleDialog(false);
        setSelectedJob(null);
        invalidate();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/scheduled-jobs/${selectedJob?.id}/cancel`, { reason: cancelReason });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "Job cancelled" });
        setShowCancelDialog(false);
        setSelectedJob(null);
        setCancelReason("");
        invalidate();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    },
  });

  const jobs = jobsData?.scheduledJobs ?? [];
  const employees = employeesData?.employees ?? [];
  const clients = clientsData?.clients ?? [];
  const customerLocations = suggestionsData?.customerLocations ?? {};
  const locationAreas = suggestionsData?.locationAreas ?? {};

  const locationsForCustomer: string[] = newJob.customerName
    ? customerLocations[newJob.customerName.toLowerCase()] ?? []
    : [];
  const areasForLocation: string[] = newJob.siteLocation
    ? locationAreas[newJob.siteLocation.toLowerCase()] ?? []
    : [];

  const stats = [
    { label: "Total",       value: jobs.length,                                              icon: ClipboardList, color: "text-blue-600" },
    { label: "Scheduled",   value: jobs.filter(j => j.status === "scheduled").length,        icon: Clock,         color: "text-blue-600" },
    { label: "In Progress", value: jobs.filter(j => j.status === "in_progress").length,      icon: RefreshCw,     color: "text-yellow-600" },
    { label: "Unassigned",  value: jobs.filter(j => !j.employeeId && j.status !== "cancelled").length, icon: AlertCircle, color: "text-orange-600" },
  ];

  const canAct = selectedJob && selectedJob.status !== "cancelled" && selectedJob.status !== "completed";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Scheduling</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage scheduled jobs for field technicians</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className={`w-8 h-8 opacity-70 ${s.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Technician</Label>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="w-40 h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Techs</SelectItem>
                  {employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" className="h-8 text-sm w-36" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" className="h-8 text-sm w-36" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => { setFilterStatus("all"); setFilterEmployee("all"); setFilterDateFrom(""); setFilterDateTo(""); }}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No scheduled jobs found. Click "Schedule Job" to create one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jobs.map(job => (
            <Card
              key={job.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !job.employeeId && job.status === "scheduled" ? "border-orange-300 bg-orange-50/40 dark:bg-orange-950/20" : ""
              }`}
              onClick={() => setSelectedJob(job)}
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{job.customerName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 flex-shrink-0" />{job.siteLocation}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <StatusBadge status={job.status} />
                    <PriorityBadge priority={job.priority || "medium"} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" />{jobDisplayDate(job.jobDate)}</span>
                  <span className={`flex items-center gap-1 ${!job.employeeId ? "text-orange-600 font-medium" : ""}`}>
                    <User className="w-3 h-3" />{job.employeeName}
                  </span>
                </div>
                {job.servicedArea && (
                  <p className="text-xs text-muted-foreground truncate"><span className="font-medium">Area:</span> {job.servicedArea}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={o => !o && setSelectedJob(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedJob?.customerName}</DialogTitle>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <StatusBadge status={selectedJob.status} />
                <PriorityBadge priority={selectedJob.priority || "medium"} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Job Date</p><p className="font-medium">{jobDisplayDate(selectedJob.jobDate)}</p></div>
                <div><p className="text-xs text-muted-foreground">Technician</p><p className={`font-medium ${!selectedJob.employeeId ? "text-orange-600" : ""}`}>{selectedJob.employeeName}</p></div>
                <div><p className="text-xs text-muted-foreground">Site Location</p><p className="font-medium">{selectedJob.siteLocation}</p></div>
                <div><p className="text-xs text-muted-foreground">Serviced Area</p><p className="font-medium">{selectedJob.servicedArea}</p></div>
              </div>
              {selectedJob.workPerformed && (
                <div><p className="text-xs text-muted-foreground">Work Performed</p><p className="text-sm mt-0.5">{selectedJob.workPerformed}</p></div>
              )}
              {selectedJob.adminNotes && (
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-xs text-muted-foreground mb-1">Admin Notes</p>
                  <p className="text-sm">{selectedJob.adminNotes}</p>
                </div>
              )}
              {canAct && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => { setAssignEmployeeId(selectedJob.employeeId ? String(selectedJob.employeeId) : "unassigned"); setShowAssignDialog(true); }}>
                    <UserCheck className="w-3 h-3 mr-1" /> Assign Tech
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setNewJobDate(String(selectedJob.jobDate).slice(0, 10)); setShowRescheduleDialog(true); }}>
                    <CalendarIcon className="w-3 h-3 mr-1" /> Reschedule
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setShowCancelDialog(true)}>
                    <Ban className="w-3 h-3 mr-1" /> Cancel Job
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Schedule New Job</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Customer Name *</Label>
              <ClientCombobox
                clients={clients}
                value={newJob.customerName}
                clientId={newJob.clientId}
                onChange={(name, id) => {
                  const knownClient = id ? clients.find(c => c.id === id) : null;
                  setNewJob(p => ({
                    ...p,
                    customerName: name,
                    clientId: id,
                    siteLocation: "",
                    servicedArea: "",
                    propertyType: knownClient?.propertyType ?? p.propertyType,
                  }));
                }}
              />
            </div>
            {newJob.customerName && (
              <div className="col-span-2">
                <Label>Property Type</Label>
                {newJob.clientId ? (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="flex items-center gap-1.5 text-sm py-1 px-2">
                      {newJob.propertyType === "commercial"
                        ? <><Building2 className="w-3.5 h-3.5" /> Commercial</>
                        : <><Home className="w-3.5 h-3.5" /> Residential</>
                      }
                    </Badge>
                    <span className="text-xs text-muted-foreground">Set on client record</span>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-1.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={newJob.propertyType === "residential" ? "default" : "outline"}
                      onClick={() => setNewJob(p => ({ ...p, propertyType: "residential" }))}
                      className="flex items-center gap-1.5"
                    >
                      <Home className="w-3.5 h-3.5" />
                      Residential
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={newJob.propertyType === "commercial" ? "default" : "outline"}
                      onClick={() => setNewJob(p => ({ ...p, propertyType: "commercial" }))}
                      className="flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      Commercial
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="col-span-2">
              <Label>
                Site Location *
                {locationsForCustomer.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({locationsForCustomer.length} saved locations)</span>
                )}
              </Label>
              <SuggestionCombobox
                options={locationsForCustomer}
                value={newJob.siteLocation}
                placeholder={newJob.customerName ? "Type to search or enter new location..." : "Select a customer first"}
                disabled={!newJob.customerName}
                onChange={val => setNewJob(p => ({ ...p, siteLocation: val, servicedArea: "" }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Street Address</Label>
              <Input value={newJob.siteAddress} onChange={e => setNewJob(p => ({ ...p, siteAddress: e.target.value }))} placeholder="e.g. 123 Main St" />
            </div>
            <div className="col-span-2">
              <Label>
                Area to Service *
                {areasForLocation.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">({areasForLocation.length} saved areas)</span>
                )}
              </Label>
              <SuggestionCombobox
                options={areasForLocation}
                value={newJob.servicedArea}
                placeholder={newJob.siteLocation ? "Type to search or enter new area..." : "Select a location first"}
                disabled={!newJob.siteLocation}
                onChange={val => setNewJob(p => ({ ...p, servicedArea: val }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Work to Perform</Label>
              <Textarea value={newJob.workPerformed} onChange={e => setNewJob(p => ({ ...p, workPerformed: e.target.value }))} placeholder="Describe the planned work..." rows={2} />
            </div>
            <div>
              <Label>Job Date *</Label>
              <Input type="date" value={newJob.jobDate} onChange={e => setNewJob(p => ({ ...p, jobDate: e.target.value }))} />
            </div>
            <div>
              <Label>Expected End Time</Label>
              <Input type="datetime-local" value={newJob.scheduledEndTime} onChange={e => setNewJob(p => ({ ...p, scheduledEndTime: e.target.value }))} />
            </div>
            <div>
              <Label>Assign Technician</Label>
              <Select value={newJob.employeeId} onValueChange={v => setNewJob(p => ({ ...p, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={newJob.priority} onValueChange={v => setNewJob(p => ({ ...p, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Admin Notes</Label>
              <Textarea value={newJob.adminNotes} onChange={e => setNewJob(p => ({ ...p, adminNotes: e.target.value }))} placeholder="Internal notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !newJob.customerName || !newJob.siteLocation || !newJob.servicedArea || !newJob.jobDate}>
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tech Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Assign Technician</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Select a technician for <strong>{selectedJob?.customerName}</strong></p>
          <Select value={assignEmployeeId} onValueChange={setAssignEmployeeId}>
            <SelectTrigger><SelectValue placeholder="Select technician" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancel</Button>
            <Button onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending}>
              {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reschedule Job</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">New date for <strong>{selectedJob?.customerName}</strong></p>
          <Input type="date" value={newJobDate} onChange={e => setNewJobDate(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>Cancel</Button>
            <Button onClick={() => rescheduleMutation.mutate()} disabled={rescheduleMutation.isPending || !newJobDate}>
              {rescheduleMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Cancel Job</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Cancel job for <strong>{selectedJob?.customerName}</strong>? This cannot be undone.</p>
          <div>
            <Label>Reason (optional)</Label>
            <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason for cancellation..." rows={2} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Job</Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Cancel Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
