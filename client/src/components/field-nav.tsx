import { ClipboardList, History, Users, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FieldNavProps {
  canManageEmployees?: boolean;
}

export function FieldNav({ canManageEmployees }: FieldNavProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try { await apiRequest("POST", "/api/field/logout"); } catch {}
    localStorage.removeItem("fieldEmployee");
    localStorage.removeItem("fieldPin");
    toast({ title: "Signed out" });
    setLocation("/field");
  };

  const items = [
    { href: "/field/log", icon: ClipboardList, label: "Log Job" },
    { href: "/field/history", icon: History, label: "History" },
    ...(canManageEmployees
      ? [{ href: "/field/employees", icon: Users, label: "Team" }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-colors text-muted-foreground"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Out</span>
        </button>
      </div>
    </nav>
  );
}
