import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import RequestService from "@/pages/request-service";
import LogoShowcase from "@/pages/logo-showcase";
import WildlifeControl from "@/pages/wildlife-control";
import BedBugTreatment from "@/pages/bed-bug-treatment";
import TermiteTreatment from "@/pages/termite-treatment";
import BatRemoval from "@/pages/bat-removal";
import ServiceAreas from "@/pages/service-areas";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import CostCalculator from "@/pages/CostCalculator";
import NotFound from "@/pages/not-found";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminClients } from "@/pages/admin/AdminClients";
import { AdminService } from "@/pages/admin/AdminService";
import { AdminMilestones } from "@/pages/admin/AdminMilestones";
import { AdminDashboards } from "@/pages/admin/AdminDashboards";
import { AdminBlog } from "@/pages/admin/AdminBlog";
import { AdminReports } from "@/pages/admin/admin-reports";
import { AdminLogin } from "@/pages/admin/admin-login";
import { AdminFieldData } from "@/pages/admin/admin-field-data";
import { AdminServiceTypes } from "@/pages/admin/admin-service-types";
import { AdminContracts } from "@/pages/admin/AdminContracts";
import { AdminCalendar } from "@/pages/admin/AdminCalendar";
import AdminScheduling from "@/pages/admin/admin-scheduling";
import AdminInvoices from "@/pages/admin/AdminInvoices";
import AdminInvoiceNew from "@/pages/admin/AdminInvoiceNew";
import AdminInvoiceDetail from "@/pages/admin/AdminInvoiceDetail";
import AdminSettings from "@/pages/admin/admin-settings";
import FieldLogin from "@/pages/field-login";
import FieldLog from "@/pages/field-log";
import FieldInvoice from "@/pages/field-invoice";
import FieldMyJobs from "@/pages/field/field-my-jobs";
import FieldHistory from "@/pages/field-history";
import FieldEmployees from "@/pages/field-employees";
import FieldReports from "@/pages/field-reports";
import PitchDeck from "@/pages/pitch-deck";
import PortalLayout from "@/pages/portal/PortalLayout";
import PortalDashboard from "@/pages/portal/PortalDashboard";
import PortalAppointments from "@/pages/portal/PortalAppointments";
import PortalNewAppointment from "@/pages/portal/PortalNewAppointment";
import PortalAppointmentDetail from "@/pages/portal/PortalAppointmentDetail";
import PortalServiceRequests from "@/pages/portal/PortalServiceRequests";
import PortalNewServiceRequest from "@/pages/portal/PortalNewServiceRequest";
import PortalInvoices from "@/pages/portal/PortalInvoices";
import PortalInvoiceDetail from "@/pages/portal/PortalInvoiceDetail";
import PortalProfile from "@/pages/portal/PortalProfile";
import InvoiceView from "@/pages/InvoiceView";

function Router() {
  // Track page views when routes change - Google Analytics integration
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/invoice/:token" component={InvoiceView} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/request-service" component={RequestService} />
      <Route path="/logos" component={LogoShowcase} />
      <Route path="/wildlife-control" component={WildlifeControl} />
      <Route path="/bed-bug-treatment" component={BedBugTreatment} />
      <Route path="/termite-treatment" component={TermiteTreatment} />
      <Route path="/bat-removal" component={BatRemoval} />
      <Route path="/service-areas" component={ServiceAreas} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/cost-calculator" component={CostCalculator} />
      
      {/* Pitch Deck */}
      <Route path="/jlpd" component={PitchDeck} />
      
      {/* Field Service Routes */}
      <Route path="/field" component={FieldLogin} />
      <Route path="/field/log" component={FieldLog} />
      <Route path="/field/my-jobs" component={FieldMyJobs} />
      <Route path="/field/history" component={FieldHistory} />
      <Route path="/field/invoice" component={FieldInvoice} />
      <Route path="/field/employees" component={FieldEmployees} />
      <Route path="/field/reports" component={FieldReports} />
      
      {/* Admin Portal Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/clients">
        <AdminLayout>
          <AdminClients />
        </AdminLayout>
      </Route>
      <Route path="/admin/service">
        <AdminLayout>
          <AdminService />
        </AdminLayout>
      </Route>
      <Route path="/admin/milestones">
        <AdminLayout>
          <AdminMilestones />
        </AdminLayout>
      </Route>
      <Route path="/admin/dashboards">
        <AdminLayout>
          <AdminDashboards />
        </AdminLayout>
      </Route>
      <Route path="/admin/blog">
        <AdminLayout>
          <AdminBlog />
        </AdminLayout>
      </Route>
      <Route path="/admin/reports">
        <AdminLayout>
          <AdminReports />
        </AdminLayout>
      </Route>
      <Route path="/admin/service-types">
        <AdminLayout>
          <AdminServiceTypes />
        </AdminLayout>
      </Route>
      <Route path="/admin/field-data">
        <AdminLayout>
          <AdminFieldData />
        </AdminLayout>
      </Route>
      <Route path="/admin/contracts">
        <AdminLayout>
          <AdminContracts />
        </AdminLayout>
      </Route>
      <Route path="/admin/calendar">
        <AdminLayout>
          <AdminCalendar />
        </AdminLayout>
      </Route>
      <Route path="/admin/scheduling">
        <AdminLayout>
          <AdminScheduling />
        </AdminLayout>
      </Route>
      <Route path="/admin/invoices/new">
        <AdminLayout>
          <AdminInvoiceNew />
        </AdminLayout>
      </Route>
      <Route path="/admin/invoices/:id">
        <AdminLayout>
          <AdminInvoiceDetail />
        </AdminLayout>
      </Route>
      <Route path="/admin/invoices">
        <AdminLayout>
          <AdminInvoices />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      </Route>
      
      {/* Customer Portal Routes */}
      <Route path="/portal" component={PortalLayout} />
      <Route path="/portal/" component={PortalDashboard} />
      <Route path="/portal/appointments" component={PortalAppointments} />
      <Route path="/portal/appointments/new" component={PortalNewAppointment} />
      <Route path="/portal/appointments/:id" component={PortalAppointmentDetail} />
      <Route path="/portal/service-requests" component={PortalServiceRequests} />
      <Route path="/portal/service-requests/new" component={PortalNewServiceRequest} />
      <Route path="/portal/invoices" component={PortalInvoices} />
      <Route path="/portal/invoices/:id" component={PortalInvoiceDetail} />
      <Route path="/portal/profile" component={PortalProfile} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
