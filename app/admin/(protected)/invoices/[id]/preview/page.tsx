'use client';

import { useState, useEffect, useCallback } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Printer, Mail, Loader2, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import EmailInvoiceModal from './EmailInvoiceModal';

interface InvoiceLineItem {
  id: number;
  description: string;
  quantity: string;
  unitRate: string;
  taxRate: string;
  lineTotal: string;
  lineTax: string;
  serviceDate?: string | null;
  technicianName?: string | null;
  serviceType?: string | null;
  serviceAddress?: string | null;
  servicedArea?: string | null;
  materials?: any;
}

interface InvoiceClient {
  id: number;
  name: string;
  email?: string | null;
  address?: string | null;
  phone?: string | null;
  propertyType?: string | null;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  client?: InvoiceClient;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  notes: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentAmount: string | null;
  voidReason: string | null;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
};

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  try {
    const date = new Date(typeof d === 'string' ? d.slice(0, 10) + 'T12:00:00' : d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatShortDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  try {
    const date = new Date(typeof d === 'string' ? d.slice(0, 10) + 'T12:00:00' : d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatMaterials(materials: any): string | null {
  if (!materials) return null;
  if (materials.type === 'product' && materials.productName) {
    let s = materials.productName;
    if (materials.volume !== '' && materials.volume !== undefined) {
      s += ` — ${materials.volume} ${materials.unit || 'oz'}`;
    }
    return `Product: ${s}`;
  }
  if (materials.type === 'supplies' && materials.items?.length) {
    const items = materials.items.map((i: any) =>
      `${i.name}${i.quantity !== '' ? ` (×${i.quantity})` : ''}`
    ).join(', ');
    return `Supplies: ${items}`;
  }
  return null;
}

function InvoiceHeader({ invoiceNumber, status }: { invoiceNumber: string; status: string }) {
  return (
    <div className="bg-[#1e3a8a] px-6 py-5 flex items-start justify-between">
      <div>
        <h1 className="text-white text-xl font-bold">Absolute Pest Services</h1>
        <p className="text-blue-200 text-xs mt-0.5">
          (484) 643-2225 &nbsp;|&nbsp; rob@absolutepestservices.com &nbsp;|&nbsp; absolutepestservices.com
        </p>
        <p className="text-blue-200 text-xs mt-0.5">21 Sheffield Dr, West Grove, PA 19390 &nbsp;|&nbsp; PA License # BU0300</p>
      </div>
      <div className="text-right">
        <p className="text-white text-lg font-bold">INVOICE {invoiceNumber}</p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold mt-1 ${
          status === 'paid' ? 'bg-green-500 text-white' :
          status === 'sent' ? 'bg-blue-400 text-white' :
          status === 'viewed' ? 'bg-indigo-400 text-white' :
          status === 'overdue' ? 'bg-red-500 text-white' :
          status === 'void' ? 'bg-gray-400 text-white' :
          'bg-blue-200 text-blue-900'
        }`}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function BillToSection({ client }: { client: InvoiceClient | undefined }) {
  if (!client) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill To</p>
      <p className="text-base font-semibold text-gray-900">{client.name}</p>
      {client.address && (
        <p className="text-sm text-gray-700">{client.address}</p>
      )}
      {client.phone && (
        <p className="text-sm text-gray-700">{client.phone}</p>
      )}
      {client.email && (
        <p className="text-sm text-gray-700">{client.email}</p>
      )}
      {client.propertyType && (
        <p className="text-xs text-gray-500 mt-1">
          Property: {client.propertyType.charAt(0).toUpperCase() + client.propertyType.slice(1)}
        </p>
      )}
    </div>
  );
}

function InvoiceDetails({ issueDate, dueDate, total }: { issueDate: string; dueDate: string; total: string }) {
  return (
    <div className="text-right space-y-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice Details</p>
      <div className="flex justify-end gap-8 text-sm">
        <div>
          <p className="text-gray-500">Invoice Date:</p>
          <p className="font-medium text-gray-900">{formatShortDate(issueDate)}</p>
        </div>
        <div>
          <p className="text-gray-500">Due Date:</p>
          <p className="font-medium text-gray-900">{formatShortDate(dueDate)}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-gray-500">Total Due:</p>
        <p className="text-xl font-bold text-[#1e3a8a]">${parseFloat(total).toFixed(2)}</p>
      </div>
    </div>
  );
}

function LineItemsTable({ lineItems }: { lineItems: InvoiceLineItem[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</th>
            <th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide w-16">Qty</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide w-24">Rate</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide w-16">Tax</th>
            <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide w-24">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lineItems.map(item => {
            const matStr = formatMaterials(item.materials);
            return (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="text-gray-900 font-medium">{item.description}</div>
                  {/* Service metadata */}
                  {(item.serviceDate || item.technicianName || item.serviceType || item.servicedArea || item.serviceAddress) && (
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {item.serviceDate && <div>Date: {formatShortDate(item.serviceDate)}</div>}
                      {item.technicianName && <div>Tech: {item.technicianName}</div>}
                      {item.serviceType && <div>Service: {item.serviceType}</div>}
                      {item.servicedArea && <div>Area: {item.servicedArea}</div>}
                      {item.serviceAddress && <div>Location: {item.serviceAddress}</div>}
                    </div>
                  )}
                  {matStr && (
                    <div className="text-xs text-gray-400 mt-1 italic">{matStr}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{parseFloat(item.quantity).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-700">${parseFloat(item.unitRate).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-gray-700">{parseFloat(item.taxRate)}%</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">${parseFloat(item.lineTotal).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InvoiceTotals({ subtotal, taxTotal, total }: { subtotal: string; taxTotal: string; total: string }) {
  return (
    <div className="flex justify-end">
      <div className="w-64 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Subtotal:</span>
          <span className="font-medium text-gray-900">${parseFloat(subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tax:</span>
          <span className="font-medium text-gray-900">${parseFloat(taxTotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-2">
          <span className="text-base font-bold text-[#1e3a8a]">Total Due:</span>
          <span className="text-xl font-bold text-[#1e3a8a]">${parseFloat(total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceFooter({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <div className="border-t border-gray-200 pt-6 text-center">
      <p className="text-sm font-semibold text-[#1e3a8a]">Thank you for choosing Absolute Pest Services!</p>
      <p className="text-xs text-gray-500 mt-1">Questions? Call (484) 643-2225 or email rob@absolutepestservices.com</p>
      <p className="text-xs text-gray-400 mt-1">Please reference invoice {invoiceNumber} when making payment.</p>
    </div>
  );
}

export default function InvoicePreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [client, setClient] = useState<InvoiceClient | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    params.then(p => setInvoiceId(p.id));
  }, [params]);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    setNotFoundState(false);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`);
      if (res.status === 404) {
        setNotFoundState(true);
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInvoice(data.invoice);
      setLineItems(data.invoice?.lineItems || []);
      setClient(data.invoice?.client);
    } catch (err) {
      console.error(err);
      setNotFoundState(true);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (invoiceId) fetchInvoice();
  }, [fetchInvoice, invoiceId]);

  if (notFoundState) {
    notFound();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h1>
            <p className="text-xs text-gray-500">
              Issued {formatDate(invoice.issueDate)} &bull; Due {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Invoice
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="invoice-page bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden invoice-preview-wrapper">
        {/* Blue Header Band */}
        <InvoiceHeader invoiceNumber={invoice.invoiceNumber} status={invoice.status} />

        {/* Invoice Body */}
        <div className="p-6 space-y-6">
          {/* Bill To + Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BillToSection client={client} />
            <InvoiceDetails issueDate={invoice.issueDate} dueDate={invoice.dueDate} total={invoice.total} />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Line Items */}
          {lineItems.length > 0 ? (
            <LineItemsTable lineItems={lineItems} />
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No line items</div>
          )}

          {/* Totals */}
          <InvoiceTotals subtotal={invoice.subtotal} taxTotal={invoice.taxTotal} total={invoice.total} />

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            {invoice.sentAt && (
              <div>
                <span className="font-semibold">Sent:</span> {formatDate(invoice.sentAt)}
              </div>
            )}
            {invoice.viewedAt && (
              <div>
                <span className="font-semibold">Viewed:</span> {formatDate(invoice.viewedAt)}
              </div>
            )}
            {invoice.paidAt && (
              <div>
                <span className="font-semibold">Paid:</span> {formatDate(invoice.paidAt)}
                {invoice.paymentMethod && (
                  <span className="ml-1">({invoice.paymentMethod}{invoice.paymentAmount ? ` $${parseFloat(invoice.paymentAmount).toFixed(2)}` : ''})</span>
                )}
              </div>
            )}
            {invoice.voidReason && (
              <div className="text-red-600">
                <span className="font-semibold">Voided:</span> {invoice.voidReason}
              </div>
            )}
          </div>

          {/* Footer */}
          <InvoiceFooter invoiceNumber={invoice.invoiceNumber} />
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailInvoiceModal
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          clientEmail={client?.email || ''}
          clientName={client?.name || ''}
          onClose={() => setShowEmailModal(false)}
          onSent={() => {
            setShowEmailModal(false);
            fetchInvoice();
          }}
        />
      )}
    </div>
  );
}
