import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { generateJobReport } from "@/lib/pdf-report";
import { FileDown, Search, Loader2, ClipboardList } from "lucide-react";

export function AdminReports() {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (selectedCustomer && selectedCustomer !== "all") params.set("customerName", selectedCustomer);
    if (selectedEmployee && selectedEmployee !== "all") params.set("employeeId", selectedEmployee);
    if (selectedLocation && selectedLocation !== "all") params.set("siteLocation", selectedLocation);
    if (selectedArea && selectedArea !== "all") params.set("servicedArea", selectedArea);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      params.set("dateTo", endDate.toISOString());
    }
    return params.toString();
  };

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: any[]; employees: any[] }>({
    queryKey: ["/api/admin/job-logs", dateFrom, dateTo, selectedCustomer, selectedEmployee, selectedLocation, selectedArea, searchTriggered],
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

  const uniqueCustomers = [...new Set(allLogs.map((l: any) => l.customerName?.trim()).filter(Boolean))].sort();
  const uniqueLocations = [...new Set(allLogs.map((l: any) => l.siteLocation?.trim()).filter(Boolean))].sort();
  const uniqueAreas = [...new Set(allLogs.map((l: any) => l.servicedArea?.trim()).filter(Boolean))].sort();

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

  const handleDownloadPDF = () => {
    if (logs.length === 0) {
      toast({ title: "No data", description: "No job logs to include in the report", variant: "destructive" });
      return;
    }

    const customerLabel = selectedCustomer && selectedCustomer !== "all"
      ? selectedCustomer
      : "All Customers";

    generateJobReport({
      customerName: customerLabel,
      dateFrom: dateFrom || "Start",
      dateTo: dateTo || new Date().toISOString().split("T")[0],
      logs,
      employees: employees.map((e: any) => ({ id: e.id, name: e.name })),
    });

    toast({ title: "PDF Downloaded", description: "Report has been saved to your device" });
  };

  const employeeMap = new Map(employees.map((e: any) => [e.id, e.name]));

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
            <Button variant="outline" onClick={handleDownloadPDF} disabled={logs.length === 0}>
              <FileDown className="w-4 h-4 mr-2" />
              Download PDF
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
                      <TableHead>Work Performed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">{new Date(log.jobDate).toLocaleDateString()}</TableCell>
                        <TableCell>{employeeMap.get(log.employeeId) || "Unknown"}</TableCell>
                        <TableCell>{log.customerName}</TableCell>
                        <TableCell>{log.siteLocation}</TableCell>
                        <TableCell>{log.servicedArea}</TableCell>
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
