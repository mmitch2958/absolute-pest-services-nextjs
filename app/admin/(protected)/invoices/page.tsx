'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Loader2, Send, CheckCircle, Ban, FileText, AlertTriangle } from 'lucide-react';

interface Invoice {
  id: number;
  invoice_number: string;
  client_id: number;
  client_name: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: string;
  tax_total: string;
  total: string;
  notes: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  payment_method: string | null;
  payment_amount: string | null;
  void_reason: string | null;
  created_at: string;
}

interface LineItem {
  id: number;
  description: string;
  quantity: string;
  unit_rate: string;
  line_total: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
};

const TABS = ['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Void'] as const;
type Tab = typeof TABS[number];

function DetailModal({ invoice, onClose, onAction, loading }: {
  invoice: Invoice & { lineItems?: LineItem[] };
  onClose: () => void;
  onAction: (action: string, data?: any) => Promise<void>;
  loading: boolean;
}) {
  const [showVoidReason, setShowVoidReason] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(invoice.total || '');
  const [paymentMethod, setPaymentMethod] = useState('');

  async function handleSend() { await onAction('send'); }
  async function handleMarkPaid() {
    await onAction('paid', { paymentAmount, paymentMethod });
  }
  async function handleVoid() {
    await onAction('void', { voidReason });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Invoice #{invoice.invoice_number}</h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[invoice.status]}`}>
              {invoice.status}
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Client</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{invoice.client_name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Issue Date</p>
              <p className="text-sm text-gray-700 mt-0.5">{new Date(invoice.issue_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Due Date</p>
              <p className="text-sm text-gray-700 mt-0.5">{new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Total</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">${parseFloat(invoice.total || '0').toFixed(2)}</p>
            </div>
          </div>

          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Line Items</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-xs font-semibold text-gray-500">Description</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">Qty</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">Rate</th>
                    <th className="text-right py-2 text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoice.lineItems.map(item => (
                    <tr key={item.id}>
                      <td className="py-2 text-gray-700">{item.description}</td>
                      <td className="py-2 text-right text-gray-600">{parseFloat(item.quantity).toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-600">${parseFloat(item.unit_rate).toFixed(2)}</td>
                      <td className="py-2 text-right text-gray-900 font-medium">${parseFloat(item.line_total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {invoice.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Notes</p>
              <p className="text-sm text-gray-700 mt-1">{invoice.notes}</p>
            </div>
          )}

          {invoice.void_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-red-600 uppercase">Void Reason</p>
              <p className="text-sm text-red-700 mt-0.5">{invoice.void_reason}</p>
            </div>
          )}

          {invoice.status === 'draft' && !showVoidReason && (
            <div className="flex gap-3">
              <button onClick={handleSend} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Send className="w-4 h-4" />{loading ? 'Sending...' : 'Send Invoice'}
              </button>
            </div>
          )}

          {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && !showVoidReason && (
            <div className="flex gap-3">
              <button onClick={handleMarkPaid} disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                <CheckCircle className="w-4 h-4" />{loading ? 'Processing...' : 'Mark as Paid'}
              </button>
              {paymentMethod !== null && (
                <div className="flex gap-2 items-center">
                  <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Amount" />
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="">Method</option>
                    <option value="cash">Cash</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                    <option value="zelle">Zelle</option>
                    <option value="cashapp">Cash App</option>
                    <option value="paypal">PayPal</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              )}
              <button onClick={() => setShowVoidReason(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                <Ban className="w-4 h-4" />Void
              </button>
            </div>
          )}

          {showVoidReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700 mb-2">Void Invoice — provide a reason</p>
              <textarea rows={2} value={voidReason} onChange={e => setVoidReason(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm mb-3 resize-none"
                placeholder="Reason for voiding..." />
              <div className="flex gap-3">
                <button onClick={handleVoid} disabled={loading || !voidReason.trim()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                  {loading ? 'Voiding...' : 'Confirm Void'}
                </button>
                <button onClick={() => setShowVoidReason(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<(Invoice & { lineItems?: LineItem[] }) | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState({ totalOutstanding: 0, totalOverdue: 0, totalPaidThisMonth: 0 });

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'All') params.set('status', activeTab.toLowerCase());
      const res = await fetch(`/api/admin/invoices?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInvoices(data.invoices || []);
      // Compute summary
      const all: Invoice[] = data.invoices || [];
      const outstanding = all.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
        .reduce((s, i) => s + parseFloat(i.total || '0'), 0);
      const overdue = all.filter(i => i.status === 'overdue')
        .reduce((s, i) => s + parseFloat(i.total || '0'), 0);
      const paidThisMonth = all.filter(i => {
        if (i.status !== 'paid' || !i.paid_at) return false;
        const d = new Date(i.paid_at);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).reduce((s, i) => s + parseFloat(i.total || '0'), 0);
      setSummary({ totalOutstanding: outstanding, totalOverdue: overdue, totalPaidThisMonth: paidThisMonth });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  async function openDetail(invoice: Invoice) {
    setSelectedInvoice(invoice);
    // Fetch full details with line items
    try {
      const res = await fetch(`/api/admin/invoices/${invoice.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedInvoice({ ...invoice, ...data.invoice, lineItems: data.lineItems });
      }
    } catch (err) { console.error(err); }
  }

  async function handleAction(action: string, data?: any) {
    if (!selectedInvoice) return;
    setActionLoading(true);
    try {
      if (action === 'send') {
        const res = await fetch(`/api/admin/invoices/${selectedInvoice.id}/send`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}), // use client's email/phone on file
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to send invoice');
          return;
        }
      } else if (action === 'paid') {
        await fetch(`/api/admin/invoices/${selectedInvoice.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'paid', paid_at: new Date().toISOString(),
            payment_amount: data?.paymentAmount, payment_method: data?.paymentMethod,
          }),
        });
      } else if (action === 'void') {
        await fetch(`/api/admin/invoices/${selectedInvoice.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'void', void_reason: data?.voidReason }),
        });
      }
      setSelectedInvoice(null);
      await fetchInvoices();
    } catch (err) { console.error(err); }
    finally { setActionLoading(false); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <a href="/admin/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors w-fit">
          <Plus className="w-4 h-4" /> New Invoice
        </a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Outstanding', value: `$${summary.totalOutstanding.toFixed(2)}`, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Total Overdue', value: `$${summary.totalOverdue.toFixed(2)}`, color: 'text-red-700', bg: 'bg-red-50' },
          { label: 'Paid This Month', value: `$${summary.totalPaidThisMonth.toFixed(2)}`, color: 'text-green-700', bg: 'bg-green-50' },
        ].map(card => (
          <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
            <p className="text-xs font-semibold text-gray-500 uppercase">{card.label}</p>
            <p className={`text-xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Issue Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Due Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No invoices found</td></tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openDetail(inv)}>
                    <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{inv.client_name}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(inv.issue_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">${parseFloat(inv.total || '0').toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openDetail(inv)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <DetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onAction={handleAction}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
