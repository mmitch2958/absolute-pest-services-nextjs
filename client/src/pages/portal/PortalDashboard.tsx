import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Calendar, 
  FileText, 
  CreditCard, 
  Plus, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface Summary {
  upcomingCount: number;
  completedThisYearCount: number;
  openRequestsCount: number;
  outstandingBalance: string;
  hasOverdue: boolean;
}

export default function PortalDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('GET', '/api/portal/summary');
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getOutstandingColor = () => {
    if (!summary) return "text-gray-900";
    if (summary.hasOverdue) return "text-red-600";
    if (parseFloat(summary.outstandingBalance) > 0) return "text-yellow-600";
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome to Your Portal</h1>
        <p className="text-gray-400 mt-1">Manage your appointments, service requests, and invoices</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-white">{summary?.upcomingCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Open Requests</p>
                <p className="text-2xl font-bold text-white">{summary?.openRequestsCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Completed (Year)</p>
                <p className="text-2xl font-bold text-white">{summary?.completedThisYearCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${summary?.hasOverdue ? 'bg-red-500/20' : parseFloat(summary?.outstandingBalance || '0') > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                <DollarSign className={`h-6 w-6 ${getOutstandingColor()}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Outstanding</p>
                <p className={`text-2xl font-bold ${getOutstandingColor()}`}>
                  ${summary?.outstandingBalance || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            onClick={() => setLocation('/portal/appointments/new')}
            className="h-auto py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900"
          >
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Schedule Inspection</div>
                <div className="text-sm opacity-80">Book a property inspection</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </div>
          </Button>

          <Button
            onClick={() => setLocation('/portal/service-requests/new')}
            className="h-auto py-4 bg-blue-600 hover:bg-blue-500"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Request Service</div>
                <div className="text-sm opacity-80">Submit a service request</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </div>
          </Button>

          <Button
            onClick={() => setLocation('/portal/invoices')}
            className="h-auto py-4 bg-green-600 hover:bg-green-500"
          >
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">View Invoices</div>
                <div className="text-sm opacity-80">Check your billing</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </div>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(summary?.hasOverdue || parseFloat(summary?.outstandingBalance || '0') > 0) && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
              Account Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summary?.hasOverdue && (
              <div className="flex items-center text-yellow-400 mb-2">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span>You have overdue invoices. Please review and pay as soon as possible.</span>
              </div>
            )}
            {parseFloat(summary?.outstandingBalance || '0') > 0 && !summary?.hasOverdue && (
              <div className="flex items-center text-yellow-400">
                <Clock className="h-4 w-4 mr-2" />
                <span>You have outstanding balance of ${summary?.outstandingBalance}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              className="mt-4 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
              onClick={() => setLocation('/portal/invoices')}
            >
              View Invoices
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
