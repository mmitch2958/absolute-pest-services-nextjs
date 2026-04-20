'use client';

import { useState } from 'react';
import { X, Loader2, Mail, Paperclip, Send } from 'lucide-react';

interface EmailInvoiceModalProps {
  invoiceId: number;
  invoiceNumber: string;
  clientEmail: string;
  clientName: string;
  defaultSubject?: string;
  onClose: () => void;
  onSent: () => void;
}

export default function EmailInvoiceModal({
  invoiceId,
  invoiceNumber,
  clientEmail,
  clientName,
  defaultSubject,
  onClose,
  onSent,
}: EmailInvoiceModalProps) {
  const [to, setTo] = useState(clientEmail || '');
  const [subject, setSubject] = useState(
    defaultSubject || `Invoice #${invoiceNumber} from Absolute Pest Services`
  );
  const [message, setMessage] = useState('');
  const [cc, setCc] = useState('');
  const [attachPdf, setAttachPdf] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!to.trim()) {
      setError('Please enter a recipient email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
          attachPdf,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to send invoice. Please try again.');
        return;
      }
      setSent(true);
      setTimeout(() => {
        onSent();
      }, 1500);
    } catch (err) {
      setError('Failed to send invoice. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Email Invoice</h2>
              <p className="text-xs text-gray-500">Invoice #{invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900">Invoice sent!</p>
              <p className="text-sm text-gray-500 mt-1">
                Sent to {to}
              </p>
            </div>
          ) : (
            <>
              {/* To */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="client@example.com"
                />
              </div>

              {/* CC */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  CC <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="email"
                  value={cc}
                  onChange={e => setCc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="cc@example.com"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="Invoice subject"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Personal Message <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  placeholder="Add a personal note to the client..."
                />
              </div>

              {/* Attach PDF */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="attachPdf"
                  checked={attachPdf}
                  onChange={e => setAttachPdf(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="attachPdf" className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                  <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                  Attach PDF copy of invoice
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Sending...' : 'Send Invoice'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
