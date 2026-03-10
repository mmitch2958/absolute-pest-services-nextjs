import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Globe, Loader2, Check } from "lucide-react";

const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [selectedTz, setSelectedTz] = useState("America/New_York");

  const { data, isLoading } = useQuery<{ timezone: string }>({
    queryKey: ["/api/admin/settings/timezone"],
  });

  useEffect(() => {
    if (data?.timezone) {
      setSelectedTz(data.timezone);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (timezone: string) => {
      await apiRequest("PATCH", "/api/admin/settings/timezone", { timezone });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/timezone"] });
      toast({ title: "Timezone Updated", description: "Your timezone setting has been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save timezone.", variant: "destructive" });
    },
  });

  const currentLabel = US_TIMEZONES.find(tz => tz.value === selectedTz)?.label || selectedTz;
  const now = new Date();
  let currentTimeStr = "";
  try {
    currentTimeStr = now.toLocaleString("en-US", { timeZone: selectedTz, hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    currentTimeStr = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system-wide preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone
          </CardTitle>
          <CardDescription>
            Set the timezone for all dates and times throughout the system. This affects job logs, invoices, reminders, and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading settings...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-w-sm">
                <Select value={selectedTz} onValueChange={setSelectedTz}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {currentTimeStr && (
                <p className="text-sm text-muted-foreground">
                  Current time in {currentLabel}: <span className="font-medium">{currentTimeStr}</span>
                </p>
              )}
              <Button
                onClick={() => saveMutation.mutate(selectedTz)}
                disabled={saveMutation.isPending || selectedTz === data?.timezone}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Save Timezone
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
