import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, Printer, AlertCircle, Package } from "lucide-react";
import { format } from "date-fns";

interface MaterialsProduct {
  type: "product";
  productName: string;
  volume: number | "";
  unit: "oz" | "gallons";
}

interface MaterialsSupplies {
  type: "supplies";
  items: { name: string; quantity: number | "" }[];
}

type MaterialsData = MaterialsProduct | MaterialsSupplies | null;

interface LineItem {
  id: number;
  description: string;
  quantity: string;
  unitRate: string;
  taxRate: string;
  lineTotal: string;
  lineTax: string;
  materials?: MaterialsData;
}

interface InvoiceViewData {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  notes: string | null;
  client?: {
    name: string;
    email: string | null;
    address: string | null;
    phone: string | null;
  };
  lineItems: LineItem[];
}

function safeFormat(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return "—";
  try {
    return format(new Date(String(dateStr).slice(0, 10) + "T12:00:00"), fmt);
  } catch {
    return "—";
  }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  void: "bg-gray-200 text-gray-500",
};

export default function InvoiceView() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, isError } = useQuery<{ success: boolean; invoice: InvoiceViewData }>({
    queryKey: ["/api/invoices/view", token],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/view/${token}`);
      if (!res.ok) throw new Error("Invoice not found");
      return res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isError || !data?.invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground">This invoice link may have expired or is invalid.</p>
          <p className="text-sm text-muted-foreground mt-2">Contact us at (484) 643-2225 for help.</p>
        </div>
      </div>
    );
  }

  const invoice = data.invoice;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: none !important; }
        }
        body { background: #f9fafb; }
      `}</style>

      <div className="min-h-screen py-8 px-4">
        {/* Print button */}
        <div className="max-w-3xl mx-auto mb-4 flex justify-end no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto print-card shadow-lg">
          <CardContent className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Absolute Pest Services</h1>
                <p className="text-muted-foreground mt-1">(484) 643-2225</p>
                <p className="text-muted-foreground">rob@absolutepestservices.com</p>
                <p className="text-muted-foreground text-sm">absolutepestservices.com</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 mb-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xl font-bold">{invoice.invoiceNumber}</span>
                </div>
                <Badge className={STATUS_COLORS[invoice.status] || "bg-gray-100"}>
                  {invoice.status === "viewed" ? "RECEIVED" : invoice.status.toUpperCase()}
                </Badge>
                <div className="mt-2 space-y-0.5 text-sm text-muted-foreground">
                  <p>Date: {safeFormat(invoice.issueDate, "MMMM d, yyyy")}</p>
                  <p>Due: {safeFormat(invoice.dueDate, "MMMM d, yyyy")}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bill To */}
            {invoice.client && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bill To</p>
                <p className="text-lg font-semibold">{invoice.client.name}</p>
                {invoice.client.address && <p className="text-sm text-muted-foreground">{invoice.client.address}</p>}
                {invoice.client.phone && <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>}
                {invoice.client.email && <p className="text-sm text-muted-foreground">{invoice.client.email}</p>}
              </div>
            )}

            {invoice.client && <Separator />}

            {/* Line Items */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Services</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium">Description</th>
                      <th className="text-center p-3 font-medium w-16">Qty</th>
                      <th className="text-right p-3 font-medium w-24">Rate</th>
                      <th className="text-right p-3 font-medium w-20">Tax</th>
                      <th className="text-right p-3 font-medium w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item, i) => {
                      const mat = item.materials as MaterialsData;
                      const hasMaterials = mat && (
                        (mat.type === "product" && mat.productName) ||
                        (mat.type === "supplies" && mat.items.length > 0)
                      );
                      return (
                        <>
                          <tr key={item.id} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                            <td className="p-3">
                              {item.description}
                              {hasMaterials && (
                                <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-200">
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <Package className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Materials Used</span>
                                  </div>
                                  {mat.type === "product" && (
                                    <p className="text-xs text-gray-500">
                                      {mat.productName}
                                      {mat.volume !== "" && mat.volume !== undefined && (
                                        <span> — {mat.volume} {mat.unit}</span>
                                      )}
                                    </p>
                                  )}
                                  {mat.type === "supplies" && (
                                    <div className="text-xs text-gray-500 space-y-0">
                                      {mat.items.map((s, si) => (
                                        <span key={si}>
                                          {si > 0 && ", "}
                                          {s.name}{s.quantity !== "" ? ` (×${s.quantity})` : ""}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="p-3 text-center align-top">{parseFloat(item.quantity)}</td>
                            <td className="p-3 text-right align-top">${parseFloat(item.unitRate).toFixed(2)}</td>
                            <td className="p-3 text-right align-top">{parseFloat(item.taxRate)}%</td>
                            <td className="p-3 text-right font-medium align-top">${parseFloat(item.lineTotal).toFixed(2)}</td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${parseFloat(invoice.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${parseFloat(invoice.taxTotal).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total Due</span>
                  <span className="text-blue-900">${parseFloat(invoice.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              </>
            )}

            <Separator />

            <div className="text-center space-y-1">
              <p className="font-semibold text-blue-900">Thank you for choosing Absolute Pest Services!</p>
              <p className="text-sm text-muted-foreground">
                Questions? Call <strong>(484) 643-2225</strong> or email rob@absolutepestservices.com
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Please reference invoice <strong>{invoice.invoiceNumber}</strong> when making payment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
