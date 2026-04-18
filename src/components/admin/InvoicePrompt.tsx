'use client';

import { useState } from 'react';
import { FileText, Loader2, X, ExternalLink } from 'lucide-react';

interface InvoicePromptProps {
  jobLogId: number;
  existingInvoiceId?: number;
  existingInvoiceNumber?: string;
  onGenerated: (invoiceId: number) => void;
  onDismiss: () => void;
}

export default function InvoicePrompt({
  jobLogId,
  existingInvoiceId,
  existingInvoiceNumber,
  onGenerated,
  onDismiss,
}: InvoicePromptProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const res = await fetch(`/api/admin/invoices/from-job/${jobLogId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: dueDate.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to generate invoice.');
        return;
      }
      onGenerated(data.invoice.id);
    } catch (err) {
      setError('Failed to generate invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (existingInvoiceId && existingInvoiceNumber) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-green-600 shrink-0" />
          <span className="text-sm text-green-800">
            Invoice <strong>#{existingInvoiceNumber}</strong> already exists for this job.
          </span>
        </div>
        <a
          href={`/admin/invoices/${existingInvoiceId}/preview`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-green-700 font-medium hover:text-green-900 shrink-0"
        >
          View <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Generate an invoice for this completed job?
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              One-click invoice creation based on the job log data.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-blue-400 hover:text-blue-600 rounded transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-600 ml-6">{error}</p>
      )}
      <div className="flex gap-2 mt-3 ml-6">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
          {loading ? 'Creating...' : 'Generate Invoice'}
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
