import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  CreditCard, 
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  total: string;
}

export default function PortalInvoices() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('GET', '/api/portal/invoices');
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  // Calculate totals
  const outstandingTotal = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + parseFloat(String(inv.total)), 0);
  
  const overdueCount = invoices.filter(inv => isOverdue(inv.dueDate, inv.status)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/portal')}
          className="text-gray-400 hover:text-white -ml-3 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Invoices</h1>
        <p className="text-gray-400 mt-1">View and pay your invoices</p>
      </div>

      {/* Summary Cards */}
      {invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Outstanding</p>
                  <p className="text-2xl font-bold text-white">${outstandingTotal.toFixed(2)}</p>
                </div>
                {overdueCount > 0 && (
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Total Invoices</p>
              <p className="text-2xl font-bold text-white">{invoices.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <p className="text-sm text-gray-400">Paid</p>
              <p className="text-2xl font-bold text-green-400">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overdue Warning */}
      {overdueCount > 0 && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>You have {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''}. Please pay as soon as possible.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
        </div>
      ) : invoices.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Invoices</h3>
            <p className="text-gray-400">You don't have any invoices yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <Card 
              key={invoice.id} 
              className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer ${
                isOverdue(invoice.dueDate, invoice.status) ? 'border-red-500/30' : ''
              }`}
              onClick={() => setLocation(`/portal/invoices/${invoice.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      invoice.status === 'paid' 
                        ? 'bg-green-500/20' 
                        : isOverdue(invoice.dueDate, invoice.status)
                          ? 'bg-red-500/20'
                          : 'bg-yellow-500/20'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : isOverdue(invoice.dueDate, invoice.status) ? (
                        <AlertCircle className="h-6 w-6 text-red-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">
                          #{invoice.invoiceNumber}
                        </h3>
                        <Badge className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Issued: {format(new Date(invoice.issueDate), 'MMM d, yyyy')}</span>
                        <span>Due: {format(new Date(invoice.dueDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${
                      invoice.status === 'paid' 
                        ? 'text-green-400' 
                        : isOverdue(invoice.dueDate, invoice.status)
                          ? 'text-red-400'
                          : 'text-white'
                    }`}>
                      ${invoice.total}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
