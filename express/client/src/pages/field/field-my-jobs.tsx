import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Clock, ArrowRight, User, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock Data
const MOCK_MY_JOBS = [
  {
    id: "job-1",
    clientName: "Acme Corp",
    date: new Date(new Date().setHours(9, 0, 0, 0)),
    address: "123 Main St, Springfield",
    work: "Quarterly Pest Control",
    priority: "High",
    status: "Scheduled",
  },
  {
    id: "job-3",
    clientName: "Bob Builder",
    date: new Date(new Date().setHours(13, 30, 0, 0)),
    address: "456 Oak Ln, Springfield",
    work: "Wasp Nest Removal",
    priority: "Normal",
    status: "En Route",
  },
];

const MOCK_AVAILABLE_JOBS = [
  {
    id: "job-2",
    clientName: "Stark Industries",
    date: new Date(new Date().setHours(14, 0, 0, 0)),
    address: "200 Park Ave, New York",
    work: "Termite Inspection",
    priority: "Normal",
    distance: "2.4 mi",
  },
  {
    id: "job-4",
    clientName: "Wayne Enterprises",
    date: new Date(new Date().setHours(16, 0, 0, 0)),
    address: "1007 Mountain Dr, Gotham",
    work: "Rodent Control",
    priority: "Urgent",
    distance: "5.1 mi",
  },
];

export default function FieldMyJobs() {
  const [myJobs, setMyJobs] = useState(MOCK_MY_JOBS);
  const [availableJobs, setAvailableJobs] = useState(MOCK_AVAILABLE_JOBS);

  const handleClaim = (jobId: string) => {
    const jobToClaim = availableJobs.find(j => j.id === jobId);
    if (!jobToClaim) return;

    setAvailableJobs(availableJobs.filter(j => j.id !== jobId));
    setMyJobs([...myJobs, { ...jobToClaim, status: 'Scheduled' }].sort((a, b) => a.date.getTime() - b.date.getTime()));
  };

  const handleStatusChange = (jobId: string, currentStatus: string) => {
    const updatedJobs = myJobs.map(job => {
      if (job.id === jobId) {
        let newStatus = currentStatus;
        if (currentStatus === 'Scheduled') newStatus = 'En Route';
        else if (currentStatus === 'En Route') newStatus = 'In Progress';
        else if (currentStatus === 'In Progress') newStatus = 'Completed';
        
        return { ...job, status: newStatus };
      }
      return job;
    });
    setMyJobs(updatedJobs);
  };

  const activeJob = myJobs.find(j => j.status === 'En Route' || j.status === 'In Progress');

  return (
    <div className="flex h-screen w-full flex-col bg-background pt-16 pb-20">
      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Today's Jobs</h1>

        {activeJob && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Active Job</h2>
            <Card className="border-primary bg-primary/5 dark:bg-primary/10">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{activeJob.clientName}</CardTitle>
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    {activeJob.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="font-semibold text-foreground">{format(activeJob.date, "h:mm a")}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4 shrink-0" />
                  <span>{activeJob.address}</span>
                </div>
                <div className="mt-2 p-3 bg-background rounded-md border text-sm">
                  <span className="font-medium">Task: </span>{activeJob.work}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleStatusChange(activeJob.id, activeJob.status)}
                >
                  {activeJob.status === 'En Route' ? 'Arrived (Start Job)' : 'Complete Job'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        <Tabs defaultValue="assigned" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="assigned">My Schedule ({myJobs.filter(j => j.status !== 'Completed').length})</TabsTrigger>
            <TabsTrigger value="available">Available ({availableJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            {myJobs.filter(j => j.id !== activeJob?.id && j.status !== 'Completed').length === 0 && !activeJob ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-1">Check available jobs to pick up more work.</p>
              </div>
            ) : null}

            {myJobs.filter(j => j.id !== activeJob?.id && j.status !== 'Completed').map((job) => (
              <Card key={job.id} className="overflow-hidden">
                <CardHeader className="pb-2 bg-muted/40">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="text-sm font-medium text-primary mb-1">{format(job.date, "h:mm a")}</div>
                      <CardTitle className="text-lg">{job.clientName}</CardTitle>
                    </div>
                    {job.priority === 'High' && <Badge variant="destructive">High Priority</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start">
                    <MapPin className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span>{job.address}</span>
                  </div>
                  <div className="flex items-start">
                    <AlertCircle className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                    <span className="text-foreground">{job.work}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleStatusChange(job.id, job.status)}
                    disabled={!!activeJob}
                  >
                    Set En Route
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {myJobs.filter(j => j.status === 'Completed').length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Completed Today</h3>
                <div className="space-y-3">
                  {myJobs.filter(j => j.status === 'Completed').map(job => (
                    <Card key={job.id} className="opacity-60 bg-muted/20">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium line-through">{job.clientName}</p>
                          <p className="text-xs text-muted-foreground">{format(job.date, "h:mm a")}</p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {availableJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No jobs available</h3>
                <p className="text-sm text-muted-foreground mt-1">There are currently no unassigned jobs.</p>
              </div>
            ) : null}

            {availableJobs.map((job) => (
              <Card key={job.id} className="border-amber-500/50 bg-amber-50/10 dark:bg-amber-950/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="text-sm font-medium mb-1">{format(job.date, "h:mm a")}</div>
                      <CardTitle className="text-lg">{job.clientName}</CardTitle>
                    </div>
                    {job.priority === 'Urgent' ? (
                      <Badge variant="destructive">Urgent</Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">Unassigned</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 shrink-0" />
                      <span>{job.address}</span>
                    </div>
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded">{job.distance} away</span>
                  </div>
                  <div className="bg-background/50 p-2 rounded border mt-2">
                    <span className="font-medium text-foreground">Task:</span> {job.work}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleClaim(job.id)}
                  >
                    Claim Job
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
