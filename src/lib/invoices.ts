import { sql } from '@/lib/db';
import { randomUUID } from 'crypto';

export type PropertyType = 'residential' | 'commercial' | string | null | undefined;

export interface LineItemInput {
  description: string;
  quantity: number | string;
  unitRate: number | string;
  taxRate?: number | string;
  jobLogId?: number | null;
  serviceDate?: string | null;
  technicianName?: string | null;
  serviceType?: string | null;
  serviceAddress?: string | null;
  servicedArea?: string | null;
  materials?: any;
}

export interface ComputedLineItem extends LineItemInput {
  lineTotal: string;
  lineTax: string;
}

export interface ComputedTotals {
  items: ComputedLineItem[];
  subtotal: string;
  taxTotal: string;
  total: string;
}

function toNum(v: number | string | undefined | null, fallback = 0): number {
  if (v === null || v === undefined || v === '') return fallback;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? fallback : n;
}

function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

export function computeTotals(items: LineItemInput[]): ComputedTotals {
  let subtotal = 0;
  let taxTotal = 0;
  const computed: ComputedLineItem[] = items.map((item) => {
    const qty = toNum(item.quantity, 1);
    const rate = toNum(item.unitRate, 0);
    const tax = toNum(item.taxRate, 0);
    const lineTotal = qty * rate;
    const lineTax = lineTotal * (tax / 100);
    subtotal += lineTotal;
    taxTotal += lineTax;
    return {
      ...item,
      lineTotal: fmt(lineTotal),
      lineTax: fmt(lineTax),
    };
  });
  return {
    items: computed,
    subtotal: fmt(subtotal),
    taxTotal: fmt(taxTotal),
    total: fmt(subtotal + taxTotal),
  };
}

/** Residential = due on receipt (issue date). Commercial = Net 15. */
export function dueDateFor(propertyType: PropertyType, issueDate: Date = new Date()): Date {
  const d = new Date(issueDate);
  if (propertyType === 'commercial') {
    d.setDate(d.getDate() + 15);
  }
  return d;
}

/** Generate next sequential invoice number for the current year. INV-YYYY-NNNN */
export async function generateInvoiceNumber(year: number = new Date().getFullYear()): Promise<string> {
  const prefix = `INV-${year}-`;
  const rows = (await sql`
    SELECT invoice_number FROM invoices
    WHERE invoice_number LIKE ${prefix + '%'}
    ORDER BY invoice_number DESC
    LIMIT 1
  `) as Array<{ invoice_number: string }>;

  let next = 1;
  if (rows.length > 0) {
    const last = rows[0].invoice_number;
    const match = last.match(/INV-\d{4}-(\d+)$/);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `${prefix}${String(next).padStart(4, '0')}`;
}

export function newViewToken(): string {
  return randomUUID();
}

/** Error carrying an HTTP status, for invoice creation helpers. */
export class InvoiceCreationError extends Error {
  status: number;
  constructor(message: string, status: number = 400) {
    super(message);
    this.status = status;
  }
}

export interface CreateInvoiceFromJobInput {
  jobLogId: number;
  userId: number;
  taxRate?: number | null;
  notes?: string | null;
  lineItemsOverride?: LineItemInput[] | null;
  dueDate?: Date | null;
}

/**
 * Create a draft invoice from a job log (Mode 1 of POST /api/admin/invoices).
 * Requires the job log to have a linked client. Marks the job log as
 * 'invoiced' so it shows as billed across the portal.
 */
export async function createInvoiceForJobLog(opts: CreateInvoiceFromJobInput) {
  const { jobLogId, userId } = opts;

  const jl = (await sql`
    SELECT j.id, j.client_id, j.customer_name, j.amount, j.work_performed,
           j.serviced_area, j.site_address, j.site_location, j.job_date,
           j.materials, fe.name AS technician_name,
           c.property_type
    FROM job_logs j
    LEFT JOIN field_employees fe ON fe.id = j.employee_id
    LEFT JOIN clients c ON c.id = j.client_id
    WHERE j.id = ${Number(jobLogId)}
    LIMIT 1
  `) as any[];

  if (jl.length === 0) {
    throw new InvoiceCreationError('Job log not found', 404);
  }
  const job = jl[0];
  if (!job.client_id) {
    throw new InvoiceCreationError(
      'This job log has no linked client. Open it in admin and link a client first, or create the invoice manually.',
      400,
    );
  }

  const propertyType: PropertyType = job.property_type || 'residential';

  // Allow caller to override line items (e.g. tech edits the amount); else build a single line from the job
  let items: LineItemInput[];
  if (Array.isArray(opts.lineItemsOverride) && opts.lineItemsOverride.length > 0) {
    items = opts.lineItemsOverride;
  } else {
    items = [{
      description: `${job.serviced_area} — ${job.site_location}`.trim(),
      quantity: 1,
      unitRate: job.amount ?? '0',
      taxRate: opts.taxRate ?? 0,
      jobLogId: job.id,
      serviceDate: job.job_date,
      technicianName: job.technician_name,
      serviceType: job.serviced_area,
      serviceAddress: job.site_address,
      servicedArea: job.serviced_area,
      materials: job.materials,
    }];
  }

  // Apply default tax rate to lines that don't specify their own
  if (opts.taxRate !== undefined && opts.taxRate !== null) {
    const defaultTaxRate = opts.taxRate;
    items = items.map(it => ({ ...it, taxRate: it.taxRate ?? defaultTaxRate }));
  }

  if (!items.length) {
    throw new InvoiceCreationError('At least one line item is required', 400);
  }

  const totals = computeTotals(items);
  const issueDate = new Date();
  const dueDate = opts.dueDate ?? dueDateFor(propertyType, issueDate);
  const invoiceNumber = await generateInvoiceNumber(issueDate.getFullYear());
  const viewToken = newViewToken();

  // Insert invoice
  const invRows = (await sql`
    INSERT INTO invoices (
      invoice_number, client_id, job_log_id, status,
      issue_date, due_date,
      subtotal, tax_total, total,
      notes, view_token, created_by
    ) VALUES (
      ${invoiceNumber}, ${job.client_id}, ${job.id}, 'draft',
      ${issueDate.toISOString()}, ${dueDate.toISOString()},
      ${totals.subtotal}, ${totals.taxTotal}, ${totals.total},
      ${opts.notes || null}, ${viewToken}, ${userId}
    )
    RETURNING *
  `) as any[];
  const invoice = invRows[0];

  // Line items
  if (totals.items.length > 0) {
    await Promise.all(
      totals.items.map((li, i) => sql`
        INSERT INTO invoice_line_items (
          invoice_id, description, quantity, unit_rate, tax_rate,
          line_total, line_tax, materials, sort_order,
          service_date, technician_name, service_type,
          service_address, serviced_area, job_log_id
        ) VALUES (
          ${invoice.id}, ${li.description}, ${String(li.quantity ?? 1)},
          ${String(li.unitRate)}, ${String(li.taxRate ?? 0)},
          ${li.lineTotal}, ${li.lineTax},
          ${li.materials ? JSON.stringify(li.materials) : null}, ${i},
          ${li.serviceDate || null}, ${li.technicianName || null},
          ${li.serviceType || null}, ${li.serviceAddress || null},
          ${li.servicedArea || null}, ${li.jobLogId || null}
        )
      `),
    );
  }

  // Status log
  await sql`
    INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note)
    VALUES (${invoice.id}, NULL, 'draft', ${'admin:' + userId}, 'Invoice created from job log')
  `;

  // Mark the job log as invoiced so it shows as billed across the portal
  try {
    await sql`
      UPDATE job_logs
      SET status = 'invoiced'
      WHERE id = ${job.id} AND status NOT IN ('invoiced', 'paid', 'cancelled')
    `;
  } catch (statusErr) {
    console.error('[invoices] Error marking job log invoiced:', statusErr);
  }

  return invoice;
}
