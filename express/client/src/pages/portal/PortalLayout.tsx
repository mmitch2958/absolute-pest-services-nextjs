import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import PortalDashboard from "./PortalDashboard";
import PortalAppointments from "./PortalAppointments";
import PortalNewAppointment from "./PortalNewAppointment";
import PortalAppointmentDetail from "./PortalAppointmentDetail";
import PortalServiceRequests from "./PortalServiceRequests";
import PortalNewServiceRequest from "./PortalNewServiceRequest";
import PortalInvoices from "./PortalInvoices";
import PortalInvoiceDetail from "./PortalInvoiceDetail";
import PortalProfile from "./PortalProfile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  User, 
  Home,
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, badge, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
        active 
          ? "bg-yellow-500 text-gray-900" 
          : "text-gray-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <div className="flex items-center">
        <span className="mr-3">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      {active && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

export default function PortalLayout() {
  const [location, setLocation] = useLocation();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth?redirect=/portal');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Redirect admins to admin portal
  useEffect(() => {
    if (user?.role === 'admin') {
      setLocation('/admin/clients');
    }
  }, [user, setLocation]);

  // Handle logout
  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
      setLocation('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(210,13%,18%)] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Determine active page for highlighting
  const isActive = (path: string) => {
    if (path === '/portal' || path === '/portal/') {
      return location === '/portal' || location === '/portal/';
    }
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[hsl(210,13%,18%)]">
      {/* Mobile Header */}
      <header className="bg-[hsl(210,13%,15%)] border-b border-white/10 md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-white font-bold text-lg">Customer Portal</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex flex-col w-64 bg-[hsl(210,13%,15%)] min-h-screen p-4">
          {/* Logo */}
          <div className="mb-8 px-4">
            <h1 className="text-white font-bold text-xl">Customer Portal</h1>
            <p className="text-gray-400 text-sm mt-1">Absolute Pest Services</p>
          </div>

          {/* Welcome */}
          <div className="mb-6 px-4 py-3 bg-white/5 rounded-lg">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Welcome</p>
            <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <NavItem 
              href="/portal" 
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              active={isActive('/portal') && location === '/portal'}
              onClick={() => setLocation('/portal')}
            />
            <NavItem 
              href="/portal/appointments" 
              icon={<Calendar className="h-5 w-5" />}
              label="Appointments"
              active={isActive('/portal/appointments')}
              onClick={() => setLocation('/portal/appointments')}
            />
            <NavItem 
              href="/portal/service-requests" 
              icon={<FileText className="h-5 w-5" />}
              label="Service Requests"
              active={isActive('/portal/service-requests')}
              onClick={() => setLocation('/portal/service-requests')}
            />
            <NavItem 
              href="/portal/invoices" 
              icon={<CreditCard className="h-5 w-5" />}
              label="Invoices"
              active={isActive('/portal/invoices')}
              onClick={() => setLocation('/portal/invoices')}
            />
            <NavItem 
              href="/portal/profile" 
              icon={<User className="h-5 w-5" />}
              label="Profile"
              active={isActive('/portal/profile')}
              onClick={() => setLocation('/portal/profile')}
            />
          </nav>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <Home className="h-4 w-4 mr-3" />
              Back to Website
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-[hsl(210,13%,18%)] z-50 p-4">
            <div className="space-y-2">
              <div className="mb-6 px-4 py-3 bg-white/5 rounded-lg">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Welcome</p>
                <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
              </div>
              <NavItem 
                href="/portal" 
                icon={<Home className="h-5 w-5" />}
                label="Dashboard"
                active={location === '/portal'}
                onClick={() => { setLocation('/portal'); setMobileMenuOpen(false); }}
              />
              <NavItem 
                href="/portal/appointments" 
                icon={<Calendar className="h-5 w-5" />}
                label="Appointments"
                active={location.startsWith('/portal/appointments')}
                onClick={() => { setLocation('/portal/appointments'); setMobileMenuOpen(false); }}
              />
              <NavItem 
                href="/portal/service-requests" 
                icon={<FileText className="h-5 w-5" />}
                label="Service Requests"
                active={location.startsWith('/portal/service-requests')}
                onClick={() => { setLocation('/portal/service-requests'); setMobileMenuOpen(false); }}
              />
              <NavItem 
                href="/portal/invoices" 
                icon={<CreditCard className="h-5 w-5" />}
                label="Invoices"
                active={location.startsWith('/portal/invoices')}
                onClick={() => { setLocation('/portal/invoices'); setMobileMenuOpen(false); }}
              />
              <NavItem 
                href="/portal/profile" 
                icon={<User className="h-5 w-5" />}
                label="Profile"
                active={location.startsWith('/portal/profile')}
                onClick={() => { setLocation('/portal/profile'); setMobileMenuOpen(false); }}
              />
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Button
                  onClick={() => { setLocation('/'); setMobileMenuOpen(false); }}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-white/10"
                >
                  <Home className="h-4 w-4 mr-3" />
                  Back to Website
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Switch>
            <Route path="/portal" component={PortalDashboard} />
            <Route path="/portal/" component={PortalDashboard} />
            <Route path="/portal/appointments" component={PortalAppointments} />
            <Route path="/portal/appointments/new" component={PortalNewAppointment} />
            <Route path="/portal/appointments/:id" component={PortalAppointmentDetail} />
            <Route path="/portal/service-requests" component={PortalServiceRequests} />
            <Route path="/portal/service-requests/new" component={PortalNewServiceRequest} />
            <Route path="/portal/invoices" component={PortalInvoices} />
            <Route path="/portal/invoices/:id" component={PortalInvoiceDetail} />
            <Route path="/portal/profile" component={PortalProfile} />
          </Switch>
        </main>
      </div>
    </div>
  );
}
