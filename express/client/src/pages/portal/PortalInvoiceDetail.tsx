import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, useParams } from "wouter";
import { 
  ArrowLeft,
  CreditCard,
  Download,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitRate: string;
  lineTotal: string;
}

interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  notes?: string;
  pdfUrl?: string;
  client?: {
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  lineItems: LineItem[];
}

export default function PortalInvoiceDetail() {
  const [location, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [params.id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('GET', `/api/portal/invoices/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
      } else {
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive"
        });
        setLocation('/portal/invoices');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load invoice",
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

  const isOverdue = () => {
    if (!invoice) return false;
    return invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
  };

  const handleDownloadPDF = () => {
    if (invoice?.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/portal/invoices')}
          className="text-gray-400 hover:text-white -ml-3 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Invoices
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Invoice #{invoice.invoiceNumber}
          </h1>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      {isOverdue() && (
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center text-red-400">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>This invoice is overdue. Please pay as soon as possible.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Invoice Details */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Invoice Details</span>
              {invoice.pdfUrl && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Invoice Number</p>
                <p className="text-white font-medium">#{invoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Issue Date</p>
                <p className="text-white font-medium">{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Due Date</p>
                <p className={`font-medium ${isOverdue() ? 'text-red-400' : 'text-white'}`}>
                  {format(new Date(invoice.dueDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bill To */}
        {invoice.client && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Bill To</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <p className="text-white font-medium">{invoice.client.name}</p>
                {invoice.client.address && (
                  <div className="flex items-center text-gray-400">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{invoice.client.address}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{invoice.client.email}</span>
                </div>
                {invoice.client.phone && (
                  <div className="flex items-center text-gray-400">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{invoice.client.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Line Items */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 py-3 pr-4">Description</th>
                      <th className="text-right text-gray-400 py-3 px-4">Qty</th>
                      <th className="text-right text-gray-400 py-3 px-4">Rate</th>
                      <th className="text-right text-gray-400 py-3 pl-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b border-white/5">
                        <td className="text-white py-3 pr-4">{item.description}</td>
                        <td className="text-right text-gray-300 py-3 px-4">{item.quantity}</td>
                        <td className="text-right text-gray-300 py-3 px-4">${item.unitRate}</td>
                        <td className="text-right text-white py-3 pl-4">${item.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No line items</p>
            )}

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>${invoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax</span>
                    <span>${invoice.taxTotal}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span>${invoice.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Pay Now Button (for unpaid invoices) */}
        {invoice.status !== 'paid' && (
          <div className="flex justify-end">
            <Button 
              className="bg-green-600 hover:bg-green-500"
              onClick={() => {
                // For now, show message that payments are handled separately
                toast({
                  title: "Payment Required",
                  description: "Please contact us at rob@absolutepestservices.com to make a payment.",
                });
              }}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Contact to Pay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
