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
import NotFound from "@/pages/not-found";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminClients } from "@/pages/admin/AdminClients";
import { AdminService } from "@/pages/admin/AdminService";
import { AdminMilestones } from "@/pages/admin/AdminMilestones";
import { AdminDashboards } from "@/pages/admin/AdminDashboards";

function Router() {
  // Track page views when routes change - Google Analytics integration
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/request-service" component={RequestService} />
      <Route path="/logos" component={LogoShowcase} />
      <Route path="/wildlife-control" component={WildlifeControl} />
      <Route path="/bed-bug-treatment" component={BedBugTreatment} />
      <Route path="/termite-treatment" component={TermiteTreatment} />
      <Route path="/bat-removal" component={BatRemoval} />
      <Route path="/service-areas" component={ServiceAreas} />
      
      {/* Admin Portal Routes */}
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
