import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  FileText,
  Search,
  Plus,
  Filter,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye
} from "lucide-react";
import { format } from "date-fns";

interface Invoice {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  total: string;
  clientName?: string;
}

function safeFormat(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(String(dateStr).slice(0, 10) + "T12:00:00"), fmt);
  } catch {
    return "—";
  }
}

export default function AdminInvoices() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('GET', '/api/admin/invoices');
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

  const handleMarkPaid = async (invoiceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiRequest('POST', `/api/admin/invoices/${invoiceId}/mark-paid`);
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice marked as paid",
        });
        loadInvoices();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark invoice as paid",
        variant: "destructive"
      });
    }
  };

  const handleSendInvoice = async (invoiceId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await apiRequest('POST', `/api/admin/invoices/${invoiceId}/send`);
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: "Invoice sent to customer",
        });
        loadInvoices();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice",
        variant: "destructive"
      });
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

  const isOverdue = (dueDate: string | null | undefined, status: string) => {
    if (!dueDate) return false;
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = searchTerm === '' ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.clientName && invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const outstandingTotal = filteredInvoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + parseFloat(String(inv.total) || '0'), 0);

  const overdueCount = filteredInvoices.filter(inv => isOverdue(inv.dueDate, inv.status)).length;
  const paidCount = filteredInvoices.filter(inv => inv.status === 'paid').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage and track all customer invoices</p>
        </div>
        <Button onClick={() => setLocation('/admin/invoices/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${outstandingTotal.toFixed(2)}</p>
              </div>
              {overdueCount > 0 && (
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Invoices</p>
            <p className="text-2xl font-bold">{filteredInvoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-green-600">{paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{overdueCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="viewed">Viewed</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Invoices Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first invoice"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map((invoice) => (
            <Card
              key={invoice.id}
              className={`hover:bg-accent/50 transition-colors cursor-pointer ${
                isOverdue(invoice.dueDate, invoice.status) ? 'border-red-300' : ''
              }`}
              onClick={() => setLocation(`/admin/invoices/${invoice.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      invoice.status === 'paid'
                        ? 'bg-green-100'
                        : isOverdue(invoice.dueDate, invoice.status)
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                    }`}>
                      {invoice.status === 'paid' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : isOverdue(invoice.dueDate, invoice.status) ? (
                        <AlertCircle className="h-6 w-6 text-red-600" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold">#{invoice.invoiceNumber}</h3>
                        <Badge variant="outline" className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {invoice.clientName && (
                          <span className="font-medium">{invoice.clientName}</span>
                        )}
                        <span>Issued: {safeFormat(invoice.issueDate, 'MMM d, yyyy')}</span>
                        <span>Due: {safeFormat(invoice.dueDate, 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`text-xl font-bold ${
                      invoice.status === 'paid'
                        ? 'text-green-600'
                        : isOverdue(invoice.dueDate, invoice.status)
                          ? 'text-red-600'
                          : ''
                    }`}>
                      ${invoice.total}
                    </p>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {invoice.status !== 'paid' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleSendInvoice(invoice.id, e)}
                            title="Send to customer"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleMarkPaid(invoice.id, e)}
                            title="Mark as paid"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(`/admin/invoices/${invoice.id}`)}
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
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
