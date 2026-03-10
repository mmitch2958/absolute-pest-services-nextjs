import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, User, MapPin, AlertCircle, ClipboardList, Home, Building2, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CalendarEvent =
  | { type: "contract"; id: number; customerName: string; siteLocationName?: string; frequency: string; assignedEmployeeName?: string; scheduledDate?: string; nextScheduledDate?: string }
  | { type: "job"; id: number; customerName: string; siteLocation: string; jobDate: string; status: string; priority: string; employeeName: string; propertyType?: string };

const JOB_STATUS_COLOR: Record<string, string> = {
  scheduled:   "bg-violet-500",
  in_progress: "bg-yellow-500",
  completed:   "bg-green-500",
  cancelled:   "bg-red-400",
};

const CONTRACT_DOT: Record<string, string> = {
  weekly:    "bg-blue-500",
  monthly:   "bg-sky-500",
  quarterly: "bg-orange-500",
};

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showJobs, setShowJobs] = useState(true);
  const [showContracts, setShowContracts] = useState(true);
  const [filterTime, setFilterTime] = useState<"all" | "past" | "upcoming">("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterPropertyType, setFilterPropertyType] = useState<"all" | "residential" | "commercial">("all");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const fromParam = format(startDate, "yyyy-MM-dd");
  const toParam   = format(endDate,   "yyyy-MM-dd");

  const { data: calendarData, isLoading: contractsLoading, isError: contractsError, refetch } = useQuery({
    queryKey: [`/api/admin/service-contracts/calendar?from=${fromParam}&to=${toParam}`],
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery<{ success: boolean; scheduledJobs: any[] }>({
    queryKey: ["/api/admin/scheduled-jobs", fromParam, toParam],
    queryFn: async () => {
      const res = await fetch(`/api/admin/scheduled-jobs?dateFrom=${fromParam}&dateTo=${toParam}&status=all`, { credentials: "include" });
      return res.json();
    },
  });

  const isLoading = contractsLoading || jobsLoading;

  const allContracts: CalendarEvent[] = ((calendarData as any)?.contracts ?? []).map((c: any) => ({ type: "contract" as const, ...c }));
  const allJobs: CalendarEvent[] = (jobsData?.scheduledJobs ?? [])
    .filter(j => j.status !== "cancelled")
    .map(j => ({ type: "job" as const, ...j }));

  // Build unique employee list from jobs for the filter dropdown
  const employeeNames = useMemo(() => {
    const names = new Set<string>();
    allJobs.forEach(j => {
      if (j.type === "job" && j.employeeName && j.employeeName !== "Unassigned") names.add(j.employeeName);
    });
    return Array.from(names).sort();
  }, [allJobs]);

  const today = startOfDay(new Date());

  // Apply filters
  const filteredJobs = useMemo(() => {
    if (!showJobs) return [];
    return allJobs.filter(event => {
      if (event.type !== "job") return true;
      const jobDate = startOfDay(new Date(String(event.jobDate).slice(0, 10) + "T12:00:00"));
      if (filterTime === "past" && !isBefore(jobDate, today)) return false;
      if (filterTime === "upcoming" && !isAfter(jobDate, today)) return false;
      if (filterEmployee !== "all" && event.employeeName !== filterEmployee) return false;
      if (filterPropertyType !== "all" && (event.propertyType ?? "residential") !== filterPropertyType) return false;
      return true;
    });
  }, [allJobs, showJobs, filterTime, filterEmployee, filterPropertyType, today]);

  const filteredContracts = useMemo(() => {
    if (!showContracts) return [];
    return allContracts;
  }, [allContracts, showContracts]);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayEvents = (day: Date): CalendarEvent[] => {
    const contractEvents = filteredContracts.filter((v) => {
      const dateField = (v as any).scheduledDate ?? (v as any).nextScheduledDate;
      return dateField && isSameDay(new Date(dateField), day);
    });
    const jobEvents = filteredJobs.filter((j) => {
      return j.type === "job" && isSameDay(new Date(String(j.jobDate).slice(0, 10) + "T12:00:00"), day);
    });
    return [...jobEvents, ...contractEvents];
  };

  const getEventDotColor = (event: CalendarEvent) => {
    if (event.type === "job") return JOB_STATUS_COLOR[event.status] ?? "bg-violet-500";
    return CONTRACT_DOT[(event as any).frequency] ?? "bg-gray-400";
  };

  const getEventLabel = (event: CalendarEvent) => {
    if (event.type === "job") return event.customerName;
    return (event as any).customerName || (event as any).siteLocationName || `Contract #${event.id}`;
  };

  const activeFilterCount = [
    filterTime !== "all",
    filterEmployee !== "all",
    filterPropertyType !== "all",
    !showJobs,
    !showContracts,
  ].filter(Boolean).length;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>;

  if (contractsError || !calendarData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-destructive/20 bg-destructive/5 space-y-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <div className="space-y-2">
          <h3 className="text-xl font-medium text-foreground">Failed to load calendar data</h3>
          <p className="text-muted-foreground">There was an error communicating with the server.</p>
        </div>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Service Calendar
          {activeFilterCount > 0 && (
            <Badge className="ml-2 text-xs" variant="secondary">{activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""} active</Badge>
          )}
        </h2>
        <div className="flex items-center space-x-4 pr-16 bg-white rounded-md border p-1 border-muted pl-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium w-40 text-center">{format(currentMonth, "MMMM yyyy")}</span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/40 rounded-lg border">

        {/* Show/hide toggles */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="text-xs text-muted-foreground font-medium">Show:</span>
          <Button
            size="sm"
            variant={showJobs ? "default" : "outline"}
            onClick={() => setShowJobs(v => !v)}
            className="h-7 text-xs flex items-center gap-1"
          >
            <ClipboardList className="w-3 h-3" />
            Jobs
          </Button>
          <Button
            size="sm"
            variant={showContracts ? "default" : "outline"}
            onClick={() => setShowContracts(v => !v)}
            className="h-7 text-xs flex items-center gap-1"
          >
            <CalendarDays className="w-3 h-3" />
            Contracts
          </Button>
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Time filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium"><Clock className="w-3 h-3 inline mr-0.5" />Time:</span>
          {(["all", "upcoming", "past"] as const).map(t => (
            <Button
              key={t}
              size="sm"
              variant={filterTime === t ? "secondary" : "ghost"}
              onClick={() => setFilterTime(t)}
              className="h-7 text-xs capitalize"
            >
              {t === "all" ? "All Dates" : t === "upcoming" ? "Upcoming" : "Past"}
            </Button>
          ))}
        </div>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Property type filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-medium">Property:</span>
          <Button
            size="sm"
            variant={filterPropertyType === "all" ? "secondary" : "ghost"}
            onClick={() => setFilterPropertyType("all")}
            className="h-7 text-xs"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterPropertyType === "residential" ? "secondary" : "ghost"}
            onClick={() => setFilterPropertyType("residential")}
            className="h-7 text-xs flex items-center gap-1"
          >
            <Home className="w-3 h-3" />
            Residential
          </Button>
          <Button
            size="sm"
            variant={filterPropertyType === "commercial" ? "secondary" : "ghost"}
            onClick={() => setFilterPropertyType("commercial")}
            className="h-7 text-xs flex items-center gap-1"
          >
            <Building2 className="w-3 h-3" />
            Commercial
          </Button>
        </div>

        {/* Employee filter */}
        {employeeNames.length > 0 && (
          <>
            <div className="h-5 w-px bg-border mx-1" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground font-medium"><User className="w-3 h-3 inline mr-0.5" />Tech:</span>
              <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                <SelectTrigger className="h-7 text-xs w-36">
                  <SelectValue placeholder="All technicians" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {employeeNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Reset filters */}
        {activeFilterCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowJobs(true);
              setShowContracts(true);
              setFilterTime("all");
              setFilterEmployee("all");
              setFilterPropertyType("all");
            }}
            className="h-7 text-xs text-muted-foreground ml-auto"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground">{day}</div>
        ))}

        {days.map((day, idx) => {
          const dayEvents = getDayEvents(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());

          return (
            <Popover key={idx}>
              <PopoverTrigger asChild>
                <div className={`min-h-[120px] bg-white p-2 border-t cursor-pointer hover:bg-muted/50 transition-colors ${!isCurrentMonth ? "text-muted-foreground bg-gray-50/50" : ""}`}>
                  <div className={`font-medium text-sm flex justify-between items-center mb-1 ${isToday ? "text-primary font-bold" : ""}`}>
                    {format(day, "d")}
                    {isToday && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, vIdx) => (
                      <div key={vIdx} className={`text-xs truncate rounded px-1.5 py-0.5 flex items-center gap-1.5 ${event.type === "job" ? "bg-violet-50 border border-violet-200" : "bg-secondary/30"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getEventDotColor(event)}`} />
                        {getEventLabel(event)}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium px-1">+ {dayEvents.length - 3} more</div>
                    )}
                  </div>
                </div>
              </PopoverTrigger>

              {dayEvents.length > 0 && (
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm border-b pb-2 flex justify-between">
                      {format(day, "EEEE, MMMM d, yyyy")}
                      <Badge variant="secondary">{dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}</Badge>
                    </h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {dayEvents.map((event, vIdx) => (
                        <div key={vIdx} className="space-y-1.5 text-sm p-2 rounded border bg-card">
                          {event.type === "job" ? (
                            <>
                              <div className="font-medium flex items-center gap-2">
                                <ClipboardList className="w-3 h-3 text-violet-600 flex-shrink-0" />
                                {event.customerName}
                                <Badge variant="outline" className="ml-auto text-xs capitalize">{event.status.replace("_", " ")}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {event.siteLocation}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                {event.employeeName || "Unassigned"}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                {(event.propertyType ?? "residential") === "commercial"
                                  ? <><Building2 className="h-3 w-3 text-orange-500" /><span className="text-orange-600 font-medium">Commercial</span></>
                                  : <><Home className="h-3 w-3 text-blue-500" /><span className="text-blue-600 font-medium">Residential</span></>
                                }
                              </div>
                              {event.priority && event.priority !== "medium" && (
                                <div className="text-xs font-medium capitalize" style={{ color: event.priority === "urgent" ? "#dc2626" : event.priority === "high" ? "#ea580c" : "#6b7280" }}>
                                  Priority: {event.priority}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getEventDotColor(event)}`} />
                                {getEventLabel(event)}
                                <Badge variant="outline" className="ml-auto text-xs capitalize">{(event as any).frequency}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="h-3 w-3" />
                                {(event as any).siteLocationName || (event as any).siteLocation || (event as any).servicedArea || "Main Location"}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <User className="h-3 w-3" />
                                {(event as any).assignedEmployeeName || ((event as any).assignedEmployeeId ? `Employee #${(event as any).assignedEmployeeId}` : "Unassigned")}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 pt-4 text-sm text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" /> Scheduled Job</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> In Progress</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Completed</div>
        <div className="flex items-center gap-1.5 border-l pl-4"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Weekly Contract</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Monthly Contract</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Quarterly Contract</div>
      </div>
    </div>
  );
}
