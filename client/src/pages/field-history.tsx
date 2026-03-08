import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FieldNav } from "@/components/field-nav";
import { MapPin, Calendar, Wrench, Building2, Loader2 } from "lucide-react";

export default function FieldHistory() {
  const [, setLocation] = useLocation();
  const [employee, setEmployee] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("fieldEmployee");
    if (!stored) {
      setLocation("/field");
      return;
    }
    setEmployee(JSON.parse(stored));
  }, []);

  const { data, isLoading } = useQuery<{ success: boolean; jobLogs: any[] }>({
    queryKey: ["/api/field/job-logs"],
    enabled: !!employee,
  });

  if (!employee) return null;

  const logs = data?.jobLogs || [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-lg font-bold mb-4">Job History</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No job logs yet</p>
            <p className="text-sm mt-1">Submit your first job log to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log: any) => (
              <Card key={log.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base">{log.customerName}</h3>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.jobDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{log.siteLocation}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{log.servicedArea}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Wrench className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{log.workPerformed}</span>
                    </div>
                    {log.customFields && typeof log.customFields === "object" && Object.keys(log.customFields).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                        {Object.entries(log.customFields).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="text-foreground">{typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <FieldNav canManageEmployees={employee.canManageEmployees} />
    </div>
  );
}
