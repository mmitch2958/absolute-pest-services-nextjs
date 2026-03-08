import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { generateJobReport } from "@/lib/pdf-report";
import { FieldNav } from "@/components/field-nav";
import { FileDown, Search, Loader2, Calendar, MapPin, Wrench } from "lucide-react";

export default function FieldReports() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<any>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("fieldEmployee");
    if (!stored) {
      setLocation("/field");
      return;
    }
    const emp = JSON.parse(stored);
    if (!emp.canManageEmployees) {
      setLocation("/field/log");
      return;
    }
    setEmployee(emp);
  }, []);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (selectedCustomer && selectedCustomer !== "all") params.set("customerName", selectedCustomer);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      params.set("dateTo", endDate.toISOString());
    }
    return params.toString();
  };

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: any[]; employees: any[] }>({
    queryKey: ["/api/admin/job-logs", dateFrom, dateTo, selectedCustomer, searchTriggered],
    queryFn: async () => {
      const query = buildQuery();
      const res = await fetch(`/api/admin/job-logs?${query}`, { credentials: "include" });
      return res.json();
    },
    enabled: searchTriggered,
  });

  const allLogsQuery = useQuery<{ success: boolean; jobLogs: any[]; employees: any[] }>({
    queryKey: ["/api/admin/job-logs", "all-field"],
    queryFn: async () => {
      const res = await fetch("/api/admin/job-logs", { credentials: "include" });
      return res.json();
    },
    enabled: !!employee,
  });

  const logs = data?.jobLogs || [];
  const employees = data?.employees || allLogsQuery.data?.employees || [];
  const allLogs = allLogsQuery.data?.jobLogs || [];
  const uniqueCustomers = [...new Set(allLogs.map((l: any) => l.customerName))].sort();
  const employeeMap = new Map(employees.map((e: any) => [e.id, e.name]));

  const handleSearch = () => {
    setSearchTriggered(true);
  };

  const handleDownloadPDF = () => {
    if (logs.length === 0) {
      toast({ title: "No data", description: "No job logs to include in the report", variant: "destructive" });
      return;
    }
    const customerLabel = selectedCustomer && selectedCustomer !== "all" ? selectedCustomer : "All Customers";
    generateJobReport({
      customerName: customerLabel,
      dateFrom: dateFrom || "Start",
      dateTo: dateTo || new Date().toISOString().split("T")[0],
      logs,
      employees: employees.map((e: any) => ({ id: e.id, name: e.name })),
    });
    toast({ title: "PDF Downloaded" });
  };

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-lg font-bold mb-4">Service Reports</h1>

        <Card className="mb-4">
          <CardContent className="pt-4 space-y-3">
            <div>
              <Label>Customer</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger className="mt-1 h-12">
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1 h-12" />
              </div>
              <div>
                <Label>To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1 h-12" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="flex-1 h-12">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} disabled={logs.length === 0} className="flex-1 h-12">
                <FileDown className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : searchTriggered && logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No job logs found for the selected filters
          </div>
        ) : searchTriggered ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{logs.length} entries found</p>
            {logs.map((log: any) => (
              <Card key={log.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{log.customerName}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.jobDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{log.siteLocation}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Wrench className="w-3.5 h-3.5 mt-0.5" />
                      <span>{log.workPerformed}</span>
                    </div>
                    <p className="text-xs mt-1">Tech: {employeeMap.get(log.employeeId) || "Unknown"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Set filters and tap Search</p>
          </div>
        )}
      </div>
      <FieldNav canManageEmployees={employee.canManageEmployees} />
    </div>
  );
}
