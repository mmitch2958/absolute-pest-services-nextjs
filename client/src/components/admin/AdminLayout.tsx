import { Building2, FolderOpen, Target, BarChart3, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    {
      title: "Clients",
      href: "/admin/clients",
      icon: Building2,
    },
    {
      title: "Projects", 
      href: "/admin/projects",
      icon: FolderOpen,
    },
    {
      title: "Milestones",
      href: "/admin/milestones", 
      icon: Target,
    },
    {
      title: "Dashboards",
      href: "/admin/dashboards",
      icon: BarChart3,
    },
  ];

  const isActiveRoute = (href: string) => {
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="border-b p-6">
              <div className="flex items-center space-x-2">
                <Settings className="w-6 h-6" />
                <h2 className="text-lg font-semibold">Admin Portal</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Steel City AI Management
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.href);
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start ${
                          isActive ? "bg-secondary" : ""
                        }`}
                        data-testid={`nav-${item.title.toLowerCase()}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {item.title}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t p-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full justify-start"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}