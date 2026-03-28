import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, Printer, AlertCircle, Package, MapPin, Calendar, User, Wrench, Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

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
  serviceDate?: string | null;
  technicianName?: string | null;
  serviceType?: string | null;
  serviceAddress?: string | null;
  servicedArea?: string | null;
  jobLogId?: number | null;
}

interface InvoicePhoto {
  id: number;
  url: string;
  caption?: string | null;
  jobLogId: number;
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
    propertyType?: string | null;
  };
  lineItems: LineItem[];
  photos?: InvoicePhoto[];
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

function PhotoLightbox({ photos, initialIndex, onClose }: { photos: InvoicePhoto[]; initialIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(initialIndex);
  const photo = photos[current];
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center no-print" onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-3">
        <span className="text-white/60 text-sm">{current + 1} / {photos.length}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white"><X className="w-6 h-6" /></button>
      </div>
      <div className="flex items-center gap-4 max-w-full px-4" onClick={e => e.stopPropagation()}>
        {photos.length > 1 && (
          <button onClick={() => setCurrent(i => (i - 1 + photos.length) % photos.length)} className="text-white/60 hover:text-white p-2">
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        <img src={photo.url} alt={photo.caption || `Photo ${current + 1}`} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
        {photos.length > 1 && (
          <button onClick={() => setCurrent(i => (i + 1) % photos.length)} className="text-white/60 hover:text-white p-2">
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
      {photo.caption && (
        <p className="text-white/80 text-sm mt-3 text-center max-w-md">{photo.caption}</p>
      )}
    </div>
  );
}

export default function InvoiceView() {
  const { token } = useParams<{ token: string }>();
  const [lightbox, setLightbox] = useState<{ photos: InvoicePhoto[]; index: number } | null>(null);

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
  const photos = invoice.photos || [];
  const hasServiceDetails = invoice.lineItems.some(li => li.serviceDate || li.technicianName || li.serviceType || li.serviceAddress || li.servicedArea);
  const serviceAddress = invoice.lineItems.find(li => li.serviceAddress)?.serviceAddress;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-card { box-shadow: none !important; border: none !important; }
          .photo-grid img { max-height: 150px; break-inside: avoid; }
          .service-detail-card { break-inside: avoid; }
        }
        body { background: #f9fafb; }
      `}</style>

      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto mb-4 flex justify-end no-print">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save PDF
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto print-card shadow-lg">
          <CardContent className="p-0">
            {/* Header */}
            <div className="bg-blue-900 text-white p-6 sm:p-8 rounded-t-lg">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Absolute Pest Services</h1>
                  <p className="text-blue-200 mt-1 text-sm">(484) 643-2225</p>
                  <p className="text-blue-200 text-sm">rob@absolutepestservices.com</p>
                  <p className="text-blue-300 text-xs mt-0.5">absolutepestservices.com</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-300" />
                    <span className="text-xl font-bold">{invoice.invoiceNumber}</span>
                  </div>
                  <Badge className={`${STATUS_COLORS[invoice.status] || "bg-gray-100"} text-xs`}>
                    {invoice.status === "viewed" ? "RECEIVED" : invoice.status.toUpperCase()}
                  </Badge>
                  <div className="mt-2 space-y-0.5 text-sm text-blue-200">
                    <p>Issued: {safeFormat(invoice.issueDate, "MMM d, yyyy")}</p>
                    <p>Due: {safeFormat(invoice.dueDate, "MMM d, yyyy")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Bill To + Service Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {invoice.client && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bill To</p>
                    <p className="text-lg font-semibold">{invoice.client.name}</p>
                    {invoice.client.address && <p className="text-sm text-muted-foreground">{invoice.client.address}</p>}
                    {invoice.client.phone && <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>}
                    {invoice.client.email && <p className="text-sm text-muted-foreground">{invoice.client.email}</p>}
                    {invoice.client.propertyType && (
                      <Badge variant="outline" className="mt-2 text-xs capitalize">
                        {invoice.client.propertyType}
                      </Badge>
                    )}
                  </div>
                )}
                {serviceAddress && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Service Location</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                      <p className="text-sm">{serviceAddress}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Service Details Cards (if line items have service info) */}
              {hasServiceDetails && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Service Details</p>
                  <div className="space-y-3">
                    {invoice.lineItems.map((item) => {
                      const mat = item.materials as MaterialsData;
                      const hasMaterials = mat && (
                        (mat.type === "product" && mat.productName) ||
                        (mat.type === "supplies" && mat.items.length > 0)
                      );
                      return (
                        <div key={item.id} className="service-detail-card border rounded-lg p-4 bg-gray-50/50">
                          {/* Service meta row */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                            {item.serviceDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {safeFormat(item.serviceDate, "MMM d, yyyy")}
                              </span>
                            )}
                            {item.technicianName && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.technicianName}
                              </span>
                            )}
                            {item.serviceType && (
                              <span className="flex items-center gap-1">
                                <Wrench className="w-3 h-3" />
                                {item.serviceType}
                              </span>
                            )}
                            {item.servicedArea && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {item.servicedArea}
                              </span>
                            )}
                          </div>
                          {/* Work description */}
                          <p className="text-sm">{item.description}</p>
                          {/* Materials */}
                          {hasMaterials && (
                            <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
                              <div className="flex items-center gap-1 mb-1">
                                <Package className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Materials Used</span>
                              </div>
                              {mat.type === "product" && (
                                <p className="text-xs text-gray-600">
                                  {mat.productName}
                                  {mat.volume !== "" && mat.volume !== undefined && (
                                    <span> — {mat.volume} {mat.unit}</span>
                                  )}
                                </p>
                              )}
                              {mat.type === "supplies" && (
                                <p className="text-xs text-gray-600">
                                  {mat.items.map((s, si) => (
                                    <span key={si}>
                                      {si > 0 && ", "}
                                      {s.name}{s.quantity !== "" ? ` (×${s.quantity})` : ""}
                                    </span>
                                  ))}
                                </p>
                              )}
                            </div>
                          )}
                          {/* Price */}
                          <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                            <span className="text-sm font-semibold">${parseFloat(item.lineTotal).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Fallback: Simple table if no service details */}
              {!hasServiceDetails && (
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
                            <tr key={item.id} className={i % 2 === 0 ? "" : "bg-gray-50/50"}>
                              <td className="p-3">
                                {item.description}
                                {hasMaterials && (
                                  <div className="mt-1.5 pt-1.5 border-t border-dashed border-gray-200">
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <Package className="w-3 h-3 text-gray-400" />
                                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Materials</span>
                                    </div>
                                    {mat.type === "product" && (
                                      <p className="text-xs text-gray-500">
                                        {mat.productName}
                                        {mat.volume !== "" && mat.volume !== undefined && <span> — {mat.volume} {mat.unit}</span>}
                                      </p>
                                    )}
                                    {mat.type === "supplies" && (
                                      <p className="text-xs text-gray-500">
                                        {mat.items.map((s, si) => (
                                          <span key={si}>{si > 0 && ", "}{s.name}{s.quantity !== "" ? ` (×${s.quantity})` : ""}</span>
                                        ))}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-center align-top">{parseFloat(item.quantity)}</td>
                              <td className="p-3 text-right align-top">${parseFloat(item.unitRate).toFixed(2)}</td>
                              <td className="p-3 text-right align-top">{parseFloat(item.taxRate)}%</td>
                              <td className="p-3 text-right font-medium align-top">${parseFloat(item.lineTotal).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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

              {/* Photos */}
              {photos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      Service Photos
                    </p>
                    <div className="photo-grid grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((photo, idx) => (
                        <div key={photo.id} className="relative group cursor-pointer" onClick={() => setLightbox({ photos, index: idx })}>
                          <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                            <img src={photo.url} alt={photo.caption || `Service photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          {photo.caption && (
                            <p className="text-[11px] text-muted-foreground mt-1 truncate">{photo.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

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

              {/* Footer */}
              <div className="text-center space-y-2 pb-2">
                <p className="font-semibold text-blue-900">Thank you for choosing Absolute Pest Services!</p>
                <p className="text-sm text-muted-foreground">
                  Payment is due by <strong>{safeFormat(invoice.dueDate, "MMMM d, yyyy")}</strong>. Pay via cash, check, or credit card.
                </p>
                <p className="text-sm text-muted-foreground">
                  Questions? Call <strong>(484) 643-2225</strong> or email rob@absolutepestservices.com
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please reference invoice <strong>{invoice.invoiceNumber}</strong> when making payment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {lightbox && (
        <PhotoLightbox photos={lightbox.photos} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
