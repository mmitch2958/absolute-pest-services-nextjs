import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Loader2, RefreshCw, Calendar, TrendingUp, Users, FileText, Clock, AlertCircle } from "lucide-react";

// Types for analytics data
interface AnalyticsOverview {
  jobsThisMonth: number;
  jobsThisWeek: number;
  activeClients: number;
  activeContracts: number;
  openServiceRequests: number;
  overdueInvoices: number;
  outstandingRevenue: number;
}

interface JobsOverTimeData {
  month: string;
  count: number;
}

interface JobsByAreaData {
  area: string;
  count: number;
}

interface JobsByStatusData {
  status: string;
  count: number;
}

interface EmployeeProductivityData {
  employeeId: number;
  name: string;
  jobsThisPeriod: number;
  jobsAllTime: number;
  lastJobDate: string | null;
  isActive: boolean;
}

interface ContractsSummaryData {
  totalActive: number;
  dueThisWeek: number;
  overdue: number;
  byFrequency: { frequency: string; count: number }[];
}

interface UpcomingItem {
  type: 'job' | 'inspection' | 'request';
  id: number;
  date: string;
  customerName: string;
  serviceType: string;
  assignedEmployee?: string;
}

interface UpcomingItemsData {
  scheduledJobs: UpcomingItem[];
  pendingInspections: UpcomingItem[];
  pendingRequests: UpcomingItem[];
}

interface TopClientData {
  clientId: number;
  clientName: string;
  totalJobs: number;
  lastJobDate: string | null;
  hasActiveContract: boolean;
}

interface ContactSubmissionSummary {
  count: number;
  recent: { id: number; firstName: string; lastName: string; serviceType: string; city: string; createdAt: string }[];
}

// Date range presets
const DATE_PRESETS = [
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Last 3 Months", value: "last3Months" },
  { label: "Last 12 Months", value: "last12Months" },
  { label: "Year to Date", value: "ytd" },
];

function getDateRangeFromPreset(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from: string;

  switch (preset) {
    case "thisMonth":
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      break;
    case "lastMonth":
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from, to: lastMonthEnd.toISOString().split('T')[0] };
    case "last3Months":
      from = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0];
      break;
    case "last12Months":
      from = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0];
      break;
    case "ytd":
      from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    default:
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString().split('T')[0];
  }

  return { from, to };
}

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4A4A4'];

export function AdminAnalytics() {
  const [datePreset, setDatePreset] = useState("thisMonth");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [jobsOverTime, setJobsOverTime] = useState<JobsOverTimeData[]>([]);
  const [jobsByArea, setJobsByArea] = useState<JobsByAreaData[]>([]);
  const [jobsByStatus, setJobsByStatus] = useState<JobsByStatusData[]>([]);
  const [employeeProductivity, setEmployeeProductivity] = useState<EmployeeProductivityData[]>([]);
  const [contractsSummary, setContractsSummary] = useState<ContractsSummaryData | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingItemsData | null>(null);
  const [topClients, setTopClients] = useState<TopClientData[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmissionSummary | null>(null);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { from, to } = getDateRangeFromPreset(datePreset);
      const params = `?from=${from}&to=${to}`;

      const [
        overviewRes,
        jobsOverTimeRes,
        jobsByAreaRes,
        jobsByStatusRes,
        employeeRes,
        contractsRes,
        upcomingRes,
        topClientsRes,
        contactsRes,
      ] = await Promise.all([
        fetch(`/api/admin/analytics/overview${params}`),
        fetch(`/api/admin/analytics/jobs-over-time${params}&groupBy=month`),
        fetch(`/api/admin/analytics/jobs-by-area${params}`),
        fetch(`/api/admin/analytics/jobs-by-status${params}`),
        fetch(`/api/admin/analytics/employee-productivity${params}`),
        fetch(`/api/admin/analytics/contracts-summary`),
        fetch(`/api/admin/analytics/upcoming`),
        fetch(`/api/admin/analytics/top-clients${params}&limit=10`),
        fetch(`/api/admin/analytics/contact-submissions${params}`),
      ]);

      const overviewData = await overviewRes.json();
      const jobsOverTimeData = await jobsOverTimeRes.json();
      const jobsByAreaData = await jobsByAreaRes.json();
      const jobsByStatusData = await jobsByStatusRes.json();
      const employeeData = await employeeRes.json();
      const contractsData = await contractsRes.json();
      const upcomingData = await upcomingRes.json();
      const topClientsData = await topClientsRes.json();
      const contactsData = await contactsRes.json();

      if (overviewData.success) setOverview(overviewData.overview);
      if (jobsOverTimeData.success) setJobsOverTime(jobsOverTimeData.data);
      if (jobsByAreaData.success) setJobsByArea(jobsByAreaData.data);
      if (jobsByStatusData.success) setJobsByStatus(jobsByStatusData.data);
      if (employeeData.success) setEmployeeProductivity(employeeData.data);
      if (contractsData.success) setContractsSummary(contractsData.data);
      if (upcomingData.success) setUpcoming(upcomingData.data);
      if (topClientsData.success) setTopClients(topClientsData.data);
      if (contactsData.success) setContactSubmissions(contactsData.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [datePreset]);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Filter and Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Analytics</h1>
          <p className="text-muted-foreground">Overview of your pest control business</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            {DATE_PRESETS.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> This Month
            </CardDescription>
            <CardTitle className="text-2xl">{overview?.jobsThisMonth ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Jobs This Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> This Week
            </CardDescription>
            <CardTitle className="text-2xl">{overview?.jobsThisWeek ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Jobs This Week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-3 w-3" /> Active
            </CardDescription>
            <CardTitle className="text-2xl">{overview?.activeClients ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <FileText className="h-3 w-3" /> Active
            </CardDescription>
            <CardTitle className="text-2xl">{overview?.activeContracts ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Active Contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Open
            </CardDescription>
            <CardTitle className="text-2xl">{overview?.openServiceRequests ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Open Requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Overdue
            </CardDescription>
            <CardTitle className="text-2xl">{overview?.overdueInvoices ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Overdue Invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Outstanding
            </CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(overview?.outstandingRevenue ?? 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Outstanding Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1: Jobs Over Time & Jobs by Area */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Jobs Over Time</CardTitle>
            <CardDescription>Monthly job volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ChartContainer
                config={{
                  count: { label: "Jobs", color: "hsl(var(--chart-1))" }
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={jobsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jobs by Serviced Area</CardTitle>
            <CardDescription>Top areas by job count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {jobsByArea.length > 0 ? (
                <ChartContainer
                  config={jobsByArea.reduce((acc, item, idx) => ({
                    ...acc,
                    [item.area]: { label: item.area, color: COLORS[idx % COLORS.length] }
                  }), {})}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobsByArea}
                        dataKey="count"
                        nameKey="area"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        label={({ area, percent }) => `${area}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {jobsByArea.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Status</CardTitle>
          <CardDescription>Current status distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ChartContainer
              config={jobsByStatus.reduce((acc, item) => ({
                ...acc,
                [item.status]: { label: item.status, color: "hsl(var(--chart-2))" }
              }), {})}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobsByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 2: Employee Productivity & Contract Health */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Productivity</CardTitle>
            <CardDescription>Jobs per employee in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Employee</th>
                    <th className="text-right py-2">This Period</th>
                    <th className="text-right py-2">All Time</th>
                    <th className="text-right py-2">Last Job</th>
                    <th className="text-center py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeProductivity.map((emp) => (
                    <tr key={emp.employeeId} className="border-b hover:bg-muted/50">
                      <td className="py-2">{emp.name}</td>
                      <td className="text-right py-2">{emp.jobsThisPeriod}</td>
                      <td className="text-right py-2">{emp.jobsAllTime}</td>
                      <td className="text-right py-2">{formatDate(emp.lastJobDate)}</td>
                      <td className="text-center py-2">
                        <span className={`px-2 py-1 rounded text-xs ${emp.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Health</CardTitle>
            <CardDescription>Recurring service contract status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{contractsSummary?.totalActive ?? 0}</div>
                <div className="text-xs text-muted-foreground">Active Contracts</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-700">{contractsSummary?.dueThisWeek ?? 0}</div>
                <div className="text-xs text-yellow-700">Due This Week</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{contractsSummary?.overdue ?? 0}</div>
                <div className="text-xs text-red-700">Overdue</div>
              </div>
            </div>
            <div className="h-[150px]">
              {contractsSummary?.byFrequency && contractsSummary.byFrequency.length > 0 ? (
                <ChartContainer
                  config={contractsSummary.byFrequency.reduce((acc, item, idx) => ({
                    ...acc,
                    [item.frequency]: { label: item.frequency, color: COLORS[idx % COLORS.length] }
                  }), {})}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contractsSummary.byFrequency}
                        dataKey="count"
                        nameKey="frequency"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                      >
                        {contractsSummary.byFrequency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No contracts
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3: Upcoming & Top Clients & Contact Submissions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming This Week</CardTitle>
            <CardDescription>Scheduled items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {upcoming && upcoming.scheduledJobs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Scheduled Jobs</h4>
                  {upcoming.scheduledJobs.slice(0, 5).map((item) => (
                    <div key={`job-${item.id}`} className="text-sm py-2 border-b">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.customerName}</span>
                        <span className="text-muted-foreground text-xs">{formatDate(item.date)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.serviceType}</div>
                    </div>
                  ))}
                </div>
              )}
              {upcoming && upcoming.pendingInspections.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Pending Inspections</h4>
                  {upcoming.pendingInspections.slice(0, 5).map((item) => (
                    <div key={`insp-${item.id}`} className="text-sm py-2 border-b">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.customerName}</span>
                        <span className="text-muted-foreground text-xs">{formatDate(item.date)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.serviceType}</div>
                    </div>
                  ))}
                </div>
              )}
              {upcoming && upcoming.pendingRequests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Pending Requests</h4>
                  {upcoming.pendingRequests.slice(0, 5).map((item) => (
                    <div key={`req-${item.id}`} className="text-sm py-2 border-b">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.customerName}</span>
                        <span className="text-muted-foreground text-xs">{formatDate(item.date)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{item.serviceType}</div>
                    </div>
                  ))}
                </div>
              )}
              {(!upcoming || (upcoming.scheduledJobs.length === 0 && upcoming.pendingInspections.length === 0 && upcoming.pendingRequests.length === 0)) && (
                <div className="text-center text-muted-foreground py-4">No upcoming items</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Clients</CardTitle>
            <CardDescription>Most active clients by job count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {topClients.map((client) => (
                <div key={client.clientId} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium text-sm">{client.clientName}</div>
                    <div className="text-xs text-muted-foreground">
                      Last job: {formatDate(client.lastJobDate)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{client.totalJobs}</div>
                    <div className="text-xs text-muted-foreground">jobs</div>
                  </div>
                </div>
              ))}
              {topClients.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No client data</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Submissions</CardTitle>
            <CardDescription>New leads in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4 bg-muted rounded-lg mb-4">
              <div className="text-3xl font-bold">{contactSubmissions?.count ?? 0}</div>
              <div className="text-xs text-muted-foreground">Total Submissions</div>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {contactSubmissions?.recent.map((sub) => (
                <div key={sub.id} className="text-sm py-2 border-b">
                  <div className="font-medium">{sub.firstName} {sub.lastName}</div>
                  <div className="text-xs text-muted-foreground">
                    {sub.serviceType} • {sub.city}
                  </div>
                </div>
              ))}
              {(!contactSubmissions || contactSubmissions.recent.length === 0) && (
                <div className="text-center text-muted-foreground py-2">No recent submissions</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
