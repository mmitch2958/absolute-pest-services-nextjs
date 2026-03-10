import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Clock, User, ClipboardList, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Mock Data
const MOCK_TECHNICIANS = [
  { id: "tech-1", name: "John Doe" },
  { id: "tech-2", name: "Jane Smith" },
];

const MOCK_CLIENTS = [
  { id: "client-1", name: "Acme Corp" },
  { id: "client-2", name: "Stark Industries" },
];

const MOCK_JOBS = [
  {
    id: "job-1",
    clientName: "Acme Corp",
    technicianId: "tech-1",
    technicianName: "John Doe",
    date: new Date(),
    address: "123 Main St, Springfield",
    work: "Quarterly Pest Control",
    priority: "High",
    status: "Scheduled",
  },
  {
    id: "job-2",
    clientName: "Stark Industries",
    technicianId: "unassigned",
    technicianName: "Unassigned",
    date: new Date(new Date().setHours(14, 0, 0, 0)),
    address: "200 Park Ave, New York",
    work: "Termite Inspection",
    priority: "Normal",
    status: "Pending Assignment",
  },
];

export default function AdminScheduling() {
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  return (
    <div className="flex h-screen w-full bg-background pt-16">
      <main className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Job Scheduling</h1>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="create">Create Job</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className={`cursor-pointer transition-colors hover:bg-accent/50 ${job.technicianId === 'unassigned' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                  onClick={() => setSelectedJob(job)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{job.clientName}</CardTitle>
                      <Badge variant={job.technicianId === 'unassigned' ? 'outline' : 'default'} className={job.technicianId === 'unassigned' ? 'text-amber-600 border-amber-500' : ''}>
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(job.date, "PPP")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {format(job.date, "p")}
                    </div>
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span className={job.technicianId === 'unassigned' ? 'font-medium text-amber-600 dark:text-amber-500' : ''}>
                        {job.technicianName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="truncate">{job.address}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Job Details Drawer/Panel would go here in full implementation */}
            {selectedJob && (
              <Card className="mt-6 border-primary/50">
                 <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>Job Details: {selectedJob.clientName}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>Close</Button>
                    </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Work</Label>
                        <p className="font-medium">{selectedJob.work}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Priority</Label>
                        <p className="font-medium">{selectedJob.priority}</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground mt-2 inline-block">Reassign Technician</Label>
                        <div className="flex gap-2">
                          <Select defaultValue={selectedJob.technicianId}>
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Select Technician" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {MOCK_TECHNICIANS.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button>Update</Button>
                        </div>
                      </div>
                    </div>
                 </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOCK_CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="technician">Technician</Label>
                    <Select defaultValue="unassigned">
                      <SelectTrigger id="technician">
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {MOCK_TECHNICIANS.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Service Address</Label>
                    <Input id="address" placeholder="123 Main St..." />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="work">Work to Perform</Label>
                    <Input id="work" placeholder="Quarterly maintenance..." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">Internal Notes</Label>
                    <Textarea id="notes" placeholder="Gate code: 1234..." />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button type="button">Schedule Job</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
