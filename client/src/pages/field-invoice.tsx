import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FieldNav } from "@/components/field-nav";
import {
  Receipt,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  MapPin,
  Calendar,
} from "lucide-react";

interface JobLog {
  id: number;
  customerName: string;
  clientId: number | null;
  siteLocation: string;
  servicedArea: string;
  workPerformed: string;
  jobDate: string;
  amount: string | null;
  status: string;
}

export default function FieldInvoice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

  const employee = (() => {
    try {
      return JSON.parse(localStorage.getItem("fieldEmployee") || "null");
    } catch {
      return null;
    }
  })();

  const { data: logsData, isLoading } = useQuery<{ success: boolean; jobLogs: JobLog[] }>({
    queryKey: ["/api/field/job-logs"],
    enabled: !!employee,
  });

  const allLogs = logsData?.jobLogs || [];
  const completedLogs = allLogs.filter(l => l.status === "completed");

  const grouped = useMemo(() => {
    const map: Record<string, JobLog[]> = {};
    for (const log of completedLogs) {
      const key = log.customerName;
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [completedLogs]);

  const toggle = (id: number) => {
    const log = completedLogs.find(l => l.id === id);
    if (!log?.clientId) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllForCustomer = (logs: JobLog[]) => {
    const linkable = logs.filter(l => l.clientId);
    if (linkable.length === 0) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      const allSelected = linkable.every(l => next.has(l.id));
      if (allSelected) {
        linkable.forEach(l => next.delete(l.id));
      } else {
        linkable.forEach(l => next.add(l.id));
      }
      return next;
    });
  };

  const selectedLogs = completedLogs.filter(l => selectedIds.has(l.id));
  const selectedTotal = selectedLogs.reduce((sum, l) => sum + parseFloat(String(l.amount || "200")), 0);
  const taxAmount = selectedTotal * 0.06;
  const grandTotal = selectedTotal + taxAmount;

  const allSameClient = selectedLogs.length > 0 &&
    selectedLogs.every(l => l.clientId === selectedLogs[0].clientId);

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/field/create-invoice", {
        jobLogIds: Array.from(selectedIds),
        dueDate,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Invoice Created!",
          description: `Draft invoice #${data.invoice?.invoiceNumber || ""} — $${grandTotal.toFixed(2)}`,
        });
        setSelectedIds(new Set());
        queryClient.invalidateQueries({ queryKey: ["/api/field/job-logs"] });
      }
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  if (!employee) {
    setLocation("/field");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => setLocation("/field/log")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Receipt className="h-6 w-6" />
        <h1 className="text-lg font-bold">Create Invoice</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : completedLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Completed Jobs</h3>
              <p className="text-muted-foreground text-sm">Complete some jobs first, then come back to create an invoice.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Select completed jobs to include in the invoice. All selected jobs must be for the same customer.</p>

            {grouped.map(([customerName, logs]) => (
              <Card key={customerName}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{customerName}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => selectAllForCustomer(logs)}
                    >
                      {logs.filter(l => l.clientId).length > 0 && logs.filter(l => l.clientId).every(l => selectedIds.has(l.id)) ? "Deselect All" : "Select All"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {logs.map((log) => {
                    const hasClient = !!log.clientId;
                    return (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          !hasClient ? "opacity-60 cursor-not-allowed bg-muted/30" :
                          selectedIds.has(log.id) ? "bg-primary/10 border-primary cursor-pointer" : "hover:bg-muted/50 cursor-pointer"
                        }`}
                        onClick={() => toggle(log.id)}
                      >
                        <Checkbox
                          checked={selectedIds.has(log.id)}
                          onCheckedChange={() => toggle(log.id)}
                          disabled={!hasClient}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{log.servicedArea}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.workPerformed}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(String(log.jobDate).slice(0, 10) + "T12:00:00").toLocaleDateString()}
                            </span>
                            <span>{log.siteLocation}</span>
                          </div>
                          {!hasClient && (
                            <p className="text-xs text-amber-600 mt-1 font-medium">No client linked — ask admin to link this customer</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-sm">${parseFloat(String(log.amount || "200")).toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            {selectedIds.size > 0 && (
              <Card className="border-primary">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <DollarSign className="h-4 w-4" />
                    Invoice Summary — {selectedLogs.length} job{selectedLogs.length !== 1 ? "s" : ""}
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${selectedTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax (6%)</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base pt-1 border-t">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Due Date</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  {!allSameClient && selectedLogs.length > 1 && (
                    <p className="text-xs text-destructive">All selected jobs must be for the same customer.</p>
                  )}

                  <Button
                    className="w-full h-12 text-base font-semibold"
                    onClick={() => createInvoiceMutation.mutate()}
                    disabled={createInvoiceMutation.isPending || !allSameClient || selectedIds.size === 0}
                  >
                    {createInvoiceMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                        Creating...
                      </div>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Create Draft Invoice
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <FieldNav />
    </div>
  );
}
