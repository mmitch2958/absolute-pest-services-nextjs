import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { generateJobReport, generateJobReceipt } from "@/lib/pdf-report";
import { FileDown, Search, Loader2, ClipboardList, Camera, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import { displayDate, getLocalDateString } from "@/lib/utils";

// ─── Photo types ──────────────────────────────────────────────────────────────
interface JobLogPhoto {
  id: number;
  jobLogId: number;
  url: string;
  caption: string | null;
  uploadedAt: string;
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ log }: { log: any; employees: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const status = log.status || "completed";

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/job-logs/${log.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast({ title: "Status Updated", description: "Job log status successfully updated." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/job-logs"] });
    } catch (err) {
      toast({ title: "Update Failed", description: "Could not update status.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeVariant = (s: string) => {
    switch (s) {
      case "scheduled": return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      case "in_progress": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
      case "completed": return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
      case "invoiced": return "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200";
      case "paid": return "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
    }
  };

  const formatStatus = (s: string) => {
    if (!s) return "Unknown";
    return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Select disabled={isUpdating} value={status} onValueChange={handleStatusChange}>
      <SelectTrigger className={`h-8 text-xs border cursor-pointer border-0 bg-transparent ${getStatusBadgeVariant(status)} rounded-full px-3 py-1 font-medium transition-colors w-[130px]`}>
        <div className="flex items-center gap-1.5">
          {isUpdating && <Loader2 className="w-3 h-3 animate-spin inline mr-1" />}
          <span className="truncate">{formatStatus(status)}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="scheduled">Scheduled</SelectItem>
        <SelectItem value="in_progress">In Progress</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="invoiced">Invoiced</SelectItem>
        <SelectItem value="paid">Paid</SelectItem>
      </SelectContent>
    </Select>
  );
}

// ─── Admin Lightbox ───────────────────────────────────────────────────────────
interface AdminLightboxProps {
  photos: JobLogPhoto[];
  initialIndex: number;
  onClose: () => void;
}

function AdminLightbox({ photos, initialIndex, onClose }: AdminLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const photo = photos[current];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        {photos.length > 1 && (
          <button
            onClick={() => setCurrent(i => (i - 1 + photos.length) % photos.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={photo.url}
          alt={photo.caption || `Photo ${current + 1}`}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />

        {photos.length > 1 && (
          <button
            onClick={() => setCurrent(i => (i + 1) % photos.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {photo.caption && (
          <p className="text-white/80 text-sm text-center mt-3">{photo.caption}</p>
        )}
        <p className="text-white/40 text-xs text-center mt-1">
          {current + 1} / {photos.length}
        </p>
      </div>
    </div>
  );
}

// ─── AdminPhotoRow — expandable photo grid for a log row ──────────────────────
interface AdminPhotoRowProps {
  logId: number;
}

function AdminPhotoRow({ logId }: AdminPhotoRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightbox, setLightbox] = useState<{ photos: JobLogPhoto[]; index: number } | null>(null);

  const { data, isLoading } = useQuery<{ success: boolean; photos: JobLogPhoto[] }>({
    queryKey: ["/api/admin/job-logs", logId, "photos"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/job-logs/${logId}/photos`, { credentials: "include" });
      return res.json();
    },
    enabled: expanded,
  });

  // Do a lightweight count-only check to show badge
  const { data: countData } = useQuery<{ success: boolean; photos: JobLogPhoto[] }>({
    queryKey: ["/api/admin/job-logs", logId, "photos", "count"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/job-logs/${logId}/photos`, { credentials: "include" });
      return res.json();
    },
  });

  const photoCount = countData?.photos?.length ?? 0;
  const photos = data?.photos || [];

  if (photoCount === 0) return null;

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Camera className="w-3.5 h-3.5" />
        <span>{photoCount} Photo{photoCount !== 1 ? "s" : ""}</span>
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {/* Photo grid */}
      {expanded && (
        <div className="mt-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
            >
              {photos.map((photo, idx) => (
                <div key={photo.id} className="rounded-md overflow-hidden border border-border">
                  <button
                    type="button"
                    onClick={() => setLightbox({ photos, index: idx })}
                    className="w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={photo.caption ? `View: ${photo.caption}` : `View photo ${idx + 1}`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || `Photo ${idx + 1}`}
                      className="w-full object-cover"
                      style={{ aspectRatio: "4 / 3" }}
                    />
                  </button>
                  {photo.caption && (
                    <p className="px-2 py-1 text-xs text-muted-foreground truncate">{photo.caption}</p>
                  )}
                  <p className="px-2 pb-1 text-xs text-muted-foreground/60">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {lightbox && (
        <AdminLightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  );
}

export function AdminReports() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (selectedCustomer && selectedCustomer !== "all") params.set("customerName", selectedCustomer);
    if (selectedEmployee && selectedEmployee !== "all") params.set("employeeId", selectedEmployee);
    if (selectedLocation && selectedLocation !== "all") params.set("siteLocation", selectedLocation);
    if (selectedArea && selectedArea !== "all") params.set("servicedArea", selectedArea);
    if (selectedStatus && selectedStatus !== "all") params.set("status", selectedStatus);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      params.set("dateTo", endDate.toISOString());
    }
    return params.toString();
  };

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: any[]; employees: any[] }>({
    queryKey: ["/api/admin/job-logs", dateFrom, dateTo, selectedCustomer, selectedEmployee, selectedLocation, selectedArea, selectedStatus, searchTriggered],
    queryFn: async () => {
      const query = buildQuery();
      const res = await fetch(`/api/admin/job-logs?${query}`, { credentials: "include" });
      return res.json();
    },
    enabled: searchTriggered,
  });

  const allLogsQuery = useQuery<{ success: boolean; jobLogs: any[]; employees: any[] }>({
    queryKey: ["/api/admin/job-logs", "all"],
    queryFn: async () => {
      const res = await fetch("/api/admin/job-logs", { credentials: "include" });
      return res.json();
    },
  });

  const logs = data?.jobLogs || [];
  const employees = data?.employees || allLogsQuery.data?.employees || [];
  const allLogs = allLogsQuery.data?.jobLogs || [];

  const uniqueCustomers = Array.from(new Set(allLogs.map((l: any) => l.customerName?.trim()).filter(Boolean))).sort();
  const uniqueLocations = Array.from(new Set(allLogs.map((l: any) => l.siteLocation?.trim()).filter(Boolean))).sort();
  const uniqueAreas = Array.from(new Set(allLogs.map((l: any) => l.servicedArea?.trim()).filter(Boolean))).sort();

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const handleClear = () => {
    setSelectedCustomer("");
    setSelectedEmployee("");
    setSelectedLocation("");
    setSelectedArea("");
    setDateFrom("");
    setDateTo("");
    setSearchTriggered(false);
  };

  const [pdfGenerating, setPdfGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (logs.length === 0) {
      toast({ title: "No data", description: "No job logs to include in the report", variant: "destructive" });
      return;
    }

    const customerLabel = selectedCustomer && selectedCustomer !== "all"
      ? selectedCustomer
      : "All Customers";

    setPdfGenerating(true);
    try {
      await generateJobReport({
        customerName: customerLabel,
        dateFrom: dateFrom || "Start",
        dateTo: dateTo || getLocalDateString(),
        logs,
        employees: employees.map((e: any) => ({ id: e.id, name: e.name })),
      });
      toast({ title: "PDF Downloaded", description: "Report has been saved to your device" });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast({ title: "PDF Error", description: "Failed to generate report", variant: "destructive" });
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDownloadReceipt = async (log: any) => {
    try {
      await generateJobReceipt({
        id: log.id,
        customerName: log.customerName,
        siteLocation: log.siteLocation,
        siteAddress: log.siteAddress,
        servicedArea: log.servicedArea,
        workPerformed: log.workPerformed,
        jobDate: log.jobDate,
        customFields: log.customFields,
        photos: log.photos,
        employeeName: employeeMap.get(log.employeeId) || "Unknown",
      });
      toast({ title: "Receipt Downloaded", description: "Receipt has been saved to your device" });
    } catch (err) {
      console.error("Receipt generation error:", err);
      toast({ title: "Receipt Error", description: "Failed to generate receipt", variant: "destructive" });
    }
  };

  const employeeMap = new Map(employees.map((e: any) => [e.id, e.name]));

  const EmployeePhotoRow = AdminPhotoRow;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Service Reports</h1>
          <p className="text-muted-foreground">Generate PDF reports from field service job logs</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Filter Job Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {uniqueCustomers.map((name: string) => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {employees.map((emp: any) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Site Location <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((loc: string) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Serviced Area <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {uniqueAreas.map((area: string) => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF} disabled={logs.length === 0 || pdfGenerating}>
              {pdfGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
              ) : (
                <><FileDown className="w-4 h-4 mr-2" />Download PDF</>
              )}
            </Button>
            <Button variant="ghost" onClick={handleClear}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : searchTriggered ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Results ({logs.length} entries)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No job logs found for the selected filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Work Performed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">{displayDate(log.jobDate)}</TableCell>
                        <TableCell>{employeeMap.get(log.employeeId) || "Unknown"}</TableCell>
                        <TableCell>{log.customerName}</TableCell>
                        <TableCell>{log.siteLocation}</TableCell>
                        <TableCell>{log.servicedArea}</TableCell>
                        <TableCell>
                          <StatusBadge log={log} employees={employees} />
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div>{log.workPerformed}</div>
                          {log.customFields && typeof log.customFields === "object" && Object.keys(log.customFields).length > 0 && (
                            <div className="mt-1 pt-1 border-t text-xs text-muted-foreground space-y-0.5">
                              {Object.entries(log.customFields).map(([key, value]) => (
                                <div key={key}>
                                  <span className="capitalize">{key.replace(/_/g, " ")}: </span>
                                  <span className="text-foreground">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <AdminPhotoRow logId={log.id} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(log)}
                            title="Download Receipt"
                          >
                            <FileDown className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Set your filters and click Search to view job logs</p>
        </div>
      )}
    </div>
  );
}
