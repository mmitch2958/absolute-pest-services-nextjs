import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import type { Metadata } from 'next';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Invoice — Absolute Pest Services',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ token: string }>;
}

const PAYMENT_METHODS = ['Cash', 'Credit', 'Debit', 'Zelle', 'Cash App', 'PayPal'];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
};

function fmtMoney(v: string | number | null | undefined): string {
  return `$${(parseFloat(String(v ?? '0')) || 0).toFixed(2)}`;
}

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function PublicInvoicePage({ params }: Props) {
  const { token } = await params;
  if (!token || token.length < 10) notFound();

  const rows = (await sql`
    SELECT i.*,
           c.name AS client_name, c.email AS client_email,
           c.phone AS client_phone, c.address AS client_address
    FROM invoices i
    JOIN clients c ON c.id = i.client_id
    WHERE i.view_token = ${token}
    LIMIT 1
  `) as any[];

  if (rows.length === 0) notFound();
  const inv = rows[0];

  const lineItems = (await sql`
    SELECT * FROM invoice_line_items
    WHERE invoice_id = ${inv.id}
    ORDER BY sort_order ASC
  `) as any[];

  // Mark "viewed" the first time a customer opens it
  if (inv.status === 'sent') {
    try {
      await sql`
        UPDATE invoices
        SET status = 'viewed', viewed_at = COALESCE(viewed_at, NOW()), updated_at = NOW()
        WHERE id = ${inv.id} AND status = 'sent'
      `;
      await sql`
        INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note)
        VALUES (${inv.id}, 'sent', 'viewed', 'customer', 'Customer opened invoice link')
      `;
    } catch (e) {
      console.error('[public invoice] viewed update failed', e);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Absolute Pest Services</h1>
            <p className="text-sm text-gray-500 mt-1">Serving PA &amp; DE</p>
            <p className="text-xs text-gray-400 mt-0.5">absolutepestservices.com</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</p>
            <p className="text-lg font-bold text-gray-900">{inv.invoice_number}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 ${statusColors[inv.status] || 'bg-gray-100 text-gray-700'}`}>
              {inv.status}
            </span>
          </div>
        </div>

        {/* Bill to / dates */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bill To</p>
            <p className="font-medium text-gray-900">{inv.client_name}</p>
            {inv.client_address && <p className="text-sm text-gray-600">{inv.client_address}</p>}
            {inv.client_email && <p className="text-sm text-gray-600">{inv.client_email}</p>}
            {inv.client_phone && <p className="text-sm text-gray-600">{inv.client_phone}</p>}
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Issue Date</p>
              <p className="text-sm text-gray-700">{fmtDate(inv.issue_date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Due Date</p>
              <p className="text-sm font-semibold text-gray-900">{fmtDate(inv.due_date)}</p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="px-8 pb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-600 uppercase w-16">Qty</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-600 uppercase w-24">Rate</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-600 uppercase w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.map((li: any) => (
                <tr key={li.id}>
                  <td className="py-3 text-gray-800">
                    <div>{li.description}</div>
                    {li.service_date && (
                      <div className="text-xs text-gray-400 mt-0.5">{fmtDate(li.service_date)}{li.technician_name ? ` · ${li.technician_name}` : ''}</div>
                    )}
                  </td>
                  <td className="py-3 text-right text-gray-700">{parseFloat(li.quantity).toFixed(2)}</td>
                  <td className="py-3 text-right text-gray-700">{fmtMoney(li.unit_rate)}</td>
                  <td className="py-3 text-right font-medium text-gray-900">{fmtMoney(li.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{fmtMoney(inv.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span><span>{fmtMoney(inv.tax_total)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 mt-2 font-bold text-base text-gray-900">
                <span>Total Due</span><span>{fmtMoney(inv.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {inv.notes && (
          <div className="px-8 pb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{inv.notes}</p>
          </div>
        )}

        {/* Payment methods */}
        {inv.status !== 'paid' && inv.status !== 'void' && (
          <div className="px-8 py-6 bg-green-50 border-t border-green-100">
            <p className="text-xs font-semibold text-green-900 uppercase mb-2">Accepted Payment Methods</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map(m => (
                <span key={m} className="inline-flex items-center px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-medium text-green-800">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-xs text-green-800 mt-3">
              Please contact us to arrange payment. Thank you!
            </p>
            {/* Placeholder for future Stripe "Pay Now" button */}
          </div>
        )}

        {inv.status === 'paid' && (
          <div className="px-8 py-6 bg-green-50 border-t border-green-100 text-center">
            <p className="text-base font-bold text-green-700">PAID</p>
            {inv.paid_at && <p className="text-xs text-green-700 mt-0.5">on {fmtDate(inv.paid_at)}</p>}
          </div>
        )}

        {inv.status === 'void' && (
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-base font-bold text-gray-500">VOID</p>
            {inv.void_reason && <p className="text-xs text-gray-500 mt-0.5">{inv.void_reason}</p>}
          </div>
        )}

        <div className="px-8 py-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center print:hidden">
          Questions? Reply to the email or call us. Thank you for choosing Absolute Pest Services.
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-4 flex justify-center print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
