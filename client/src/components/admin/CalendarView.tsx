import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const { data: visits, isLoading } = useQuery({
    queryKey: ["/api/admin/service-contracts/calendar", {
      from: format(startDate, 'yyyy-MM-dd'),
      to: format(endDate, 'yyyy-MM-dd'),
    }],
  });

  const getDayVisits = (day: Date) => {
    if (!visits) return [];
    return visits.filter((v: any) => isSameDay(new Date(v.scheduledDate), day));
  };

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getDotColor = (frequency: string) => {
    switch(frequency) {
      case "weekly": return "bg-blue-500";
      case "monthly": return "bg-green-500";
      case "quarterly": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading calendar...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-2xl font-bold tracking-tight">Service Calendar</h2>
        <div className="flex items-center space-x-4 pr-16 bg-white rounded-md border p-1 border-muted pl-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-medium w-40 text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg border bg-muted overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-muted p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayVisits = getDayVisits(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <Popover key={idx}>
              <PopoverTrigger asChild>
                <div
                  className={`min-h-[120px] bg-white p-2 border-t cursor-pointer hover:bg-muted/50 transition-colors ${
                    !isCurrentMonth ? "text-muted-foreground bg-gray-50/50" : ""
                  }`}
                >
                  <div className={`font-medium text-sm flex justify-between items-center mb-1 ${
                    isSameDay(day, new Date()) ? "text-primary font-bold" : ""
                  }`}>
                    {format(day, "d")}
                    {isSameDay(day, new Date()) && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </div>
                  
                  <div className="space-y-1">
                    {dayVisits.slice(0, 3).map((visit: any, vIdx) => (
                      <div key={vIdx} className="text-xs truncate bg-secondary/30 rounded px-1.5 py-0.5 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getDotColor(visit.frequency)}`} />
                        {visit.customerName || `Visit #${visit.id}`}
                      </div>
                    ))}
                    {dayVisits.length > 3 && (
                      <div className="text-xs text-muted-foreground font-medium px-1">+ {dayVisits.length - 3} more</div>
                    )}
                  </div>
                </div>
              </PopoverTrigger>
              {dayVisits.length > 0 && (
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm border-b pb-2 flex justify-between">
                      {format(day, "EEEE, MMMM d, yyyy")}
                      <Badge variant="secondary">{dayVisits.length} visits</Badge>
                    </h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {dayVisits.map((visit: any, vIdx) => (
                        <div key={vIdx} className="space-y-1.5 text-sm p-2 rounded border bg-card">
                          <div className="font-medium flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${getDotColor(visit.frequency)}`} />
                            {visit.customerName || "Customer"} 
                            <Badge variant="outline" className="ml-auto text-xs capitalize">{visit.frequency}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="h-3 w-3" />
                            {visit.siteLocationName || visit.servicedAreaName || "Main Location"}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <User className="h-3 w-3" />
                            {visit.assignedEmployeeName || "Unassigned"}
                          </div>
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
      
      <div className="flex gap-4 pt-4 text-sm text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Weekly</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Monthly</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Quarterly</div>
      </div>
    </div>
  );
}
