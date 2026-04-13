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
import CarpenterBeesInfoPage from "@/pages/carpenter-bees";
import CarpenterBeeTreatmentPage from "@/pages/carpenter-bee-treatment";
import Termites from "@/pages/termites";
import BedBugs from "@/pages/bed-bugs";
import Rodents from "@/pages/rodents";
import Wildlife from "@/pages/wildlife";
import ServiceAreas from "@/pages/service-areas";
import ChesterCountyPA from "@/pages/service-areas/chester-county-pa";
import DelawareCountyPA from "@/pages/service-areas/delaware-county-pa";
import NewCastleCountyDE from "@/pages/service-areas/new-castle-county-de";
import MontgomeryCountyPA from "@/pages/service-areas/montgomery-county-pa";
import NortheastMaryland from "@/pages/service-areas/northeast-maryland";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import CarpenterBeeSeasonBlogPost from "@/pages/blog/carpenter-bee-season-pade";
import CarpenterBeeControlPage from "@/pages/carpenter-bee-control";
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
import { AdminMarketing } from "@/pages/admin/AdminMarketing";
import FieldLogin from "@/pages/field-login";
import FieldLog from "@/pages/field-log";
import FieldInvoice from "@/pages/field-invoice";
import FieldMyJobs from "@/pages/field/field-my-jobs";
import FieldHistory from "@/pages/field-history";
import FieldEmployees from "@/pages/field-employees";
import FieldReports from "@/pages/field-reports";
import PitchDeck from "@/pages/pitch-deck";
// City-level service area pages (new)
import CoatesvillePA from "@/pages/service-areas/coatesville-pa";
import CochranvillePA from "@/pages/service-areas/cochranville-pa";
import KennettSquarePA from "@/pages/service-areas/kennett-square-pa";
import AvondalePA from "@/pages/service-areas/avondale-pa";
import WestGrovePA from "@/pages/service-areas/west-grove-pa";
import OxfordPA from "@/pages/service-areas/oxford-pa";
import LincolnUniversityPA from "@/pages/service-areas/lincoln-university-pa";
import LandenbergPA from "@/pages/service-areas/landenberg-pa";
import ChaddsFordPA from "@/pages/service-areas/chadds-ford-pa";
import GlenMillsPA from "@/pages/service-areas/glen-mills-pa";
// City×Service pages — 60 programmatic SEO landing pages
import GeneralPestControlDowningtownPa from "@/pages/city-services/pest-control-downingtown-pa";
import TermiteControlDowningtownPa from "@/pages/city-services/termite-control-downingtown-pa";
import WildlifeRodentControlDowningtownPa from "@/pages/city-services/wildlife-control-downingtown-pa";
import AntWaspControlDowningtownPa from "@/pages/city-services/ant-wasp-control-downingtown-pa";
import GeneralPestControlExtonPa from "@/pages/city-services/pest-control-exton-pa";
import TermiteControlExtonPa from "@/pages/city-services/termite-control-exton-pa";
import WildlifeRodentControlExtonPa from "@/pages/city-services/wildlife-control-exton-pa";
import AntWaspControlExtonPa from "@/pages/city-services/ant-wasp-control-exton-pa";
import GeneralPestControlCoatesvillePa from "@/pages/city-services/pest-control-coatesville-pa";
import TermiteControlCoatesvillePa from "@/pages/city-services/termite-control-coatesville-pa";
import WildlifeRodentControlCoatesvillePa from "@/pages/city-services/wildlife-control-coatesville-pa";
import AntWaspControlCoatesvillePa from "@/pages/city-services/ant-wasp-control-coatesville-pa";
import GeneralPestControlCochranvillePa from "@/pages/city-services/pest-control-cochranville-pa";
import TermiteControlCochranvillePa from "@/pages/city-services/termite-control-cochranville-pa";
import WildlifeRodentControlCochranvillePa from "@/pages/city-services/wildlife-control-cochranville-pa";
import AntWaspControlCochranvillePa from "@/pages/city-services/ant-wasp-control-cochranville-pa";
import GeneralPestControlKennettSquarePa from "@/pages/city-services/pest-control-kennett-square-pa";
import TermiteControlKennettSquarePa from "@/pages/city-services/termite-control-kennett-square-pa";
import WildlifeRodentControlKennettSquarePa from "@/pages/city-services/wildlife-control-kennett-square-pa";
import AntWaspControlKennettSquarePa from "@/pages/city-services/ant-wasp-control-kennett-square-pa";
import GeneralPestControlAvondalePa from "@/pages/city-services/pest-control-avondale-pa";
import TermiteControlAvondalePa from "@/pages/city-services/termite-control-avondale-pa";
import WildlifeRodentControlAvondalePa from "@/pages/city-services/wildlife-control-avondale-pa";
import AntWaspControlAvondalePa from "@/pages/city-services/ant-wasp-control-avondale-pa";
import GeneralPestControlWestGrovePa from "@/pages/city-services/pest-control-west-grove-pa";
import TermiteControlWestGrovePa from "@/pages/city-services/termite-control-west-grove-pa";
import WildlifeRodentControlWestGrovePa from "@/pages/city-services/wildlife-control-west-grove-pa";
import AntWaspControlWestGrovePa from "@/pages/city-services/ant-wasp-control-west-grove-pa";
import GeneralPestControlOxfordPa from "@/pages/city-services/pest-control-oxford-pa";
import TermiteControlOxfordPa from "@/pages/city-services/termite-control-oxford-pa";
import WildlifeRodentControlOxfordPa from "@/pages/city-services/wildlife-control-oxford-pa";
import AntWaspControlOxfordPa from "@/pages/city-services/ant-wasp-control-oxford-pa";
import GeneralPestControlLincolnUniversityPa from "@/pages/city-services/pest-control-lincoln-university-pa";
import TermiteControlLincolnUniversityPa from "@/pages/city-services/termite-control-lincoln-university-pa";
import WildlifeRodentControlLincolnUniversityPa from "@/pages/city-services/wildlife-control-lincoln-university-pa";
import AntWaspControlLincolnUniversityPa from "@/pages/city-services/ant-wasp-control-lincoln-university-pa";
import GeneralPestControlLandenbergPa from "@/pages/city-services/pest-control-landenberg-pa";
import TermiteControlLandenbergPa from "@/pages/city-services/termite-control-landenberg-pa";
import WildlifeRodentControlLandenbergPa from "@/pages/city-services/wildlife-control-landenberg-pa";
import AntWaspControlLandenbergPa from "@/pages/city-services/ant-wasp-control-landenberg-pa";
import GeneralPestControlChaddsFordPa from "@/pages/city-services/pest-control-chadds-ford-pa";
import TermiteControlChaddsFordPa from "@/pages/city-services/termite-control-chadds-ford-pa";
import WildlifeRodentControlChaddsFordPa from "@/pages/city-services/wildlife-control-chadds-ford-pa";
import AntWaspControlChaddsFordPa from "@/pages/city-services/ant-wasp-control-chadds-ford-pa";
import GeneralPestControlGlenMillsPa from "@/pages/city-services/pest-control-glen-mills-pa";
import TermiteControlGlenMillsPa from "@/pages/city-services/termite-control-glen-mills-pa";
import WildlifeRodentControlGlenMillsPa from "@/pages/city-services/wildlife-control-glen-mills-pa";
import AntWaspControlGlenMillsPa from "@/pages/city-services/ant-wasp-control-glen-mills-pa";
import GeneralPestControlHockessinDe from "@/pages/city-services/pest-control-hockessin-de";
import TermiteControlHockessinDe from "@/pages/city-services/termite-control-hockessin-de";
import WildlifeRodentControlHockessinDe from "@/pages/city-services/wildlife-control-hockessin-de";
import AntWaspControlHockessinDe from "@/pages/city-services/ant-wasp-control-hockessin-de";
import GeneralPestControlNewarkDe from "@/pages/city-services/pest-control-newark-de";
import TermiteControlNewarkDe from "@/pages/city-services/termite-control-newark-de";
import WildlifeRodentControlNewarkDe from "@/pages/city-services/wildlife-control-newark-de";
import AntWaspControlNewarkDe from "@/pages/city-services/ant-wasp-control-newark-de";
import GeneralPestControlWilmingtonDe from "@/pages/city-services/pest-control-wilmington-de";
import TermiteControlWilmingtonDe from "@/pages/city-services/termite-control-wilmington-de";
import WildlifeRodentControlWilmingtonDe from "@/pages/city-services/wildlife-control-wilmington-de";
import AntWaspControlWilmingtonDe from "@/pages/city-services/ant-wasp-control-wilmington-de";
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
      <Route path="/carpenter-bees" component={CarpenterBeesInfoPage} />
      <Route path="/carpenter-bee-control" component={CarpenterBeeControlPage} />
      <Route path="/carpenter-bee-treatment" component={CarpenterBeeTreatmentPage} />
      {/* New SEO landing pages targeting high-intent keywords */}
      <Route path="/termites" component={Termites} />
      <Route path="/bed-bugs" component={BedBugs} />
      <Route path="/rodents" component={Rodents} />
      <Route path="/wildlife" component={Wildlife} />
      <Route path="/service-areas" component={ServiceAreas} />
      <Route path="/service-areas/chester-county-pa" component={ChesterCountyPA} />
      <Route path="/service-areas/delaware-county-pa" component={DelawareCountyPA} />
      <Route path="/service-areas/new-castle-county-de" component={NewCastleCountyDE} />
      <Route path="/service-areas/montgomery-county-pa" component={MontgomeryCountyPA} />
      <Route path="/service-areas/northeast-maryland" component={NortheastMaryland} />
      {/* Additional city-level service area pages */}
      <Route path="/service-areas/coatesville-pa" component={CoatesvillePA} />
      <Route path="/service-areas/cochranville-pa" component={CochranvillePA} />
      <Route path="/service-areas/kennett-square-pa" component={KennettSquarePA} />
      <Route path="/service-areas/avondale-pa" component={AvondalePA} />
      <Route path="/service-areas/west-grove-pa" component={WestGrovePA} />
      <Route path="/service-areas/oxford-pa" component={OxfordPA} />
      <Route path="/service-areas/lincoln-university-pa" component={LincolnUniversityPA} />
      <Route path="/service-areas/landenberg-pa" component={LandenbergPA} />
      <Route path="/service-areas/chadds-ford-pa" component={ChaddsFordPA} />
      <Route path="/service-areas/glen-mills-pa" component={GlenMillsPA} />
      {/* City×Service programmatic SEO pages — 60 pages */}
      <Route path="/pest-control-downingtown-pa/" component={GeneralPestControlDowningtownPa} />
      <Route path="/termite-control-downingtown-pa/" component={TermiteControlDowningtownPa} />
      <Route path="/wildlife-control-downingtown-pa/" component={WildlifeRodentControlDowningtownPa} />
      <Route path="/ant-wasp-control-downingtown-pa/" component={AntWaspControlDowningtownPa} />
      <Route path="/pest-control-exton-pa/" component={GeneralPestControlExtonPa} />
      <Route path="/termite-control-exton-pa/" component={TermiteControlExtonPa} />
      <Route path="/wildlife-control-exton-pa/" component={WildlifeRodentControlExtonPa} />
      <Route path="/ant-wasp-control-exton-pa/" component={AntWaspControlExtonPa} />
      <Route path="/pest-control-coatesville-pa/" component={GeneralPestControlCoatesvillePa} />
      <Route path="/termite-control-coatesville-pa/" component={TermiteControlCoatesvillePa} />
      <Route path="/wildlife-control-coatesville-pa/" component={WildlifeRodentControlCoatesvillePa} />
      <Route path="/ant-wasp-control-coatesville-pa/" component={AntWaspControlCoatesvillePa} />
      <Route path="/pest-control-cochranville-pa/" component={GeneralPestControlCochranvillePa} />
      <Route path="/termite-control-cochranville-pa/" component={TermiteControlCochranvillePa} />
      <Route path="/wildlife-control-cochranville-pa/" component={WildlifeRodentControlCochranvillePa} />
      <Route path="/ant-wasp-control-cochranville-pa/" component={AntWaspControlCochranvillePa} />
      <Route path="/pest-control-kennett-square-pa/" component={GeneralPestControlKennettSquarePa} />
      <Route path="/termite-control-kennett-square-pa/" component={TermiteControlKennettSquarePa} />
      <Route path="/wildlife-control-kennett-square-pa/" component={WildlifeRodentControlKennettSquarePa} />
      <Route path="/ant-wasp-control-kennett-square-pa/" component={AntWaspControlKennettSquarePa} />
      <Route path="/pest-control-avondale-pa/" component={GeneralPestControlAvondalePa} />
      <Route path="/termite-control-avondale-pa/" component={TermiteControlAvondalePa} />
      <Route path="/wildlife-control-avondale-pa/" component={WildlifeRodentControlAvondalePa} />
      <Route path="/ant-wasp-control-avondale-pa/" component={AntWaspControlAvondalePa} />
      <Route path="/pest-control-west-grove-pa/" component={GeneralPestControlWestGrovePa} />
      <Route path="/termite-control-west-grove-pa/" component={TermiteControlWestGrovePa} />
      <Route path="/wildlife-control-west-grove-pa/" component={WildlifeRodentControlWestGrovePa} />
      <Route path="/ant-wasp-control-west-grove-pa/" component={AntWaspControlWestGrovePa} />
      <Route path="/pest-control-oxford-pa/" component={GeneralPestControlOxfordPa} />
      <Route path="/termite-control-oxford-pa/" component={TermiteControlOxfordPa} />
      <Route path="/wildlife-control-oxford-pa/" component={WildlifeRodentControlOxfordPa} />
      <Route path="/ant-wasp-control-oxford-pa/" component={AntWaspControlOxfordPa} />
      <Route path="/pest-control-lincoln-university-pa/" component={GeneralPestControlLincolnUniversityPa} />
      <Route path="/termite-control-lincoln-university-pa/" component={TermiteControlLincolnUniversityPa} />
      <Route path="/wildlife-control-lincoln-university-pa/" component={WildlifeRodentControlLincolnUniversityPa} />
      <Route path="/ant-wasp-control-lincoln-university-pa/" component={AntWaspControlLincolnUniversityPa} />
      <Route path="/pest-control-landenberg-pa/" component={GeneralPestControlLandenbergPa} />
      <Route path="/termite-control-landenberg-pa/" component={TermiteControlLandenbergPa} />
      <Route path="/wildlife-control-landenberg-pa/" component={WildlifeRodentControlLandenbergPa} />
      <Route path="/ant-wasp-control-landenberg-pa/" component={AntWaspControlLandenbergPa} />
      <Route path="/pest-control-chadds-ford-pa/" component={GeneralPestControlChaddsFordPa} />
      <Route path="/termite-control-chadds-ford-pa/" component={TermiteControlChaddsFordPa} />
      <Route path="/wildlife-control-chadds-ford-pa/" component={WildlifeRodentControlChaddsFordPa} />
      <Route path="/ant-wasp-control-chadds-ford-pa/" component={AntWaspControlChaddsFordPa} />
      <Route path="/pest-control-glen-mills-pa/" component={GeneralPestControlGlenMillsPa} />
      <Route path="/termite-control-glen-mills-pa/" component={TermiteControlGlenMillsPa} />
      <Route path="/wildlife-control-glen-mills-pa/" component={WildlifeRodentControlGlenMillsPa} />
      <Route path="/ant-wasp-control-glen-mills-pa/" component={AntWaspControlGlenMillsPa} />
      <Route path="/pest-control-hockessin-de/" component={GeneralPestControlHockessinDe} />
      <Route path="/termite-control-hockessin-de/" component={TermiteControlHockessinDe} />
      <Route path="/wildlife-control-hockessin-de/" component={WildlifeRodentControlHockessinDe} />
      <Route path="/ant-wasp-control-hockessin-de/" component={AntWaspControlHockessinDe} />
      <Route path="/pest-control-newark-de/" component={GeneralPestControlNewarkDe} />
      <Route path="/termite-control-newark-de/" component={TermiteControlNewarkDe} />
      <Route path="/wildlife-control-newark-de/" component={WildlifeRodentControlNewarkDe} />
      <Route path="/ant-wasp-control-newark-de/" component={AntWaspControlNewarkDe} />
      <Route path="/pest-control-wilmington-de/" component={GeneralPestControlWilmingtonDe} />
      <Route path="/termite-control-wilmington-de/" component={TermiteControlWilmingtonDe} />
      <Route path="/wildlife-control-wilmington-de/" component={WildlifeRodentControlWilmingtonDe} />
      <Route path="/ant-wasp-control-wilmington-de/" component={AntWaspControlWilmingtonDe} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/blog/carpenter-bee-season-pade" component={CarpenterBeeSeasonBlogPost} />
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
      <Route path="/admin/marketing">
        <AdminLayout>
          <AdminMarketing />
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
