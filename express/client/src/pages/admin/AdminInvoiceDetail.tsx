import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Printer, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminInvoiceDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['/api/admin/invoices', params.id],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/admin/invoices/${params.id}`);
      return res.json();
    },
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => setLocation('/admin/invoices')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Invoice not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => setLocation('/admin/invoices')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Invoice #{invoice.invoiceNumber}</CardTitle>
              <p className="text-gray-500 mt-1">{invoice.clientName || 'Client'}</p>
            </div>
            <Badge className={statusColors[invoice.status] || 'bg-gray-100 text-gray-700'}>
              {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Invoice Details</h3>
              <p className="text-sm text-gray-600">Issue Date: {invoice.issueDate || '—'}</p>
              <p className="text-sm text-gray-600">Due Date: {invoice.dueDate || '—'}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-gray-700 mb-2">Amount Due</h3>
              <p className="text-3xl font-bold text-green-600">
                ${(invoice.totalAmount ?? 0).toFixed(2)}
              </p>
            </div>
          </div>

          {invoice.lineItems?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Line Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">Description</th>
                      <th className="text-right p-3 font-medium text-gray-600">Qty</th>
                      <th className="text-right p-3 font-medium text-gray-600">Rate</th>
                      <th className="text-right p-3 font-medium text-gray-600">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item: any, i: number) => (
                      <tr key={i} className="border-t">
                        <td className="p-3 text-gray-700">{item.description}</td>
                        <td className="p-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="p-3 text-right text-gray-600">${item.unitRate}</td>
                        <td className="p-3 text-right text-gray-700 font-medium">
                          ${(parseFloat(item.quantity || '0') * parseFloat(item.unitRate || '0')).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
