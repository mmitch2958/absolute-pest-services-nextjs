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
